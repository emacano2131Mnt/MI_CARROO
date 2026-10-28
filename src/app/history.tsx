import { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Activity, addService, deleteService, listActivities, listServices, listVehicles, Service, updateService, Vehicle } from '@/database/database';
import { Body, Button, Card, EmptyState, Field, Screen, SectionTitle, StatusBadge, Title, useUiColors, errorMessage, message } from '@/components/ui-kit';
import { isAllowedServiceDate, serviceTotal } from '@/utils/business-rules';

const today = new Date().toISOString().slice(0, 10);
const blankForm = { date: today, mileage: '', kind: 'Preventivo', description: '', provider: '', labor: '0', parts: '0', other: '0', activityId: '' };

export default function History() {
  const colors = useUiColors();
  const styles = makeStyles(colors);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [vehicleId, setVehicleId] = useState<number>();
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState<number>();

  const load = useCallback(async () => {
    const [availableVehicles, availableActivities] = await Promise.all([listVehicles(), listActivities()]);
    const selectedId = vehicleId ?? availableVehicles[0]?.id;
    setVehicles(availableVehicles);
    setActivities(availableActivities);
    if (vehicleId === undefined && selectedId !== undefined) setVehicleId(selectedId);
    setServices(selectedId === undefined ? [] : await listServices(selectedId));
  }, [vehicleId]);

  const set = (key: keyof typeof blankForm, value: string) => setForm(current => ({ ...current, [key]: value }));

  const chooseVehicle = async (id: number) => {
    if (editingId !== undefined) return;
    setVehicleId(id);
    setForm({ ...blankForm, date: today });
    setServices(await listServices(id));
  };

  const edit = (service: Service) => {
    setEditingId(service.id);
    setForm({
      date: service.date,
      mileage: String(service.mileage),
      kind: service.kind,
      description: service.description,
      provider: service.provider,
      labor: String(service.labor),
      parts: String(service.parts),
      other: String(service.other),
      activityId: service.activity_id === null ? '' : String(service.activity_id),
    });
  };

  const save = async (confirmed = false) => {
    try {
      if (vehicleId === undefined) throw new Error('Registra un vehículo primero.');
      if (!form.description.trim()) throw new Error('Escribe una descripción del servicio.');
      if (!isAllowedServiceDate(form.date, today)) throw new Error('La fecha debe ser válida y no futura.');
      const mileage = Number(form.mileage);
      const labor = Number(form.labor);
      const parts = Number(form.parts);
      const other = Number(form.other);
      if (!Number.isInteger(mileage) || mileage < 0) throw new Error('El kilometraje debe ser entero no negativo.');
      const totalCost = serviceTotal(labor, parts, other);
      const selectedVehicle = vehicles.find(vehicle => vehicle.id === vehicleId);
      if (selectedVehicle && mileage < selectedVehicle.mileage && !confirmed) {
        Alert.alert('Kilometraje menor al actual', `El odómetro indica ${selectedVehicle.mileage.toLocaleString()} km. ¿Confirmas que el servicio se realizó antes de esa lectura?`, [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: () => void save(true) },
        ]);
        return;
      }
      const service = {
        vehicle_id: vehicleId,
        activity_id: form.activityId ? Number(form.activityId) : null,
        date: form.date,
        mileage,
        kind: form.kind,
        description: form.description.trim(),
        provider: form.provider.trim(),
        labor,
        parts,
        other,
      };
      if (editingId === undefined) await addService(service);
      else await updateService(editingId, service);
      setEditingId(undefined);
      setForm({ ...blankForm, date: today });
      await load();
      message(editingId === undefined ? 'Servicio registrado' : 'Cambios guardados', `Costo total: $${totalCost.toLocaleString('es-CO')}`);
    } catch (error) {
      message(editingId === undefined ? 'No se pudo guardar' : 'No se pudo actualizar', errorMessage(error));
    }
  };

  const cancelEdit = () => {
    setEditingId(undefined);
    setForm({ ...blankForm, date: today });
  };

  const remove = (service: Service) => Alert.alert('Eliminar servicio', `¿Deseas eliminar “${service.description}” del ${service.date}?`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: () => void (async () => {
      try {
        await deleteService(service.id);
        if (editingId === service.id) cancelEdit();
        await load();
        message('Servicio eliminado', 'El historial, el kilometraje y los vencimientos se actualizaron.');
      } catch (error) {
        message('No se pudo eliminar', errorMessage(error));
      }
    })() },
  ]);

  const relatedActivities = activities.filter(activity => activity.vehicle_id === vehicleId);
  const total = (() => {
    try { return serviceTotal(Number(form.labor) || 0, Number(form.parts) || 0, Number(form.other) || 0); }
    catch { return 0; }
  })();
  const selectedVehicle = vehicles.find(vehicle => vehicle.id === vehicleId);

  return (
    <Screen load={load}>
      <Title subtitle="Revisa los trabajos realizados, sus fechas, talleres y costos por vehículo.">Historial</Title>
      {vehicles.length === 0 ? (
        <Card><EmptyState icon="📋" title="Registra un vehículo primero">El historial se organiza por vehículo y conserva cada servicio realizado.</EmptyState></Card>
      ) : (
        <>
          <Card>
            <SectionTitle detail={editingId === undefined ? 'El historial y el formulario siguen esta selección' : 'Cancela la edición para cambiar de vehículo'}>Vehículo</SectionTitle>
            {editingId !== undefined ? (
              <Body>{selectedVehicle?.plate} · {selectedVehicle?.brand} {selectedVehicle?.model}</Body>
            ) : (
              <View style={styles.vehicleChoices}>
                {vehicles.map(vehicle => (
                  <Button key={vehicle.id} compact secondary={vehicleId !== vehicle.id} title={`${vehicleId === vehicle.id ? '✓ ' : ''}${vehicle.plate} · ${vehicle.brand}${vehicle.active ? '' : ' · Archivado'}`} onPress={() => void chooseVehicle(vehicle.id)} />
                ))}
              </View>
            )}
          </Card>

          <Card>
            <SectionTitle detail="Los campos con * son obligatorios">{editingId === undefined ? 'Registrar servicio' : 'Editar servicio'}</SectionTitle>
            <Field label="Fecha (AAAA-MM-DD)" value={form.date} onChangeText={value => set('date', value)} required />
            <Field label="Kilometraje del servicio" value={form.mileage} onChangeText={value => set('mileage', value)} keyboardType="numeric" required />
            <View style={styles.formDivider} />
            <Text style={styles.groupTitle}>Tipo de mantenimiento</Text>
            <View style={styles.kindRow}>
              <Button compact secondary={form.kind !== 'Preventivo'} title="🛡️ Preventivo" onPress={() => set('kind', 'Preventivo')} />
              <Button compact secondary={form.kind !== 'Correctivo'} title="🔧 Correctivo" onPress={() => set('kind', 'Correctivo')} />
            </View>
            <Field label="Descripción del servicio" value={form.description} onChangeText={value => set('description', value)} required />
            <Field label="Taller o responsable (opcional)" value={form.provider} onChangeText={value => set('provider', value)} />
            <View style={styles.formDivider} />
            <Text style={styles.groupTitle}>Costos</Text>
            <Field label="Mano de obra" value={form.labor} onChangeText={value => set('labor', value)} keyboardType="decimal-pad" required />
            <Field label="Repuestos" value={form.parts} onChangeText={value => set('parts', value)} keyboardType="decimal-pad" required />
            <Field label="Otros costos" value={form.other} onChangeText={value => set('other', value)} keyboardType="decimal-pad" required />
            <View style={styles.totalPanel}><Text style={styles.totalLabel}>TOTAL DEL SERVICIO</Text><Text style={styles.totalValue}>${total.toLocaleString('es-CO')}</Text></View>
            <View style={styles.formDivider} />
            <Text style={styles.groupTitle}>Vincular con una actividad periódica (opcional)</Text>
            <View style={styles.activityChoices}>
              <Button compact secondary={form.activityId !== ''} title="Sin actividad" onPress={() => set('activityId', '')} />
              {relatedActivities.map(activity => <Button key={activity.id} compact secondary={form.activityId !== String(activity.id)} title={`${form.activityId === String(activity.id) ? '✓ ' : ''}${activity.name}`} onPress={() => set('activityId', String(activity.id))} />)}
            </View>
            <Button title={editingId === undefined ? 'Guardar servicio' : 'Guardar cambios'} onPress={() => void save()} />
            {editingId !== undefined ? <Button title="Cancelar edición" secondary onPress={cancelEdit} /> : null}
          </Card>
        </>
      )}

      <SectionTitle detail={`${services.length} ${services.length === 1 ? 'servicio' : 'servicios'} de ${selectedVehicle?.plate ?? 'este vehículo'}`}>Historial de servicios</SectionTitle>
      {services.length === 0 ? (
        <Card><EmptyState icon="🧾" title={selectedVehicle ? `Sin servicios para ${selectedVehicle.plate}` : 'Aún no hay servicios'}>Al registrar un servicio para este vehículo, aparecerá aquí ordenado por fecha.</EmptyState></Card>
      ) : services.map(service => (
        <Card key={service.id}>
          <View style={styles.serviceHeader}>
            <View style={styles.serviceTitleBlock}><Text style={styles.serviceTitle}>{service.description}</Text><Text style={styles.serviceMeta}>{service.plate} · {service.date}</Text></View>
            <StatusBadge label={service.kind} />
          </View>
          <View style={styles.serviceDetails}>
            <Text style={styles.detailText}>🛣️ {Number(service.mileage).toLocaleString()} km</Text>
            {service.provider ? <Text style={styles.detailText}>📍 {service.provider}</Text> : null}
          </View>
          <View style={styles.costBreakdown}>
            <Text style={styles.costText}>Mano de obra <Text style={styles.costNumber}>${Number(service.labor).toLocaleString('es-CO')}</Text></Text>
            <Text style={styles.costText}>Repuestos <Text style={styles.costNumber}>${Number(service.parts).toLocaleString('es-CO')}</Text></Text>
            <Text style={styles.costText}>Otros <Text style={styles.costNumber}>${Number(service.other).toLocaleString('es-CO')}</Text></Text>
          </View>
          <View style={styles.serviceTotalRow}><Text style={styles.totalLabel}>TOTAL</Text><Text style={styles.serviceTotal}>${Number(service.total).toLocaleString('es-CO')}</Text></View>
          <View style={styles.serviceActions}>
            <Button compact secondary title="Editar" onPress={() => edit(service)} />
            <Button compact danger title="Eliminar" onPress={() => remove(service)} />
          </View>
        </Card>
      ))}
    </Screen>
  );
}

