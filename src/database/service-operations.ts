import type { SQLiteDatabase } from 'expo-sqlite';

import { isAllowedServiceDate, nextDue, serviceTotal } from '../utils/business-rules.ts';

export type ServiceDatabase = Pick<SQLiteDatabase, 'getFirstAsync' | 'getAllAsync' | 'runAsync' | 'withTransactionAsync'>;

export type ServiceWrite = {
  vehicle_id: number;
  activity_id: number | null;
  date: string;
  mileage: number;
  kind: string;
  description: string;
  provider: string;
  labor: number;
  parts: number;
  other: number;
};

type ActivitySchedule = {
  id: number;
  vehicle_id: number;
  due_date: string | null;
  due_mileage: number | null;
  period_days: number | null;
  period_km: number | null;
};

type ServiceRow = ServiceWrite & { id: number };
type ServiceListRow = ServiceRow & { plate: string; total: number };

export const derivedEffectsSchema = `
  CREATE TABLE IF NOT EXISTS activity_schedule_baselines (
    activity_id INTEGER PRIMARY KEY REFERENCES activities(id) ON DELETE CASCADE,
    due_date TEXT,
    due_mileage INTEGER
  );
  CREATE TABLE IF NOT EXISTS activity_service_schedule (
    service_id INTEGER PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE,
    activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    period_days INTEGER,
    period_km INTEGER
  );
  CREATE INDEX IF NOT EXISTS activity_service_schedule_activity_idx ON activity_service_schedule(activity_id);
  CREATE TABLE IF NOT EXISTS vehicle_odometer_baselines (
    vehicle_id INTEGER PRIMARY KEY REFERENCES vehicles(id) ON DELETE CASCADE,
    mileage INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS vehicle_service_odometer_effects (
    service_id INTEGER PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS vehicle_service_odometer_vehicle_idx ON vehicle_service_odometer_effects(vehicle_id);
`;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function validateService(service: ServiceWrite, today: string) {
  if (!Number.isInteger(service.vehicle_id) || service.vehicle_id <= 0) throw new Error('Selecciona un vehículo válido.');
  if (!isAllowedServiceDate(service.date, today)) throw new Error('La fecha del servicio debe ser válida y no futura.');
  if (!Number.isInteger(service.mileage) || service.mileage < 0) throw new Error('El kilometraje debe ser un entero no negativo.');
  if (service.kind !== 'Preventivo' && service.kind !== 'Correctivo') throw new Error('Selecciona un tipo de servicio válido.');
  if (!service.description.trim()) throw new Error('La descripción del servicio es obligatoria.');
  serviceTotal(service.labor, service.parts, service.other);
}

async function requireActivityForVehicle(db: ServiceDatabase, activityId: number, vehicleId: number) {
  const activity = await db.getFirstAsync<ActivitySchedule>('SELECT id, vehicle_id, due_date, due_mileage, period_days, period_km FROM activities WHERE id = ?', activityId);
  if (!activity) throw new Error('La actividad vinculada ya no existe.');
  if (activity.vehicle_id !== vehicleId) throw new Error('La actividad debe pertenecer al mismo vehículo del servicio.');
  return activity;
}

async function ensureActivityBaseline(db: ServiceDatabase, activity: ActivitySchedule) {
  const existing = await db.getFirstAsync<{ activity_id: number }>('SELECT activity_id FROM activity_schedule_baselines WHERE activity_id = ?', activity.id);
  if (!existing) {
    await db.runAsync('INSERT INTO activity_schedule_baselines (activity_id, due_date, due_mileage) VALUES (?, ?, ?)', activity.id, activity.due_date, activity.due_mileage);
  }
}

async function ensureOdometerBaseline(db: ServiceDatabase, vehicleId: number) {
  const existing = await db.getFirstAsync<{ vehicle_id: number }>('SELECT vehicle_id FROM vehicle_odometer_baselines WHERE vehicle_id = ?', vehicleId);
  if (existing) return;
  const vehicle = await db.getFirstAsync<{ mileage: number }>('SELECT mileage FROM vehicles WHERE id = ?', vehicleId);
  if (!vehicle) throw new Error('El vehículo del servicio ya no existe.');
  await db.runAsync('INSERT INTO vehicle_odometer_baselines (vehicle_id, mileage) VALUES (?, ?)', vehicleId, vehicle.mileage);
}

async function recalculateActivitySchedule(db: ServiceDatabase, activityId: number) {
  const baseline = await db.getFirstAsync<{ due_date: string | null; due_mileage: number | null }>(
    'SELECT due_date, due_mileage FROM activity_schedule_baselines WHERE activity_id = ?', activityId,
  );
  if (!baseline) return;

  const events = await db.getAllAsync<{ date: string; mileage: number; period_days: number | null; period_km: number | null }>(
    `SELECT s.date, s.mileage, e.period_days, e.period_km
     FROM activity_service_schedule e JOIN services s ON s.id = e.service_id
     WHERE e.activity_id = ? ORDER BY s.date ASC, s.id ASC`, activityId,
  );
  let dueDate = baseline.due_date;
  let dueMileage = baseline.due_mileage;
  for (const event of events) {
    const next = nextDue(event.date, event.mileage, event.period_days, event.period_km);
    dueDate = next.dueDate ?? dueDate;
    dueMileage = next.dueMileage ?? dueMileage;
  }

  await db.runAsync('UPDATE activities SET due_date = ?, due_mileage = ? WHERE id = ?', dueDate, dueMileage, activityId);
  if (events.length === 0) {
    await db.runAsync('DELETE FROM activity_schedule_baselines WHERE activity_id = ?', activityId);
  }
}

