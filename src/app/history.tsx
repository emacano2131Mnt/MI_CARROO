import { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { Activity, addService, listActivities, listServices, listVehicles, Service, Vehicle } from '@/database/database';
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

  const load = useCallback(async () => {
    const [availableVehicles, availableActivities, savedServices] = await Promise.all([listVehicles(false), listActivities(), listServices()]);
    setVehicles(availableVehicles);
    setActivities(availableActivities);
    setServices(savedServices);
    if (!vehicleId && availableVehicles[0]) setVehicleId(availableVehicles[0].id);
  }, [vehicleId]);
  const set = (key: keyof typeof blankForm, value: string) => setForm(current => ({ ...current, [key]: value }));

  const save = async (confirmed = false) => {
    try {
      if (!vehicleId) throw new Error('Registra un vehículo primero.');
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
      await addService({ vehicle_id: vehicleId, activity_id: form.activityId ? Number(form.activityId) : null, date: form.date, mileage, kind: form.kind, description: form.description.trim(), provider: form.provider, labor, parts, other });
      setForm({ ...blankForm, date: today });
      await load();
      message('Servicio registrado', `Costo total: $${totalCost.toLocaleString('es-CO')}`);
    } catch (error) {
      message('No se pudo guardar', errorMessage(error));
    }
  };

  const relatedActivities = activities.filter(activity => activity.vehicle_id === vehicleId);
  const total = (() => {
    try { return serviceTotal(Number(form.labor) || 0, Number(form.parts) || 0, Number(form.other) || 0); }
    catch { return 0; }
  })();

  return (
    <Screen load={load}>
      <Title subtitle="Revisa los trabajos realizados, sus fechas, talleres y costos por vehículo.">Historial</Title>
      {vehicles.length === 0 ? (
        <Card><EmptyState icon="📋" title="Registra un vehículo primero">El historial se organiza por vehículo y conserva cada servicio realizado.</EmptyState></Card>
      ) : (
        <>
          <Card>
            <SectionTitle>Vehículo</SectionTitle>
            <View style={styles.vehicleChoices}>{vehicles.map(vehicle=><Button key={vehicle.id} compact secondary title={`${vehicleId===vehicle.id?'✓ ':''}${vehicle.plate} · ${vehicle.brand}`} onPress={()=>setVehicleId(vehicle.id)}/>)}</View>
          </Card>

          <Card>
            <SectionTitle detail="Los campos con * son obligatorios">Registrar servicio</SectionTitle>
            <Field label="Fecha (AAAA-MM-DD)" value={form.date} onChangeText={value=>set('date',value)} required />
            <Field label="Kilometraje del servicio" value={form.mileage} onChangeText={value=>set('mileage',value)} keyboardType="numeric" required />
            <View style={styles.formDivider}/>
            <Text style={styles.groupTitle}>Tipo de mantenimiento</Text>
            <View style={styles.kindRow}>
              <Button compact secondary={form.kind!=='Preventivo'} title="🛡️ Preventivo" onPress={()=>set('kind','Preventivo')}/>
              <Button compact secondary={form.kind!=='Correctivo'} title="🔧 Correctivo" onPress={()=>set('kind','Correctivo')}/>
            </View>
            <Field label="Descripción del servicio" value={form.description} onChangeText={value=>set('description',value)} required />
            <Field label="Taller o responsable (opcional)" value={form.provider} onChangeText={value=>set('provider',value)} />
            <View style={styles.formDivider}/>
            <Text style={styles.groupTitle}>Costos</Text>
            <Field label="Mano de obra" value={form.labor} onChangeText={value=>set('labor',value)} keyboardType="decimal-pad" required />
            <Field label="Repuestos" value={form.parts} onChangeText={value=>set('parts',value)} keyboardType="decimal-pad" required />
            <Field label="Otros costos" value={form.other} onChangeText={value=>set('other',value)} keyboardType="decimal-pad" required />
            <View style={styles.totalPanel}><Text style={styles.totalLabel}>TOTAL DEL SERVICIO</Text><Text style={styles.totalValue}>${total.toLocaleString('es-CO')}</Text></View>
            <View style={styles.formDivider}/>
            <Text style={styles.groupTitle}>Vincular con una actividad periódica (opcional)</Text>
            {relatedActivities.length===0 ? <Body>No hay actividades para este vehículo.</Body> : <View style={styles.activityChoices}>{relatedActivities.map(activity=><Button key={activity.id} compact title={`${form.activityId===String(activity.id)?'✓ ':''}${activity.name}`} secondary onPress={()=>set('activityId',form.activityId===String(activity.id)?'':String(activity.id))}/>)}</View>}
            <Button title="Guardar servicio" onPress={()=>void save()} />
          </Card>
        </>
      )}

      <SectionTitle detail={`${services.length} servicios registrados`}>Historial de servicios</SectionTitle>
      {services.length===0 ? (
        <Card><EmptyState icon="🧾" title="Aún no hay servicios">Cuando guardes un mantenimiento, aparecerá aquí con sus costos y detalles.</EmptyState></Card>
      ) : services.map(service=>(
        <Card key={service.id}>
          <View style={styles.serviceHeader}>
            <View style={styles.serviceTitleBlock}><Text style={styles.serviceTitle}>{service.description}</Text><Text style={styles.serviceMeta}>{service.plate} · {service.date}</Text></View>
            <StatusBadge label={service.kind}/>
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
        </Card>
      ))}
    </Screen>
  );
}

function makeStyles(colors: ReturnType<typeof useUiColors>) { return {
 vehicleChoices:{gap:7},activityChoices:{gap:7},kindRow:{flexDirection:'row' as const,gap:8},formDivider:{height:1,backgroundColor:colors.line,marginVertical:3},groupTitle:{fontSize:14,fontWeight:'700' as const,color:colors.navy},
 totalPanel:{backgroundColor:colors.pale,borderRadius:14,padding:14,flexDirection:'row' as const,alignItems:'center' as const,justifyContent:'space-between' as const},totalLabel:{fontSize:11,fontWeight:'800' as const,letterSpacing:0.7,color:colors.muted},totalValue:{fontSize:23,fontWeight:'800' as const,color:colors.green},
 serviceHeader:{flexDirection:'row' as const,justifyContent:'space-between' as const,alignItems:'flex-start' as const,gap:8},serviceTitleBlock:{flex:1,gap:4},serviceTitle:{fontSize:16,fontWeight:'700' as const,color:colors.navy},serviceMeta:{fontSize:12,color:colors.muted},serviceDetails:{flexDirection:'row' as const,flexWrap:'wrap' as const,gap:12},detailText:{fontSize:12,color:colors.muted},
 costBreakdown:{paddingVertical:9,borderTopWidth:1,borderBottomWidth:1,borderColor:colors.line,gap:5},costText:{fontSize:12,color:colors.muted},costNumber:{color:colors.ink,fontWeight:'600' as const},serviceTotalRow:{flexDirection:'row' as const,justifyContent:'space-between' as const,alignItems:'center' as const},serviceTotal:{fontSize:19,fontWeight:'800' as const,color:colors.navy},
}; }
