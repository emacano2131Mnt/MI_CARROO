import * as SQLite from 'expo-sqlite';
import {
  addService as addServiceOperation,
  deleteActivity as deleteActivityOperation,
  deleteService as deleteServiceOperation,
  derivedEffectsSchema,
  invalidateActivityScheduleEffects,
  listServices as listServicesOperation,
  resetOdometerEffects,
  updateService as updateServiceOperation,
} from '@/database/service-operations';

let database: Promise<SQLite.SQLiteDatabase> | undefined;
export function getDatabase() {
  database ??= SQLite.openDatabaseAsync('micarro.db');
  return database;
}

export async function initializeDatabase() {
  const db = await getDatabase();
  await db.execAsync(`PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS vehicles (id INTEGER PRIMARY KEY, plate TEXT NOT NULL UNIQUE, type TEXT NOT NULL, brand TEXT NOT NULL, line TEXT NOT NULL, model TEXT NOT NULL, year INTEGER NOT NULL CHECK(year >= 0), mileage INTEGER NOT NULL CHECK(mileage >= 0), color TEXT, vin TEXT, fuel TEXT, displacement TEXT, active INTEGER NOT NULL DEFAULT 1, primary_vehicle INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS readings (id INTEGER PRIMARY KEY, vehicle_id INTEGER NOT NULL REFERENCES vehicles(id), date TEXT NOT NULL, mileage INTEGER NOT NULL CHECK(mileage >= 0));
    CREATE TABLE IF NOT EXISTS activities (id INTEGER PRIMARY KEY, vehicle_id INTEGER NOT NULL REFERENCES vehicles(id), name TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', due_date TEXT, due_mileage INTEGER, advance_days INTEGER NOT NULL DEFAULT 14, advance_km INTEGER NOT NULL DEFAULT 500, period_days INTEGER, period_km INTEGER, paused INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS services (id INTEGER PRIMARY KEY, vehicle_id INTEGER NOT NULL REFERENCES vehicles(id), activity_id INTEGER REFERENCES activities(id), date TEXT NOT NULL, mileage INTEGER NOT NULL CHECK(mileage >= 0), kind TEXT NOT NULL, description TEXT NOT NULL, provider TEXT NOT NULL DEFAULT '', labor REAL NOT NULL CHECK(labor >= 0), parts REAL NOT NULL CHECK(parts >= 0), other REAL NOT NULL CHECK(other >= 0));`);
  await db.execAsync(derivedEffectsSchema);
}

export type Vehicle = { id: number; plate: string; type: string; brand: string; line: string; model: string; year: number; mileage: number; color: string | null; vin: string | null; fuel: string | null; displacement: string | null; active: number; primary_vehicle: number };
export type Activity = { id: number; vehicle_id: number; name: string; category: string; description: string; due_date: string | null; due_mileage: number | null; advance_days: number; advance_km: number; period_days: number | null; period_km: number | null; paused: number };
export type Service = { id: number; vehicle_id: number; activity_id: number | null; date: string; mileage: number; kind: string; description: string; provider: string; labor: number; parts: number; other: number; plate?: string; total?: number };

