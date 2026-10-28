export const vehicleTypes = [
  { id: 'automovil', label: 'Automóvil', vehicleClass: 'carro' },
  { id: 'camioneta-suv', label: 'Camioneta / SUV', vehicleClass: 'carro' },
  { id: 'pickup', label: 'Pickup', vehicleClass: 'carro' },
  { id: 'microbus-van', label: 'Microbús / Van', vehicleClass: 'carro' },
  { id: 'motocicleta', label: 'Motocicleta', vehicleClass: 'motocicleta' },
] as const;

export type VehicleSubtypeId = typeof vehicleTypes[number]['id'];
export type VehicleClass = typeof vehicleTypes[number]['vehicleClass'];
export type VehicleTypeOption = typeof vehicleTypes[number];

type CatalogModel = { id: string; name: string; subtypes: readonly VehicleSubtypeId[] };
type CatalogBrand = { id: string; name: string; vehicleClass: VehicleClass; models: readonly CatalogModel[] };

const auto = ['automovil'] as const;
const suv = ['camioneta-suv'] as const;
const pickup = ['pickup'] as const;
const van = ['microbus-van'] as const;
const moto = ['motocicleta'] as const;
const model = (id: string, name: string, subtypes: readonly VehicleSubtypeId[] = auto) => ({ id, name, subtypes });

export const vehicleCatalog: readonly CatalogBrand[] = [
  {
    id: 'chevrolet', name: 'Chevrolet', vehicleClass: 'carro', models: [
      model('spark-euv', 'Spark EUV', suv), model('onix', 'Onix', auto), model('onix-sedan', 'Onix Sedán', auto),
      model('sonic', 'Sonic', suv), model('tracker', 'Tracker', suv), model('spin', 'Spin', suv),
      model('captiva', 'Captiva', suv), model('captiva-ev', 'Captiva EV', suv), model('captiva-hibrida', 'Captiva Híbrida', suv),
      model('equinox-ev', 'Equinox EV', suv), model('blazer-ev', 'Blazer EV', suv), model('traverse', 'Traverse', suv),
      model('tahoe', 'Tahoe', suv), model('suburban', 'Suburban', suv), model('montana', 'Montana', pickup),
      model('colorado', 'Colorado', pickup), model('silverado', 'Silverado', pickup),
      model('n400-cargo', 'N400 Cargo', van), model('n400-pasajeros', 'N400 Pasajeros', van),
    ],
  },
  {
    id: 'kia', name: 'Kia', vehicleClass: 'carro', models: [
      model('picanto', 'Picanto', auto), model('soluto', 'Soluto', auto), model('k3-sedan', 'K3 Sedán', auto),
      model('k4', 'K4', auto), model('k3-cross', 'K3 Cross', suv), model('stonic', 'Stonic', suv),
      model('sonet', 'Sonet', suv), model('seltos', 'Seltos', suv), model('sportage', 'Sportage', suv),
      model('sorento', 'Sorento', suv), model('niro', 'Niro', suv), model('tasman', 'Tasman', pickup),
    ],
  },
  {
    id: 'toyota', name: 'Toyota', vehicleClass: 'carro', models: [
      model('yaris-hb', 'Yaris HB', auto), model('corolla', 'Corolla', auto), model('gr-yaris', 'GR Yaris', auto),
      model('yaris-cross', 'Yaris Cross', suv), model('corolla-cross', 'Corolla Cross', suv), model('rav4', 'RAV4', suv),
      model('bz4x', 'bZ4X', suv), model('fortuner', 'Fortuner', suv), model('land-cruiser-prado', 'Land Cruiser Prado', suv),
      model('land-cruiser-79', 'Land Cruiser 79', pickup), model('hilux', 'Hilux', pickup),
    ],
  },
  {
    id: 'volkswagen', name: 'Volkswagen', vehicleClass: 'carro', models: [
      model('polo', 'Polo', auto), model('polo-track', 'Polo Track', auto), model('virtus', 'Virtus', auto),
      model('tera', 'Tera', suv), model('t-cross', 'T-Cross', suv), model('tiguan', 'Tiguan', suv),
      model('nivus', 'Nivus', suv), model('taos', 'Taos', suv), model('teramont', 'Teramont', suv),
      model('saveiro', 'Saveiro', pickup), model('amarok', 'Amarok', pickup),
    ],
  },
  {
    id: 'renault', name: 'Renault', vehicleClass: 'carro', models: [
      model('kwid', 'Kwid', auto), model('logan', 'Logan', auto), model('sandero', 'Sandero', auto),
      model('stepway', 'Stepway', suv), model('kardian', 'Kardian', suv), model('duster', 'Duster', suv),
      model('captur', 'Captur', suv), model('arkana', 'Arkana', suv), model('koleos', 'Koleos', suv),
    ],
  },
  {
    id: 'akt', name: 'AKT', vehicleClass: 'motocicleta', models: [
      model('nkd-125', 'NKD 125', moto), model('nkd-125-fp', 'NKD 125 FP', moto), model('nkd-125-classic', 'NKD 125 Classic', moto),
      model('chr-125', 'CHR 125', moto), model('cr4-125', 'CR4 125', moto), model('cr4-150', 'CR4 150', moto),
      model('cr4-200-pro', 'CR4 200 Pro', moto), model('ttr-125', 'TTR 125', moto), model('tt200', 'TT200', moto),
      model('250-r', '250 R', moto),
    ],
  },
  {
    id: 'bajaj', name: 'Bajaj', vehicleClass: 'motocicleta', models: [
      model('boxer-s', 'Boxer S', moto), model('boxer-ct100-ks', 'Boxer CT 100 KS', moto), model('boxer-ct100-es', 'Boxer CT 100 ES', moto),
      model('boxer-ct125', 'Boxer CT 125', moto), model('boxer-150-x', 'Boxer 150 X', moto), model('pulsar-ns125', 'Pulsar NS125', moto),
      model('pulsar-n160', 'Pulsar N160', moto), model('pulsar-ns200', 'Pulsar NS200', moto), model('pulsar-n250', 'Pulsar N250', moto),
      model('dominar-250', 'Dominar 250', moto), model('dominar-400', 'Dominar 400', moto),
    ],
  },
  {
    id: 'honda', name: 'Honda', vehicleClass: 'motocicleta', models: [
      model('cb-100', 'CB 100', moto), model('dio', 'Dio', moto), model('navi', 'Navi', moto), model('wave-110s', 'Wave 110S', moto),
      model('cg-125', 'CG 125', moto), model('xr-150l', 'XR 150L', moto), model('xr-190l', 'XR 190L', moto),
      model('cb-190r', 'CB 190R', moto), model('cbr-250r', 'CBR 250R', moto),
    ],
  },
  {
    id: 'suzuki', name: 'Suzuki', vehicleClass: 'motocicleta', models: [
      model('gn-160', 'GN 160', moto), model('burgman-15', 'Burgman 15', moto), model('dr-160x', 'DR 160X', moto),
      model('dr-150-abs', 'DR 150 ABS', moto), model('viva-fi-abs', 'Viva FI ABS', moto),
      model('gsx-8t', 'GSX-8T', moto), model('gsx-8tt', 'GSX-8TT', moto), model('dr-z4sm', 'DR-Z4SM', moto),
    ],
  },
  {
    id: 'yamaha', name: 'Yamaha', vehicleClass: 'motocicleta', models: [
      model('fz-version-3', 'FZ Versión 3.0', moto), model('mt-15', 'MT-15', moto), model('nmax', 'NMAX', moto),
      model('mt-03', 'MT-03', moto), model('mt-09', 'MT-09', moto), model('tenere-700', 'Ténéré 700', moto),
    ],
  },
];

