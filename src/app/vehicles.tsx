import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, EmptyState, Field, Screen, SectionTitle, StatusBadge, Title, errorMessage, message, useUiColors } from '@/components/ui-kit';
import { listVehicles, saveVehicle, setVehicleFlag, type Vehicle, type VehicleWrite } from '@/database/database';
import { compatibleCatalogSelection, getBrand, getBrands, getCatalogSelection, getModel, getModels, getVehicleType, getVehicleTypeByLabel, getVehicleTypeForLegacy, vehicleTypes, type VehicleClass, type VehicleSubtypeId } from '@/constants/vehicle-catalog';
import { isValidDisplacement, isValidOdometer, normalizePlate, plateValidationMessage, sanitizeIntegerInput, sanitizePlateInput } from '@/utils/vehicle-rules';

type VehicleForm = {
  plate: string;
  type: string;
  subtypeId: string;
  vehicleClass: VehicleClass | null;
  brand: string;
  brandId: string;
  line: string;
  model: string;
  modelId: string;
  year: string;
  mileage: string;
  color: string;
  vin: string;
  fuel: string;
  displacement: string;
};

type PickerOption = { id: string; label: string; detail?: string; legacy?: boolean };
type PickerKey = 'type' | 'brand' | 'model';

const blank: VehicleForm = {
  plate: '', type: 'Automóvil', subtypeId: 'automovil', vehicleClass: 'carro', brand: '', brandId: '', line: '', model: '', modelId: '',
    year: '', mileage: '', color: '', vin: '', fuel: '', displacement: '',
};
const legacyOptionId = '__legacy_value__';

