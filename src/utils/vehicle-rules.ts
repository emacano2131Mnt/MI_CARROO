import { getCatalogSelection, getVehicleTypeForLegacy, type VehicleClass } from '../constants/vehicle-catalog.ts';

export type NumericInputResult = { value: string; hasInvalidCharacters: boolean; exceedsLimit: boolean };

export function sanitizeIntegerInput(raw: string, maxDigits: number): NumericInputResult {
  const hasInvalidCharacters = /[^0-9]/.test(raw);
  const digits = raw.replace(/[^0-9]/g, '');
  return { value: digits.slice(0, maxDigits), hasInvalidCharacters, exceedsLimit: digits.length > maxDigits };
}

export function isValidOdometer(value: number | string) {
  const text = String(value);
  return /^\d{1,7}$/.test(text) && Number.isInteger(Number(text)) && Number(text) <= 9_999_999;
}

export function isValidDisplacement(value: number | string | null | undefined) {
  if (value === '' || value === null || value === undefined) return true;
  const text = String(value);
  return /^[1-9]\d{0,4}$/.test(text) && Number(text) <= 99_999;
}

export function normalizePlate(value: string) {
  return value.toUpperCase().replace(/\s+/g, '');
}

export function sanitizePlateInput(raw: string, maxCharacters = 6): NumericInputResult {
  const hasInvalidCharacters = /[^a-z0-9\s]/i.test(raw);
  const normalized = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return { value: normalized.slice(0, maxCharacters), hasInvalidCharacters, exceedsLimit: normalized.length > maxCharacters };
}

export function plateValidationMessage(value: string, vehicleClass: VehicleClass | null) {
  const plate = normalizePlate(value);
  if (vehicleClass === 'carro') {
    return /^[A-Z]{3}\d{3}$/.test(plate) ? null : 'La placa de carro debe tener 3 letras seguidas de 3 números (ejemplo: ABC123).';
  }
  if (vehicleClass === 'motocicleta') {
    return /^(?:[A-Z]{3}\d{2}|[A-Z]{3}\d{2}[A-Z])$/.test(plate)
      ? null
      : 'La placa de moto debe tener 3 letras y 2 números, con una letra final adicional cuando corresponda (ejemplo: ABC12).';
  }
  return 'Selecciona el tipo de vehículo para validar la placa.';
}

export function vehicleCatalogSelectionError(typeId: string, brandId: string, modelId: string) {
  const selection = getCatalogSelection(typeId, brandId, modelId);
  if (!selection) return 'Selecciona un tipo, marca y modelo compatibles del catálogo.';
  return null;
}

export function legacyVehicleTypeClass(typeLabel: string): VehicleClass | null {
  return getVehicleTypeForLegacy(typeLabel)?.vehicleClass ?? null;
}

export function isUnchangedLegacyVehicleIdentity(previous: { plate: string; type: string; brand: string; model: string; vehicleClass: VehicleClass | null }, next: { plate: string; type: string; brand: string; model: string; vehicleClass: VehicleClass | null }) {
  return normalizePlate(previous.plate) === normalizePlate(next.plate)
    && previous.type === next.type
    && previous.brand === next.brand
    && previous.model === next.model
    && previous.vehicleClass === next.vehicleClass;
}
