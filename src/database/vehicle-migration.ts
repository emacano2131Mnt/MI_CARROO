import type { SQLiteDatabase } from 'expo-sqlite';

export type VehicleMigrationDatabase = Pick<SQLiteDatabase, 'getAllAsync' | 'execAsync' | 'runAsync'>;

export async function ensureVehicleCatalogColumns(db: VehicleMigrationDatabase) {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(vehicles)');
  const existing = new Set(columns.map(column => column.name));
  for (const column of ['vehicle_class', 'vehicle_subtype_id', 'brand_id', 'model_id'] as const) {
    if (!existing.has(column)) await db.execAsync(`ALTER TABLE vehicles ADD COLUMN ${column} TEXT`);
  }
  await db.runAsync(`UPDATE vehicles SET vehicle_class = CASE
    WHEN lower(type) LIKE '%moto%' THEN 'motocicleta'
    WHEN lower(type) LIKE '%auto%' OR lower(type) LIKE '%carro%' OR lower(type) LIKE '%camioneta%' OR lower(type) LIKE '%pickup%' OR lower(type) LIKE '%van%' THEN 'carro'
    ELSE vehicle_class END WHERE vehicle_class IS NULL`);
}