export default function Vehicles() {
  const colors = useUiColors();
  const styles = makeStyles(colors);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState<VehicleForm>(blank);
  const [editing, setEditing] = useState<number>();
  const [picker, setPicker] = useState<PickerKey | null>(null);
  const [search, setSearch] = useState('');
  const [inputIssues, setInputIssues] = useState<{ plate?: string; mileage?: string; displacement?: string }>({});

  const load = useCallback(async () => setVehicles(await listVehicles()), []);
  const update = <Key extends keyof VehicleForm>(key: Key, value: VehicleForm[Key]) => setForm(current => ({ ...current, [key]: value }));
  const currentVehicle = vehicles.find(vehicle => vehicle.id === editing);

  const edit = (vehicle: Vehicle) => {
    const inferredType = getVehicleType(vehicle.vehicle_subtype_id ?? '') ?? getVehicleTypeByLabel(vehicle.type);
    const legacyType = getVehicleTypeForLegacy(vehicle.type);
    const vehicleClass = vehicle.vehicle_class ?? inferredType?.vehicleClass ?? legacyType?.vehicleClass ?? null;
    const subtype = inferredType ?? (legacyType?.label === vehicle.type ? legacyType : undefined);
    const brand = vehicle.brand_id ? getBrand(vehicle.brand_id) : getBrands(vehicleClass ?? 'carro').find(item => item.name === vehicle.brand);
    const modelOption = brand && subtype
      ? (vehicle.model_id ? getModel(brand.id, vehicle.model_id) : getModels(brand.id, subtype.id).find(item => item.name === vehicle.model))
      : undefined;

    setEditing(vehicle.id);
    setInputIssues({});
    setForm({
      plate: vehicle.plate,
      type: vehicle.type,
      subtypeId: subtype?.id ?? '',
      vehicleClass,
      brand: vehicle.brand,
      brandId: brand?.id ?? '',
      line: vehicle.line,
      model: vehicle.model,
      modelId: modelOption?.id ?? '',
      year: String(vehicle.year),
      mileage: String(vehicle.mileage),
      color: vehicle.color ?? '',
      vin: vehicle.vin ?? '',
      fuel: vehicle.fuel ?? '',
      displacement: vehicle.displacement ?? '',
    });
  };

  const openPicker = (key: PickerKey) => {
    setSearch('');
    setPicker(key);
  };

  const handleType = (typeId: string) => {
    if (typeId === legacyOptionId) {
      setPicker(null);
      return;
    }
    const selected = getVehicleType(typeId);
    if (!selected) return;
    if (form.subtypeId === selected.id && form.type === selected.label) {
      setPicker(null);
      return;
    }
    const retained = compatibleCatalogSelection(selected.id, form.brandId, form.modelId);
    const retainBrand = retained.brandId !== '';
    const retainModel = retained.modelId !== '';
    setForm(current => ({
      ...current,
      type: selected.label,
      subtypeId: selected.id,
      vehicleClass: selected.vehicleClass,
      brand: retainBrand ? current.brand : '',
      brandId: retainBrand ? current.brandId : '',
      model: retainModel ? current.model : '',
      modelId: retainModel ? current.modelId : '',
    }));
    setInputIssues(current => ({ ...current, plate: undefined }));
    setPicker(null);
  };

  const handleBrand = (brandId: string) => {
    if (brandId === legacyOptionId) {
      setPicker(null);
      return;
    }
    const selected = getBrand(brandId);
    if (!selected || selected.vehicleClass !== form.vehicleClass) return;
    if (form.brandId === selected.id && form.brand === selected.name) {
      setPicker(null);
      return;
    }
    setForm(current => ({ ...current, brand: selected.name, brandId: selected.id, model: '', modelId: '' }));
    setPicker(null);
  };

  const handleModel = (modelId: string) => {
    if (modelId === legacyOptionId) {
      setPicker(null);
      return;
    }
    const selected = getModel(form.brandId, modelId);
    if (!selected || !form.subtypeId || !selected.subtypes.includes(form.subtypeId as VehicleSubtypeId)) return;
    setForm(current => ({ ...current, model: selected.name, modelId: selected.id }));
    setPicker(null);
  };

  const options = useMemo<PickerOption[]>(() => {
    if (picker === 'type') {
      const items: PickerOption[] = vehicleTypes.map(type => ({ id: type.id, label: type.label }));
      if (editing !== undefined && !form.subtypeId && form.type) items.unshift({ id: legacyOptionId, label: form.type, detail: 'Tipo guardado previamente; no está disponible para nuevos registros.', legacy: true });
      return items;
    }
    if (picker === 'brand') {
      const items: PickerOption[] = form.vehicleClass ? getBrands(form.vehicleClass).map(brand => ({ id: brand.id, label: brand.name })) : [];
      if (editing !== undefined && !form.brandId && form.brand) items.unshift({ id: legacyOptionId, label: form.brand, detail: 'Marca guardada previamente; no está en el catálogo curado.', legacy: true });
      return items;
    }
    if (picker === 'model') {
      const items: PickerOption[] = form.subtypeId ? getModels(form.brandId, form.subtypeId as VehicleSubtypeId).map(model => ({ id: model.id, label: model.name })) : [];
      if (editing !== undefined && form.brandId && !form.modelId && form.model) items.unshift({ id: legacyOptionId, label: form.model, detail: 'Modelo guardado previamente; no está en el catálogo curado.', legacy: true });
      return items;
    }
    return [];
  }, [picker, editing, form.subtypeId, form.type, form.vehicleClass, form.brandId, form.brand, form.modelId, form.model]);

  const visibleOptions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es');
    return query ? options.filter(option => `${option.label} ${option.detail ?? ''}`.toLocaleLowerCase('es').includes(query)) : options;
  }, [options, search]);

  const savedType = getVehicleType(form.subtypeId);
  const savedBrand = form.brandId ? getBrand(form.brandId) : undefined;
  const savedModel = form.brandId && form.modelId ? getModel(form.brandId, form.modelId) : undefined;
  const hasCatalogSelection = getCatalogSelection(form.subtypeId, form.brandId, form.modelId) !== undefined;

  const isLegacyIdentityUnchanged = currentVehicle !== undefined
    && normalizePlate(form.plate) === normalizePlate(currentVehicle.plate)
    && form.type === currentVehicle.type
    && form.brand === currentVehicle.brand
    && form.model === currentVehicle.model
    && form.vehicleClass === (currentVehicle.vehicle_class ?? getVehicleTypeForLegacy(currentVehicle.type)?.vehicleClass ?? null);
  const realtimePlateError = plateValidationMessage(form.plate, form.vehicleClass);
  const plateError = form.plate && realtimePlateError && !isLegacyIdentityUnchanged ? realtimePlateError : undefined;
  const mileageError = inputIssues.mileage ?? (form.mileage && !isValidOdometer(form.mileage) && Number(form.mileage) !== currentVehicle?.mileage ? 'Usa entre 1 y 7 dígitos (máximo 9.999.999 km).' : undefined);
  const displacementError = inputIssues.displacement ?? (form.displacement && !isValidDisplacement(form.displacement) && form.displacement !== currentVehicle?.displacement ? 'Usa hasta 5 dígitos entre 1 y 99.999 cc, o deja el campo vacío.' : undefined);

  const submit = async (confirmed = false) => {
    try {
      const year = Number(form.year);
      const mileage = Number(form.mileage);
      if (!form.plate.trim() || !form.type.trim() || !form.brand.trim() || !form.line.trim() || !form.model.trim() || form.year === '' || form.mileage === '') {
        throw new Error('Completa placa, tipo, marca, línea, modelo, año y kilometraje.');
      }
      if (!hasCatalogSelection && !isLegacyIdentityUnchanged) throw new Error('Selecciona un tipo, marca y modelo compatibles del catálogo.');
      if (plateError) throw new Error(plateError);
      if (inputIssues.plate) throw new Error(inputIssues.plate);
      if (mileageError) throw new Error(mileageError);
      if (displacementError) throw new Error(displacementError);
      if ((!Number.isInteger(year) || year < 1886 || year > new Date().getFullYear() + 1) && year !== currentVehicle?.year) throw new Error('El año del modelo no es válido.');
      if (!isValidOdometer(mileage) && mileage !== currentVehicle?.mileage) throw new Error('El kilometraje debe ser un entero entre 0 y 9.999.999 km.');
      if (!isValidDisplacement(form.displacement) && form.displacement !== currentVehicle?.displacement) throw new Error('El cilindraje debe ser un entero positivo de hasta 99.999 cc, o quedar vacío.');

      if (currentVehicle && mileage < currentVehicle.mileage && !confirmed) {
        Alert.alert('Kilometraje menor al actual', `El vehículo tiene ${currentVehicle.mileage.toLocaleString()} km. ¿Confirmas registrar una lectura inferior?`, [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: () => void submit(true) },
        ]);
        return;
      }

      const vehicleWrite: VehicleWrite = {
        id: editing,
        plate: form.plate,
        type: form.type,
        vehicleClass: form.vehicleClass,
        subtypeId: savedType?.id ?? null,
        brand: form.brand,
        brandId: savedBrand?.id ?? null,
        line: form.line.trim(),
        model: form.model,
        modelId: savedModel?.id ?? null,
        year,
        mileage,
        color: form.color.trim(),
        vin: form.vin.trim(),
        fuel: form.fuel.trim(),
        displacement: form.displacement,
      };
      await saveVehicle(vehicleWrite);
      setForm(blank);
      setEditing(undefined);
      setInputIssues({});
      await load();
      message('Guardado', 'El vehículo quedó guardado en la base local.');
    } catch (error) {
      message('No se pudo guardar', errorMessage(error));
    }
  };

  const toggle = (vehicle: Vehicle) => Alert.alert(
    vehicle.active ? 'Archivar vehículo' : 'Reactivar vehículo',
    vehicle.active ? 'El vehículo se ocultará de la flota activa y conservará su historial.' : 'El vehículo volverá a la flota activa.',
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: vehicle.active ? 'Archivar' : 'Reactivar', onPress: async () => { await setVehicleFlag(vehicle.id, 'active', vehicle.active ? 0 : 1); await load(); } },
    ],
  );

  const chooseOption = (option: PickerOption) => {
    if (picker === 'type') handleType(option.id);
    else if (picker === 'brand') handleBrand(option.id);
    else if (picker === 'model') handleModel(option.id);
  };

  const typeDescription = form.vehicleClass === 'motocicleta'
    ? 'Moto: tres letras y dos números; algunas series agregan una letra final.'
    : form.vehicleClass === 'carro'
      ? 'Carro: tres letras seguidas de tres números.'
      : 'Selecciona un tipo para mostrar la regla de placa.';

  return (
    <Screen load={load}>
      <Title subtitle="Registra los datos del vehículo con opciones de catálogo y validación inmediata.">Vehículos</Title>
      <Card>
        <SectionTitle detail="Los campos con * son obligatorios">{editing ? 'Editar vehículo' : 'Registrar vehículo'}</SectionTitle>
        <View style={styles.formSection}>
          <Text style={styles.formSectionTitle}>Datos principales</Text>
          <Field
            label="Placa"
            value={form.plate}
            required
            autoCapitalize="characters"
            placeholder={form.vehicleClass === 'motocicleta' ? 'ABC12 o ABC12D' : 'ABC123'}
            error={inputIssues.plate ?? plateError}
            onChangeText={raw => {
              const result = sanitizePlateInput(raw);
              update('plate', result.value);
              setInputIssues(current => ({ ...current, plate: result.exceedsLimit ? 'La placa admite máximo 6 caracteres alfanuméricos.' : result.hasInvalidCharacters ? 'La placa solo admite letras y números.' : undefined }));
            }}
          />
          <Text style={styles.helper}>{typeDescription}</Text>
          <PickerField label="Tipo de vehículo" value={form.type} required onPress={() => openPicker('type')} styles={styles} />
          <PickerField label="Marca" value={form.brand} required onPress={() => openPicker('brand')} styles={styles} helper={!form.vehicleClass ? 'Elige primero el tipo de vehículo.' : !form.brandId ? 'Marca guardada anteriormente; no aparece en el catálogo.' : undefined} />
          <Field label="Línea / versión" value={form.line} onChangeText={value => update('line', value)} required placeholder="Ej. Sport, LTZ, XRE" />
          <PickerField
            label="Modelo"
            value={form.model}
            required
            disabled={!form.brandId || !form.subtypeId}
            onPress={() => openPicker('model')}
            styles={styles}
            helper={!form.brandId ? 'Selecciona primero una marca del catálogo.' : !form.modelId && form.model ? 'Modelo guardado previamente; no está en el catálogo.' : undefined}
          />
          <Field label="Año del modelo" value={form.year} onChangeText={value => update('year', value.replace(/[^0-9]/g, '').slice(0, 4))} keyboardType="numeric" required placeholder="Ej. 2022" />
          <Field
            label="Kilometraje actual (km)"
            value={form.mileage}
            onChangeText={raw => {
              const result = sanitizeIntegerInput(raw, 7);
              update('mileage', result.value);
              setInputIssues(current => ({ ...current, mileage: result.exceedsLimit ? 'El kilometraje admite máximo 7 dígitos (9.999.999 km).' : result.hasInvalidCharacters ? 'El kilometraje solo acepta números enteros.' : undefined }));
            }}
            keyboardType="numeric"
            required
            error={mileageError}
            placeholder="0 a 9.999.999"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formSectionTitle}>Información adicional</Text>
          <Field label="Color (opcional)" value={form.color} onChangeText={value => update('color', value)} />
          <Field label="VIN (opcional)" value={form.vin} onChangeText={value => update('vin', value.toUpperCase())} autoCapitalize="characters" />
          <Field label="Combustible (opcional)" value={form.fuel} onChangeText={value => update('fuel', value)} />
          <Field
            label="Cilindraje (cc, opcional)"
            value={form.displacement}
            onChangeText={raw => {
              const result = sanitizeIntegerInput(raw, 5);
              update('displacement', result.value);
              setInputIssues(current => ({ ...current, displacement: result.exceedsLimit ? 'El cilindraje admite máximo 5 dígitos (99.999 cc).' : result.hasInvalidCharacters ? 'El cilindraje solo acepta números enteros positivos.' : undefined }));
            }}
            keyboardType="numeric"
            error={displacementError}
            placeholder="1 a 99.999 cc"
          />
        </View>
        <Button title={editing ? 'Guardar cambios' : 'Registrar vehículo'} onPress={() => void submit()} />
        {editing ? <Button title="Cancelar edición" secondary onPress={() => { setEditing(undefined); setForm(blank); setInputIssues({}); }} /> : null}
      </Card>

      <SectionTitle detail={`${vehicles.length} en total`}>Tu lista</SectionTitle>
      {vehicles.length === 0 ? <Card><EmptyState icon="🚘" title="Aún no hay vehículos">Completa el formulario para registrar el primero.</EmptyState></Card> : vehicles.map(vehicle => (
        <Card key={vehicle.id}>
          <View style={styles.vehicleHeader}>
            <View style={styles.plateBlock}><Text style={styles.plateLabel}>PLACA</Text><Text style={styles.plate}>{vehicle.plate}</Text></View>
            <View style={styles.badgeColumn}>{vehicle.primary_vehicle ? <StatusBadge label="Principal" /> : null}<StatusBadge label={vehicle.active ? 'Activo' : 'Archivado'} /></View>
          </View>
          <Text style={styles.vehicleName}>{vehicle.brand} {vehicle.line}</Text>
          <Text style={styles.vehicleDetails}>{vehicle.type} · {vehicle.model} · {vehicle.year}</Text>
          <View style={styles.odometer}><Text style={styles.odometerLabel}>ODÓMETRO ACTUAL</Text><Text style={styles.odometerValue}>{vehicle.mileage.toLocaleString()} <Text style={styles.odometerUnit}>km</Text></Text></View>
          <View style={styles.actionRow}>
            <Button compact title="Editar" secondary onPress={() => edit(vehicle)} />
            <Button compact title={vehicle.primary_vehicle ? 'Principal ✓' : 'Hacer principal'} secondary onPress={async () => { await setVehicleFlag(vehicle.id, 'primary_vehicle', 1); await load(); }} />
            <Button compact title={vehicle.active ? 'Archivar' : 'Reactivar'} secondary onPress={() => toggle(vehicle)} />
          </View>
        </Card>
      ))}

      <Modal visible={picker !== null} transparent animationType="slide" onRequestClose={() => setPicker(null)}>
        <View style={styles.modalBackdrop}>
          <SafeAreaView edges={['bottom']} style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.modalHeading}>
                <Text style={styles.modalTitle}>{picker === 'type' ? 'Tipo de vehículo' : picker === 'brand' ? 'Selecciona una marca' : 'Selecciona un modelo'}</Text>
                <Text style={styles.modalDescription}>{picker === 'model' ? `Modelos de ${form.brand}, compatibles con ${form.type}.` : picker === 'brand' ? 'Catálogo local curado; funciona sin conexión.' : 'Elige el subtipo que mejor describe el vehículo.'}</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Cerrar selector" onPress={() => setPicker(null)} style={styles.closeButton}><Text style={styles.closeText}>✕</Text></Pressable>
            </View>
            {picker !== 'type' ? <TextInput
              accessibilityLabel="Buscar en el catálogo"
              value={search}
              onChangeText={setSearch}
              placeholder={picker === 'brand' ? 'Buscar marca' : 'Buscar modelo'}
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              style={styles.searchInput}
            /> : null}
            {visibleOptions.length === 0 ? (
              <View style={styles.noResults}><Text style={styles.noResultsTitle}>No encontramos resultados</Text><Text style={styles.modalDescription}>Ese nombre no está disponible en este catálogo. Conserva el registro anterior o actualiza el catálogo con una fuente verificable.</Text></View>
            ) : (
              <FlatList
                data={visibleOptions}
                keyExtractor={option => option.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.optionList}
                renderItem={({ item }) => {
                  const selected = (picker === 'type' && (item.id === form.subtypeId || item.id === legacyOptionId))
                    || (picker === 'brand' && (item.id === form.brandId || item.id === legacyOptionId))
                    || (picker === 'model' && (item.id === form.modelId || item.id === legacyOptionId));
                  return <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => chooseOption(item)}
                    style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.optionPressed]}
                  >
                    <View style={styles.optionCopy}><Text style={styles.optionLabel}>{item.label}</Text>{item.detail ? <Text style={styles.optionDetail}>{item.detail}</Text> : null}</View>
                    {selected ? <Text style={styles.optionCheck}>✓</Text> : null}
                  </Pressable>;
                }}
              />
            )}
            <Button title="Cancelar" secondary onPress={() => setPicker(null)} />
          </SafeAreaView>
        </View>
      </Modal>
    </Screen>
  );
}