async function recalculateVehicleOdometer(db: ServiceDatabase, vehicleId: number) {
  const baseline = await db.getFirstAsync<{ mileage: number }>('SELECT mileage FROM vehicle_odometer_baselines WHERE vehicle_id = ?', vehicleId);
  if (!baseline) return;
  const highestService = await db.getFirstAsync<{ mileage: number | null }>(
    `SELECT MAX(s.mileage) AS mileage FROM vehicle_service_odometer_effects e
     JOIN services s ON s.id = e.service_id WHERE e.vehicle_id = ?`, vehicleId,
  );
  const mileage = Math.max(baseline.mileage, highestService?.mileage ?? baseline.mileage);
  await db.runAsync('UPDATE vehicles SET mileage = ? WHERE id = ?', mileage, vehicleId);
  const remaining = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM vehicle_service_odometer_effects WHERE vehicle_id = ?', vehicleId);
  if (!remaining?.count) await db.runAsync('DELETE FROM vehicle_odometer_baselines WHERE vehicle_id = ?', vehicleId);
}

export async function resetOdometerEffects(db: ServiceDatabase, vehicleId: number, mileage: number) {
  await db.runAsync('DELETE FROM vehicle_service_odometer_effects WHERE vehicle_id = ?', vehicleId);
  await db.runAsync(
    `INSERT INTO vehicle_odometer_baselines (vehicle_id, mileage) VALUES (?, ?)
     ON CONFLICT(vehicle_id) DO UPDATE SET mileage = excluded.mileage`, vehicleId, mileage,
  );
}

export async function invalidateActivityScheduleEffects(db: ServiceDatabase, activityId: number) {
  await db.runAsync('DELETE FROM activity_service_schedule WHERE activity_id = ?', activityId);
  await db.runAsync('DELETE FROM activity_schedule_baselines WHERE activity_id = ?', activityId);
}

export async function deleteActivity(db: ServiceDatabase, activityId: number) {
  await db.withTransactionAsync(async () => {
    const activity = await db.getFirstAsync<{ id: number }>('SELECT id FROM activities WHERE id = ?', activityId);
    if (!activity) throw new Error('La actividad ya no existe.');
    const history = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM services WHERE activity_id = ?', activityId);
    if ((history?.count ?? 0) > 0) throw new Error('No se puede eliminar: la actividad tiene servicios asociados en el historial.');
    await invalidateActivityScheduleEffects(db, activityId);
    await db.runAsync('DELETE FROM activities WHERE id = ?', activityId);
  });
}

