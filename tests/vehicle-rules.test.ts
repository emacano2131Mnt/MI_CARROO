import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

import { compatibleCatalogSelection, getBrands, getCatalogSelection, getModels, getVehicleType, vehicleCatalog, vehicleTypes } from '../src/constants/vehicle-catalog.ts';
import { ensureVehicleCatalogColumns, type VehicleMigrationDatabase } from '../src/database/vehicle-migration.ts';
import { tabItems } from '../src/constants/tab-items.ts';
import { ThemeColors } from '../src/constants/theme-colors.ts';
import { isUnchangedLegacyVehicleIdentity, isValidDisplacement, isValidOdometer, normalizePlate, plateValidationMessage, sanitizeIntegerInput, sanitizePlateInput, vehicleCatalogSelectionError } from '../src/utils/vehicle-rules.ts';

function contrastRatio(foreground: string, background: string) {
  const luminance = (color: string) => {
    const channels = color.match(/[\da-f]{2}/gi)?.slice(0, 3).map(channel => parseInt(channel, 16) / 255) ?? [];
    const linear = channels.map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
  };
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return ((values[0] ?? 0) + 0.05) / ((values[1] ?? 0) + 0.05);
}

test('kilometraje limita a 7 dígitos y filtra signos, letras y decimales', () => {
  assert.equal(isValidOdometer(9_999_999), true);
  assert.equal(isValidOdometer('0000000'), true);
  assert.equal(isValidOdometer(10_000_000), false);
  assert.equal(isValidOdometer('12.5'), false);
  assert.equal(isValidOdometer('-12'), false);
  assert.deepEqual(sanitizeIntegerInput('12345678', 7), { value: '1234567', hasInvalidCharacters: false, exceedsLimit: true });
  assert.deepEqual(sanitizeIntegerInput('12a.5', 7), { value: '125', hasInvalidCharacters: true, exceedsLimit: false });
});

test('cilindraje opcional admite hasta 99.999 cc y solo enteros positivos', () => {
  assert.equal(isValidDisplacement(''), true);
  assert.equal(isValidDisplacement('1'), true);
  assert.equal(isValidDisplacement('99999'), true);
  assert.equal(isValidDisplacement('100000'), false);
  assert.equal(isValidDisplacement('0'), false);
  assert.equal(isValidDisplacement('125.5'), false);
  assert.equal(isValidDisplacement('-125'), false);
  assert.deepEqual(sanitizeIntegerInput('123456', 5), { value: '12345', hasInvalidCharacters: false, exceedsLimit: true });
});

test('tipos de vehículo son opciones cerradas con clase general y subtipo separados', () => {
  assert.deepEqual(vehicleTypes.map(type => type.label), ['Automóvil', 'Camioneta / SUV', 'Pickup', 'Microbús / Van', 'Motocicleta']);
  assert.equal(vehicleTypes.filter(type => type.vehicleClass === 'carro').length, 4);
  assert.equal(getVehicleType('motocicleta')?.vehicleClass, 'motocicleta');
});

test('marcas del catálogo se filtran entre carros y motocicletas', () => {
  const carBrands = getBrands('carro').map(brand => brand.name);
  const motorcycleBrands = getBrands('motocicleta').map(brand => brand.name);
  assert.ok(carBrands.includes('Chevrolet'));
  assert.ok(carBrands.includes('Kia'));
  assert.ok(motorcycleBrands.includes('Yamaha'));
  assert.ok(motorcycleBrands.includes('Honda'));
  assert.equal(carBrands.includes('Yamaha'), false);
  assert.equal(motorcycleBrands.includes('Chevrolet'), false);
});