function PickerField({ label, value, helper, required = false, disabled = false, onPress, styles }: {
  label: string; value: string; helper?: string; required?: boolean; disabled?: boolean; onPress: () => void; styles: ReturnType<typeof makeStyles>;
}) {
  return <View style={styles.pickerField}>
    <Text style={styles.label}>{label}{required ? <Text style={styles.required}> *</Text> : null}</Text>
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.pickerButton, disabled && styles.pickerDisabled, pressed && styles.pickerPressed]}>
      <Text style={[styles.pickerValue, !value && styles.pickerPlaceholder, disabled && styles.pickerDisabledText]}>{value || `Seleccionar ${label.toLocaleLowerCase('es')}`}</Text>
      <Text style={styles.pickerChevron}>⌄</Text>
    </Pressable>
    {helper ? <Text style={styles.helper}>{helper}</Text> : null}
  </View>;
}

function makeStyles(colors: ReturnType<typeof useUiColors>) {
  return {
    formSection: { gap: 10 }, formSectionTitle: { fontSize: 13, fontWeight: '700' as const, color: colors.green, paddingBottom: 2 },
    label: { color: colors.ink, fontSize: 13, fontWeight: '600' as const }, required: { color: colors.red },
    helper: { color: colors.muted, fontSize: 12, lineHeight: 17 },
    pickerField: { gap: 6 }, pickerButton: { minHeight: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.surface, paddingHorizontal: 13, paddingVertical: 11, flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, gap: 10 },
    pickerDisabled: { backgroundColor: colors.background }, pickerDisabledText: { color: colors.muted }, pickerPressed: { borderColor: colors.green }, pickerValue: { color: colors.ink, fontSize: 15, flex: 1 }, pickerPlaceholder: { color: colors.muted }, pickerChevron: { color: colors.green, fontSize: 19, fontWeight: '800' as const },
    vehicleHeader: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'flex-start' as const },
    plateBlock: { gap: 3 }, plateLabel: { fontSize: 10, fontWeight: '800' as const, letterSpacing: 1, color: colors.muted }, plate: { fontSize: 22, fontWeight: '900' as const, color: colors.navy, letterSpacing: 1.4 },
    badgeColumn: { alignItems: 'flex-end' as const, gap: 6 }, vehicleName: { fontSize: 18, fontWeight: '800' as const, color: colors.ink }, vehicleDetails: { fontSize: 13, color: colors.muted },
    odometer: { padding: 12, borderRadius: 13, backgroundColor: colors.background, gap: 2 }, odometerLabel: { fontSize: 10, fontWeight: '800' as const, letterSpacing: 0.7, color: colors.muted }, odometerValue: { fontSize: 23, fontWeight: '800' as const, color: colors.navy }, odometerUnit: { fontSize: 13, fontWeight: '600' as const, color: colors.muted },
    actionRow: { flexDirection: 'row' as const, gap: 7, marginTop: 2 },
    modalBackdrop: { flex: 1, justifyContent: 'flex-end' as const, backgroundColor: 'rgba(0,0,0,0.52)' },
    modalSheet: { maxHeight: '88%' as const, backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 8, gap: 12 },
    modalHandle: { width: 42, height: 4, borderRadius: 3, backgroundColor: colors.line, alignSelf: 'center' as const },
    modalHeader: { flexDirection: 'row' as const, alignItems: 'flex-start' as const, gap: 10 }, modalHeading: { flex: 1, gap: 4 }, modalTitle: { color: colors.navy, fontSize: 20, fontWeight: '800' as const }, modalDescription: { color: colors.muted, fontSize: 13, lineHeight: 18 },
    closeButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background, alignItems: 'center' as const, justifyContent: 'center' as const }, closeText: { color: colors.ink, fontSize: 17, fontWeight: '700' as const },
    searchInput: { minHeight: 46, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 13, color: colors.ink, backgroundColor: colors.background, fontSize: 15 },
    optionList: { gap: 7, paddingBottom: 5 }, option: { minHeight: 52, borderWidth: 1, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.background, paddingHorizontal: 13, paddingVertical: 9, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 9 },
    optionSelected: { borderColor: colors.green, backgroundColor: colors.pale }, optionPressed: { borderColor: colors.green, backgroundColor: colors.pale }, optionCopy: { flex: 1, gap: 3 }, optionLabel: { color: colors.ink, fontSize: 15, fontWeight: '600' as const }, optionDetail: { color: colors.muted, fontSize: 12, lineHeight: 16 }, optionCheck: { color: colors.green, fontSize: 18, fontWeight: '900' as const },
    noResults: { padding: 20, alignItems: 'center' as const, gap: 8 }, noResultsTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' as const },
  };
}