export async function addService(db: ServiceDatabase, service: ServiceWrite, today = todayISO()) {
  validateService(service, today);
  let serviceId = 0;
  await db.withTransactionAsync(async () => {
    const vehicle = await db.getFirstAsync<{ id: number }>('SELECT id FROM vehicles WHERE id = ?', service.vehicle_id);
    if (!vehicle) throw new Error('El vehículo del servicio ya no existe.');
    const activity = service.activity_id === null ? null : await requireActivityForVehicle(db, service.activity_id, service.vehicle_id);

    await ensureOdometerBaseline(db, service.vehicle_id);
    if (activity) await ensureActivityBaseline(db, activity);

    const result = await db.runAsync(
      `INSERT INTO services (vehicle_id, activity_id, date, mileage, kind, description, provider, labor, parts, other)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      service.vehicle_id, service.activity_id, service.date, service.mileage, service.kind,
      service.description.trim(), service.provider.trim(), service.labor, service.parts, service.other,
    );
    serviceId = result.lastInsertRowId;
    await db.runAsync('INSERT INTO vehicle_service_odometer_effects (service_id, vehicle_id) VALUES (?, ?)', serviceId, service.vehicle_id);
    if (activity) {
      await db.runAsync(
        'INSERT INTO activity_service_schedule (service_id, activity_id, period_days, period_km) VALUES (?, ?, ?, ?)',
        serviceId, activity.id, activity.period_days, activity.period_km,
      );
      await recalculateActivitySchedule(db, activity.id);
    }
    await recalculateVehicleOdometer(db, service.vehicle_id);
  });
  return serviceId;
}

export async function updateService(db: ServiceDatabase, serviceId: number, service: ServiceWrite, today = todayISO()) {
  validateService(service, today);
  await db.withTransactionAsync(async () => {
    const current = await db.getFirstAsync<ServiceRow>('SELECT * FROM services WHERE id = ?', serviceId);
    if (!current) throw new Error('El servicio que intentas editar ya no existe.');

    const odometerEffect = await db.getFirstAsync<{ service_id: number }>('SELECT service_id FROM vehicle_service_odometer_effects WHERE service_id = ?', serviceId);
    if (!odometerEffect && (current.vehicle_id !== service.vehicle_id || current.mileage !== service.mileage)) {
      throw new Error('No se puede cambiar el vehículo o kilometraje: el servicio es anterior al registro de efectos y no es posible reconstruir el odómetro sin alterar datos.');
    }

    const currentSchedule = current.activity_id === null ? null : await db.getFirstAsync<{ period_days: number | null; period_km: number | null }>(
      'SELECT period_days, period_km FROM activity_service_schedule WHERE service_id = ?', serviceId,
    );
    if (current.activity_id !== null && !currentSchedule) {
      throw new Error('No se puede editar este servicio asociado: su vencimiento fue calculado por una versión anterior y no se puede reconstruir con seguridad.');
    }

    const nextActivity = service.activity_id === null ? null : await requireActivityForVehicle(db, service.activity_id, service.vehicle_id);
    const oldActivityId = current.activity_id;
    const oldVehicleId = current.vehicle_id;

    if (odometerEffect && oldVehicleId !== service.vehicle_id) await ensureOdometerBaseline(db, service.vehicle_id);
    if (nextActivity && nextActivity.id !== oldActivityId) await ensureActivityBaseline(db, nextActivity);

    await db.runAsync(
      `UPDATE services SET vehicle_id = ?, activity_id = ?, date = ?, mileage = ?, kind = ?, description = ?, provider = ?, labor = ?, parts = ?, other = ? WHERE id = ?`,
      service.vehicle_id, service.activity_id, service.date, service.mileage, service.kind,
      service.description.trim(), service.provider.trim(), service.labor, service.parts, service.other, serviceId,
    );

    if (odometerEffect) {
      await db.runAsync('UPDATE vehicle_service_odometer_effects SET vehicle_id = ? WHERE service_id = ?', service.vehicle_id, serviceId);
    }

    if (oldActivityId !== service.activity_id) {
      await db.runAsync('DELETE FROM activity_service_schedule WHERE service_id = ?', serviceId);
      if (nextActivity) {
        await db.runAsync(
          'INSERT INTO activity_service_schedule (service_id, activity_id, period_days, period_km) VALUES (?, ?, ?, ?)',
          serviceId, nextActivity.id, nextActivity.period_days, nextActivity.period_km,
        );
      }
    }

    if (oldActivityId !== null && oldActivityId !== service.activity_id) await recalculateActivitySchedule(db, oldActivityId);
    if (service.activity_id !== null) await recalculateActivitySchedule(db, service.activity_id);
    if (odometerEffect && oldVehicleId !== service.vehicle_id) await recalculateVehicleOdometer(db, oldVehicleId);
    if (odometerEffect) await recalculateVehicleOdometer(db, service.vehicle_id);
  });
}

export async function deleteService(db: ServiceDatabase, serviceId: number) {
  await db.withTransactionAsync(async () => {
    const service = await db.getFirstAsync<ServiceRow>('SELECT * FROM services WHERE id = ?', serviceId);
    if (!service) throw new Error('El servicio que intentas eliminar ya no existe.');
    const odometerEffect = await db.getFirstAsync<{ service_id: number }>('SELECT service_id FROM vehicle_service_odometer_effects WHERE service_id = ?', serviceId);
    if (!odometerEffect) {
      throw new Error('No se puede eliminar este servicio: una versión anterior pudo usarlo para actualizar el odómetro y no se puede reconstruir ese valor con seguridad.');
    }

    if (service.activity_id !== null) {
      const scheduleEffect = await db.getFirstAsync<{ service_id: number }>('SELECT service_id FROM activity_service_schedule WHERE service_id = ?', serviceId);
      if (!scheduleEffect) {
        throw new Error('No se puede eliminar este servicio asociado: el vencimiento se calculó por una versión anterior y no se puede reconstruir con seguridad.');
      }
    }

    await db.runAsync('DELETE FROM services WHERE id = ?', serviceId);
    if (service.activity_id !== null) await recalculateActivitySchedule(db, service.activity_id);
    await recalculateVehicleOdometer(db, service.vehicle_id);
  });
}

export async function listServices(db: ServiceDatabase, vehicleId?: number) {
  const query = vehicleId === undefined
    ? `SELECT s.*, v.plate, (s.labor + s.parts + s.other) AS total FROM services s
       JOIN vehicles v ON v.id = s.vehicle_id ORDER BY s.date DESC, s.id DESC`
    : `SELECT s.*, v.plate, (s.labor + s.parts + s.other) AS total FROM services s
       JOIN vehicles v ON v.id = s.vehicle_id WHERE s.vehicle_id = ? ORDER BY s.date DESC, s.id DESC`;
  return vehicleId === undefined
    ? db.getAllAsync<ServiceListRow>(query)
    : db.getAllAsync<ServiceListRow>(query, vehicleId);
}