test('modelos pertenecen a su marca, tipo y subtipo', () => {
  assert.ok(getModels('chevrolet', 'automovil').some(model => model.name === 'Onix'));
  assert.ok(getModels('chevrolet', 'pickup').some(model => model.name === 'Colorado'));
  assert.equal(getModels('chevrolet', 'pickup').some(model => model.name === 'Onix'), false);
  assert.equal(getCatalogSelection('automovil', 'chevrolet', 'onix')?.model.name, 'Onix');
  assert.equal(getCatalogSelection('automovil', 'bajaj', 'pulsar-n250'), undefined);
  assert.equal(getCatalogSelection('pickup', 'chevrolet', 'onix'), undefined);
  assert.equal(vehicleCatalogSelectionError('automovil', 'marca-inventada', 'modelo-inventado') !== null, true);
  assert.ok(vehicleCatalog.every(brand => brand.models.length > 0));
});

test('cambiar subtipo conserva solo marca y modelo compatibles', () => {
  assert.deepEqual(compatibleCatalogSelection('pickup', 'chevrolet', 'onix'), { brandId: 'chevrolet', modelId: '' });
  assert.deepEqual(compatibleCatalogSelection('pickup', 'chevrolet', 'colorado'), { brandId: 'chevrolet', modelId: 'colorado' });
  assert.deepEqual(compatibleCatalogSelection('motocicleta', 'chevrolet', 'onix'), { brandId: '', modelId: '' });
});

test('placas de carro aplican ABC123, mayúsculas y espacios normalizados', () => {
  assert.equal(plateValidationMessage('ABC123', 'carro'), null);
  assert.equal(plateValidationMessage('abc 123', 'carro'), null);
  assert.equal(normalizePlate(' ab c123 '), 'ABC123');
  assert.match(plateValidationMessage('AB123C', 'carro') ?? '', /3 letras seguidas de 3 números/);
  assert.notEqual(plateValidationMessage('1BC123', 'carro'), null);
  assert.notEqual(plateValidationMessage('ABC12', 'carro'), null);
  assert.deepEqual(sanitizePlateInput('ab c-123'), { value: 'ABC123', hasInvalidCharacters: true, exceedsLimit: false });
});

test('placas de moto aceptan ABC12 y ABC12D, pero no cuatro letras y dos números', () => {
  assert.equal(plateValidationMessage('ABC12', 'motocicleta'), null);
  assert.equal(plateValidationMessage('ABC12D', 'motocicleta'), null);
  assert.notEqual(plateValidationMessage('ABCD12', 'motocicleta'), null);
  assert.notEqual(plateValidationMessage('ABC123', 'motocicleta'), null);
  assert.deepEqual(sanitizePlateInput('abc12d'), { value: 'ABC12D', hasInvalidCharacters: false, exceedsLimit: false });
  assert.equal(sanitizePlateInput('ABC1234').exceedsLimit, true);
});

test('placa normalizada conserva la unicidad y editar excluye su propio registro', () => {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('CREATE TABLE vehicles (id INTEGER PRIMARY KEY, plate TEXT NOT NULL UNIQUE)');
  sqlite.prepare('INSERT INTO vehicles (plate) VALUES (?)').run(normalizePlate('abc 123'));
  assert.throws(() => sqlite.prepare('INSERT INTO vehicles (plate) VALUES (?)').run(normalizePlate('ABC123')), /UNIQUE constraint failed/);
  assert.equal(sqlite.prepare('SELECT id FROM vehicles WHERE plate = ? AND id != ?').all('ABC123', 1).length, 0);
  sqlite.close();
});

test('datos de vehículos antiguos se conservan si no cambia su identidad', () => {
  const original = { plate: 'AB1234', type: 'Automóvil', brand: 'Marca histórica', model: 'Referencia antigua', vehicleClass: 'carro' as const };
  assert.equal(isUnchangedLegacyVehicleIdentity(original, original), true);
  assert.equal(isUnchangedLegacyVehicleIdentity(original, { ...original, plate: 'AB1235' }), false);
  assert.equal(isUnchangedLegacyVehicleIdentity(original, { ...original, model: 'Otro modelo' }), false);
});