function makeStyles(colors: ReturnType<typeof useUiColors>) { return {
  vehicleChoices: { gap: 7 }, activityChoices: { gap: 7 }, kindRow: { flexDirection: 'row' as const, gap: 8 },
  formDivider: { height: 1, backgroundColor: colors.line, marginVertical: 3 }, groupTitle: { fontSize: 14, fontWeight: '700' as const, color: colors.navy },
  totalPanel: { backgroundColor: colors.pale, borderRadius: 14, padding: 14, flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const },
  totalLabel: { fontSize: 11, fontWeight: '800' as const, letterSpacing: 0.7, color: colors.muted }, totalValue: { fontSize: 23, fontWeight: '800' as const, color: colors.green },
  serviceHeader: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'flex-start' as const, gap: 8 }, serviceTitleBlock: { flex: 1, gap: 4 },
  serviceTitle: { fontSize: 16, fontWeight: '700' as const, color: colors.navy }, serviceMeta: { fontSize: 12, color: colors.muted },
  serviceDetails: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 12 }, detailText: { fontSize: 12, color: colors.muted },
  costBreakdown: { paddingVertical: 9, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line, gap: 5 }, costText: { fontSize: 12, color: colors.muted }, costNumber: { color: colors.ink, fontWeight: '600' as const },
  serviceTotalRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const }, serviceTotal: { fontSize: 19, fontWeight: '800' as const, color: colors.navy },
  serviceActions: { flexDirection: 'row' as const, gap: 8 },
}; }