export async function listVehicles(includeArchived = true) {
  const db = await getDatabase();
  return db.getAllAsync<Vehicle>(`SELECT * FROM vehicles ${includeArchived ? '' : 'WHERE active = 1'} ORDER BY primary_vehicle DESC, brand, model`);
}
export async function saveVehicle(v: Omit<Vehicle, 'id'|'active'|'primary_vehicle'|'color'|'vin'|'fuel'|'displacement'> & Partial<Pick<Vehicle,'id'|'color'|'vin'|'fuel'|'displacement'>>) {
  const db = await getDatabase(); const plate = v.plate.trim().toUpperCase().replace(/\s+/g, '');
  const duplicate = await db.getFirstAsync<{ id: number }>('SELECT id FROM vehicles WHERE plate = ? AND id != ?', plate, v.id ?? -1);
  if (duplicate) throw new Error('Ya existe un vehículo con esa placa.');
  if (v.id) { const vehicleId=v.id; await db.withTransactionAsync(async()=>{const current=await db.getFirstAsync<{mileage:number}>('SELECT mileage FROM vehicles WHERE id=?',vehicleId);await db.runAsync('UPDATE vehicles SET plate=?,type=?,brand=?,line=?,model=?,year=?,mileage=?,color=?,vin=?,fuel=?,displacement=? WHERE id=?', plate,v.type,v.brand,v.line,v.model,v.year,v.mileage,v.color??null,v.vin??null,v.fuel??null,v.displacement??null,vehicleId);if(current&&current.mileage!==v.mileage){await db.runAsync('INSERT INTO readings (vehicle_id,date,mileage) VALUES (?,?,?)',vehicleId,new Date().toISOString().slice(0,10),v.mileage);await resetOdometerEffects(db,vehicleId,v.mileage);}}); }
  else await db.withTransactionAsync(async()=>{const result=await db.runAsync('INSERT INTO vehicles (plate,type,brand,line,model,year,mileage,color,vin,fuel,displacement) VALUES (?,?,?,?,?,?,?,?,?,?,?)', plate,v.type,v.brand,v.line,v.model,v.year,v.mileage,v.color??null,v.vin??null,v.fuel??null,v.displacement??null);await db.runAsync('INSERT INTO readings (vehicle_id,date,mileage) VALUES (?,?,?)',result.lastInsertRowId,new Date().toISOString().slice(0,10),v.mileage);});
}
export async function setVehicleFlag(id: number, field: 'active'|'primary_vehicle', value: number) {
  const db = await getDatabase();
  if (field === 'primary_vehicle' && value) await db.runAsync('UPDATE vehicles SET primary_vehicle=0');
  await db.runAsync(`UPDATE vehicles SET ${field}=? WHERE id=?`, value, id);
}
export async function addReading(vehicleId: number, date: string, mileage: number) {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('INSERT INTO readings (vehicle_id,date,mileage) VALUES (?,?,?)', vehicleId,date,mileage);
    await db.runAsync('UPDATE vehicles SET mileage=? WHERE id=?', mileage, vehicleId);
    await resetOdometerEffects(db, vehicleId, mileage);
  });
}
export async function listReadings(vehicleId: number) { const db=await getDatabase(); return db.getAllAsync<{id:number,date:string,mileage:number}>('SELECT * FROM readings WHERE vehicle_id=? ORDER BY id DESC',vehicleId); }
export async function listActivities() { const db=await getDatabase(); return db.getAllAsync<Activity & {plate:string;mileage:number;active:number}>('SELECT a.*,v.plate,v.mileage,v.active FROM activities a JOIN vehicles v ON v.id=a.vehicle_id ORDER BY a.id DESC'); }
export async function saveActivity(a: Omit<Activity,'id'|'paused'> & {id?:number}) {
  const db=await getDatabase();
  if(a.id) {
    const activityId = a.id;
    await db.withTransactionAsync(async()=>{
    const current=await db.getFirstAsync<Pick<Activity,'vehicle_id'|'due_date'|'due_mileage'|'period_days'|'period_km'>>('SELECT vehicle_id,due_date,due_mileage,period_days,period_km FROM activities WHERE id=?',activityId);
    if(!current) throw new Error('La actividad ya no existe.');
    const linked=await db.getFirstAsync<{count:number}>('SELECT COUNT(*) AS count FROM services WHERE activity_id=?',activityId);
    if(current.vehicle_id!==a.vehicle_id&&(linked?.count??0)>0) throw new Error('No se puede cambiar el vehículo de una actividad que ya tiene servicios asociados.');
    const scheduleChanged=current.due_date!==a.due_date||current.due_mileage!==a.due_mileage||current.period_days!==a.period_days||current.period_km!==a.period_km;
    if(scheduleChanged&&(linked?.count??0)>0) throw new Error('No se pueden cambiar los vencimientos o la periodicidad mientras la actividad tenga servicios asociados.');
    if(scheduleChanged) await invalidateActivityScheduleEffects(db,activityId);
    await db.runAsync('UPDATE activities SET vehicle_id=?,name=?,category=?,description=?,due_date=?,due_mileage=?,advance_days=?,advance_km=?,period_days=?,period_km=? WHERE id=?',a.vehicle_id,a.name,a.category,a.description,a.due_date,a.due_mileage,a.advance_days,a.advance_km,a.period_days,a.period_km,activityId);
    });
  }
  else await db.runAsync('INSERT INTO activities (vehicle_id,name,category,description,due_date,due_mileage,advance_days,advance_km,period_days,period_km) VALUES (?,?,?,?,?,?,?,?,?,?)',a.vehicle_id,a.name,a.category,a.description,a.due_date,a.due_mileage,a.advance_days,a.advance_km,a.period_days,a.period_km);
}
export async function toggleActivity(id:number,paused:number) { const db=await getDatabase(); await db.runAsync('UPDATE activities SET paused=? WHERE id=?',paused,id); }
export async function deleteActivity(id:number) { const db=await getDatabase(); return deleteActivityOperation(db,id); }
export async function addService(s: Omit<Service,'id'|'plate'|'total'>) { const db=await getDatabase(); return addServiceOperation(db,s); }
export async function updateService(id:number,s: Omit<Service,'id'|'plate'|'total'>) { const db=await getDatabase(); return updateServiceOperation(db,id,s); }
export async function deleteService(id:number) { const db=await getDatabase(); return deleteServiceOperation(db,id); }
export async function listServices(vehicleId?:number) { const db=await getDatabase(); return listServicesOperation(db,vehicleId); }
export async function dashboardData() { const db=await getDatabase(); const vehicles=await db.getFirstAsync<{n:number}>('SELECT COUNT(*) n FROM vehicles WHERE active=1'); const activities=await listActivities(); const services=await listServices(); return {count:vehicles?.n??0,activities:activities.filter(a=>!a.paused&&a.active===1),services:services.slice(0,5)}; }