test('migración aditiva clasifica vehículos previos sin borrar ni reescribir sus campos', async () => {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(`CREATE TABLE vehicles (id INTEGER PRIMARY KEY, plate TEXT NOT NULL, type TEXT NOT NULL, brand TEXT NOT NULL, line TEXT NOT NULL, model TEXT NOT NULL, year INTEGER NOT NULL, mileage INTEGER NOT NULL, displacement TEXT);
    INSERT INTO vehicles VALUES (1, 'AB1234', 'Automóvil', 'Marca histórica', 'Línea antigua', 'Referencia antigua', 1998, 123456, '1600');
    INSERT INTO vehicles VALUES (2, 'ABC12D', 'Motocicleta', 'Yamaha', 'Línea antigua', 'Modelo antiguo', 2010, 98765, '125');`);
  const db = {
    getAllAsync: async <T>(sql: string) => sqlite.prepare(sql).all() as T[],
    execAsync: async (sql: string) => { sqlite.exec(sql); },
    runAsync: async (sql: string) => { const result = sqlite.prepare(sql).run(); return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) }; },
  } as unknown as VehicleMigrationDatabase;

  await ensureVehicleCatalogColumns(db);
  await ensureVehicleCatalogColumns(db);
  const cars = sqlite.prepare('SELECT plate, type, brand, line, model, year, mileage, displacement, vehicle_class FROM vehicles ORDER BY id').all().map(row => ({ ...row }));
  assert.deepEqual(cars, [
    { plate: 'AB1234', type: 'Automóvil', brand: 'Marca histórica', line: 'Línea antigua', model: 'Referencia antigua', year: 1998, mileage: 123456, displacement: '1600', vehicle_class: 'carro' },
    { plate: 'ABC12D', type: 'Motocicleta', brand: 'Yamaha', line: 'Línea antigua', model: 'Modelo antiguo', year: 2010, mileage: 98765, displacement: '125', vehicle_class: 'motocicleta' },
  ]);
  assert.equal(sqlite.prepare('PRAGMA foreign_key_check').all().length, 0);
  sqlite.close();
});

test('colores principales del tema oscuro mantienen contraste WCAG AA', () => {
  const dark = ThemeColors.dark;
  assert.ok(contrastRatio(dark.text, dark.background) >= 4.5);
  assert.ok(contrastRatio(dark.text, dark.surface) >= 4.5);
  assert.ok(contrastRatio(dark.muted, dark.surface) >= 4.5);
  assert.ok(contrastRatio(dark.placeholder, dark.field) >= 4.5);
  assert.ok(contrastRatio(dark.primary, dark.selected) >= 4.5);
  assert.ok(contrastRatio(dark.danger, dark.paleDanger) >= 4.5);
  assert.ok(contrastRatio(dark.onNavy, dark.heroSurface) >= 4.5);
});

test('tema claro conserva contraste de texto y controles principales', () => {
  const light = ThemeColors.light;
  assert.ok(contrastRatio(light.text, light.background) >= 4.5);
  assert.ok(contrastRatio(light.text, light.surface) >= 4.5);
  assert.ok(contrastRatio(light.muted, light.surface) >= 4.5);
  assert.ok(contrastRatio(light.primary, light.surface) >= 4.5);
  assert.ok(contrastRatio(light.onPrimary, light.primary) >= 4.5);
});

test('navegación separa emoji y etiqueta y solo declara rutas existentes', () => {
  const expectedRoutes = ['index', 'vehicles', 'mileage', 'maintenance', 'history', 'settings'];
  assert.deepEqual(tabItems.map(item => item.route), expectedRoutes);
  assert.ok(tabItems.every(item => item.emoji.length > 0 && item.label.length > 0 && !item.label.includes(item.emoji)));
  assert.deepEqual(tabItems.map(item => item.emoji), ['🏠', '🚗', '🛣️', '🛠️', '📋', '⚙️']);
});
