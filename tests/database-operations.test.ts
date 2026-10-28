import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import {
  addService,
  deleteActivity,
  deleteService,
  derivedEffectsSchema,
  listServices,
  updateService,
  type ServiceDatabase,
  type ServiceWrite,
} from '../src/database/service-operations.ts';

function createStore() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(`PRAGMA foreign_keys = ON;
    CREATE TABLE vehicles (id INTEGER PRIMARY KEY, plate TEXT NOT NULL UNIQUE, type TEXT NOT NULL, brand TEXT NOT NULL, line TEXT NOT NULL, model TEXT NOT NULL, year INTEGER NOT NULL, mileage INTEGER NOT NULL, color TEXT, vin TEXT, fuel TEXT, displacement TEXT, active INTEGER NOT NULL DEFAULT 1, primary_vehicle INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE readings (id INTEGER PRIMARY KEY, vehicle_id INTEGER NOT NULL REFERENCES vehicles(id), date TEXT NOT NULL, mileage INTEGER NOT NULL);
    CREATE TABLE activities (id INTEGER PRIMARY KEY, vehicle_id INTEGER NOT NULL REFERENCES vehicles(id), name TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', due_date TEXT, due_mileage INTEGER, advance_days INTEGER NOT NULL DEFAULT 14, advance_km INTEGER NOT NULL DEFAULT 500, period_days INTEGER, period_km INTEGER, paused INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE services (id INTEGER PRIMARY KEY, vehicle_id INTEGER NOT NULL REFERENCES vehicles(id), activity_id INTEGER REFERENCES activities(id), date TEXT NOT NULL, mileage INTEGER NOT NULL, kind TEXT NOT NULL, description TEXT NOT NULL, provider TEXT NOT NULL DEFAULT '', labor REAL NOT NULL, parts REAL NOT NULL, other REAL NOT NULL);`);
  sqlite.exec(derivedEffectsSchema);

  const db = {
    getFirstAsync: async <T>(sql: string, ...params: (string | number | null)[]) => {
      const row = sqlite.prepare(sql).get(...params);
      return row === undefined ? null : row as T;
    },
    getAllAsync: async <T>(sql: string, ...params: (string | number | null)[]) =>
      sqlite.prepare(sql).all(...params) as T[],
    runAsync: async (sql: string, ...params: (string | number | null)[]) => {
      const result = sqlite.prepare(sql).run(...params);
      return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
    },
    withTransactionAsync: async (task: () => Promise<void>) => {
      sqlite.exec('BEGIN IMMEDIATE');
      try {
        await task();
        sqlite.exec('COMMIT');
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  } as unknown as ServiceDatabase;

  const addVehicle = (id: number, plate: string, mileage: number, active = 1) => {
    sqlite.prepare('INSERT INTO vehicles (id, plate, type, brand, line, model, year, mileage, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, plate, 'Automóvil', 'Marca', 'Línea', 'Modelo', 2022, mileage, active);
  };
  const addActivity = (id: number, vehicleId: number) => {
    sqlite.prepare('INSERT INTO activities (id, vehicle_id, name, category, description, due_date, due_mileage, period_days, period_km) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, vehicleId, 'Cambio de aceite', 'Motor', '', '2026-11-01', 11000, 90, 5000);
  };

  return { db, sqlite, addVehicle, addActivity };
}

function service(vehicleId: number, date: string, mileage: number, activityId: number | null = null): ServiceWrite {
  return {
    vehicle_id: vehicleId,
    activity_id: activityId,
    date,
    mileage,
    kind: 'Preventivo',
    description: 'Servicio registrado',
    provider: 'Taller',
    labor: 100,
    parts: 200,
    other: 0,
  };
}

test('elimina actividad sin historial y conserva la integridad SQLite', async () => {
  const { db, sqlite, addVehicle, addActivity } = createStore();
  addVehicle(1, 'AAA111', 10000);
  addActivity(1, 1);

  await deleteActivity(db, 1);

  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM activities WHERE id = 1').get()?.count, 0);
  assert.equal(sqlite.prepare('PRAGMA foreign_key_check').all().length, 0);
  sqlite.close();
});

test('bloquea eliminar actividad con servicios vinculados y conserva historial', async () => {
  const { db, sqlite, addVehicle, addActivity } = createStore();
  addVehicle(1, 'AAA111', 10000);
  addActivity(1, 1);
  await addService(db, service(1, '2026-10-01', 10000, 1), '2026-10-27');

  await assert.rejects(deleteActivity(db, 1), /tiene servicios asociados/);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM activities WHERE id = 1').get()?.count, 1);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM services WHERE activity_id = 1').get()?.count, 1);
  sqlite.close();
});

test('edita servicio sin duplicarlo y restaura vencimientos y odómetro al borrarlo', async () => {
  const { db, sqlite, addVehicle, addActivity } = createStore();
  addVehicle(1, 'AAA111', 10000);
  addActivity(1, 1);
  const firstId = await addService(db, service(1, '2026-10-01', 11000, 1), '2026-10-27');
  const secondId = await addService(db, service(1, '2026-10-15', 12000, 1), '2026-10-27');
  const edited = { ...service(1, '2026-10-20', 11500, 1), description: 'Cambio de aceite y filtro', labor: 300 };

  await updateService(db, secondId, edited, '2026-10-27');
  const services = await listServices(db, 1);
  assert.equal(services.length, 2);
  assert.equal(services[0]?.id, secondId);
  assert.equal(services[0]?.description, edited.description);
  assert.equal(services[0]?.labor, edited.labor);
  assert.equal(sqlite.prepare('SELECT due_date, due_mileage FROM activities WHERE id = 1').get()?.due_date, '2027-01-18');
  assert.equal(sqlite.prepare('SELECT mileage FROM vehicles WHERE id = 1').get()?.mileage, 11500);

  await deleteService(db, secondId);
  assert.equal((await listServices(db, 1)).length, 1);
  assert.equal(sqlite.prepare('SELECT mileage FROM vehicles WHERE id = 1').get()?.mileage, 11000);
  await deleteService(db, firstId);
  assert.equal((await listServices(db, 1)).length, 0);
  assert.equal(sqlite.prepare('SELECT due_date, due_mileage FROM activities WHERE id = 1').get()?.due_date, '2026-11-01');
  assert.equal(sqlite.prepare('SELECT due_mileage FROM activities WHERE id = 1').get()?.due_mileage, 11000);
  assert.equal(sqlite.prepare('SELECT mileage FROM vehicles WHERE id = 1').get()?.mileage, 10000);
  assert.equal(sqlite.prepare('PRAGMA foreign_key_check').all().length, 0);
  sqlite.close();
});

test('filtra historial por vehículo, ordena por fecha y conserva archivados', async () => {
  const { db, sqlite, addVehicle } = createStore();
  addVehicle(1, 'AAA111', 10000, 0);
  addVehicle(2, 'BBB222', 20000, 1);
  await addService(db, service(1, '2026-10-01', 10000), '2026-10-27');
  await addService(db, service(1, '2026-10-20', 10100), '2026-10-27');
  await addService(db, service(2, '2026-10-15', 20000), '2026-10-27');

  const archivedHistory = await listServices(db, 1);
  assert.deepEqual(archivedHistory.map((item) => item.date), ['2026-10-20', '2026-10-01']);
  assert.ok(archivedHistory.every((item) => item.plate === 'AAA111'));
  assert.deepEqual((await listServices(db, 2)).map((item) => item.plate), ['BBB222']);
  assert.deepEqual(await listServices(db, 3), []);
  assert.equal((await listServices(db)).length, 3);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM vehicles WHERE active = 0').get()?.count, 1);
  sqlite.close();
});

test('impide alterar o borrar servicio antiguo si no puede reconstruir sus efectos', async () => {
  const { db, sqlite, addVehicle, addActivity } = createStore();
  addVehicle(1, 'AAA111', 12000);
  addActivity(1, 1);
  sqlite.prepare('INSERT INTO services (id, vehicle_id, activity_id, date, mileage, kind, description, provider, labor, parts, other) VALUES (1, 1, 1, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run('2026-10-01', 11000, 'Preventivo', 'Servicio legado', 'Taller', 10, 20, 0);

  await assert.rejects(deleteService(db, 1), /versi.n anterior/);
  await assert.rejects(updateService(db, 1, { ...service(1, '2026-10-02', 11000, 1), description: 'Modificado' }, '2026-10-27'), /no se puede reconstruir/);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM services WHERE id = 1').get()?.count, 1);
  assert.equal(sqlite.prepare('SELECT due_date FROM activities WHERE id = 1').get()?.due_date, '2026-11-01');
  sqlite.close();
});