export function getVehicleType(id: string) {
  return vehicleTypes.find(item => item.id === id);
}

export function getVehicleTypeByLabel(label: string) {
  return vehicleTypes.find(item => item.label === label);
}

export function getVehicleTypeForLegacy(label: string) {
  const direct = getVehicleTypeByLabel(label);
  if (direct) return direct;
  if (/moto|motocicleta/i.test(label)) return vehicleTypes.find(item => item.id === 'motocicleta');
  if (/auto|carro|camioneta|pickup|van|microb[uú]s/i.test(label)) return vehicleTypes.find(item => item.id === 'automovil');
  return undefined;
}

export function getBrands(vehicleClass: VehicleClass) {
  return vehicleCatalog.filter(brand => brand.vehicleClass === vehicleClass);
}

export function getBrand(id: string) {
  return vehicleCatalog.find(brand => brand.id === id);
}

export function getModel(brandId: string, modelId: string) {
  return getBrand(brandId)?.models.find(item => item.id === modelId);
}

export function getModels(brandId: string, subtypeId: VehicleSubtypeId) {
  return getBrand(brandId)?.models.filter(item => item.subtypes.includes(subtypeId)) ?? [];
}

export function compatibleCatalogSelection(typeId: string, brandId: string, modelId: string) {
  const type = getVehicleType(typeId);
  const brand = getBrand(brandId);
  if (!type || !brand || brand.vehicleClass !== type.vehicleClass) return { brandId: '', modelId: '' };
  const keepsModel = getModels(brandId, type.id).some(item => item.id === modelId);
  return { brandId, modelId: keepsModel ? modelId : '' };
}

export function getCatalogSelection(typeId: string, brandId: string, modelId: string) {
  const type = getVehicleType(typeId);
  const brand = getBrand(brandId);
  const selectedModel = getModel(brandId, modelId);
  if (!type || !brand || !selectedModel || brand.vehicleClass !== type.vehicleClass || !selectedModel.subtypes.includes(type.id)) return undefined;
  return { type, brand, model: selectedModel };
}
