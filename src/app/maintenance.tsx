import { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Activity, deleteActivity, listActivities, listVehicles, saveActivity, toggleActivity, Vehicle } from '@/database/database';
import { Body, Button, Card, EmptyState, Field, Screen, SectionTitle, StatusBadge, Title, useUiColors, errorMessage, isValidDate, message } from '@/components/ui-kit';
import { activityStatus } from '@/utils/business-rules';
const categories=['Aceite','Filtros','Frenos','Llantas','Batería','Refrigeración','Suspensión','Transmisión','Otros'];
const blank={name:'',category:'Aceite',description:'',due_date:'',due_mileage:'',advance_days:'14',advance_km:'500',period_days:'',period_km:''};
export default function Maintenance(){const colors=useUiColors();const styles=makeStyles(colors);const [vehicles,setVehicles]=useState<Vehicle[]>([]);const [activities,setActivities]=useState<(Activity&{plate:string;mileage:number})[]>([]);const [vehicleId,setVehicleId]=useState<number>();const [form,setForm]=useState(blank);const [editing,setEditing]=useState<number>();
 const load=useCallback(async()=>{const [v,a]=await Promise.all([listVehicles(false),listActivities()]);setVehicles(v);setActivities(a);if(!vehicleId&&v[0])setVehicleId(v[0].id);},[vehicleId]);const set=(k:keyof typeof blank,value:string)=>setForm(f=>({...f,[k]:value}));
 const edit=(a:Activity)=>{setEditing(a.id);setVehicleId(a.vehicle_id);setForm({name:a.name,category:a.category,description:a.description,due_date:a.due_date??'',due_mileage:a.due_mileage==null?'':String(a.due_mileage),advance_days:String(a.advance_days),advance_km:String(a.advance_km),period_days:a.period_days==null?'':String(a.period_days),period_km:a.period_km==null?'':String(a.period_km)});};
 const save=async()=>{try{if(!vehicleId)throw new Error('Registra un vehículo primero.');if(!form.name.trim())throw new Error('El nombre de la actividad es obligatorio.');const km=form.due_mileage?Number(form.due_mileage):null;const due=form.due_date||null;const advanceDays=Number(form.advance_days),advanceKm=Number(form.advance_km),periodDays=form.period_days?Number(form.period_days):null,periodKm=form.period_km?Number(form.period_km):null;if(!due&&km===null)throw new Error('Indica un vencimiento por fecha, kilometraje o ambos.');if(due&&!isValidDate(due))throw new Error('La fecha debe ser válida y tener formato AAAA-MM-DD.');if(km!==null&&(!Number.isInteger(km)||km<0))throw new Error('El kilometraje límite debe ser no negativo.');if(!Number.isInteger(advanceDays)||advanceDays<0||!Number.isInteger(advanceKm)||advanceKm<0)throw new Error('Los márgenes de anticipación deben ser enteros no negativos.');if((periodDays!==null&&(!Number.isInteger(periodDays)||periodDays<=0))||(periodKm!==null&&(!Number.isInteger(periodKm)||periodKm<=0)))throw new Error('La periodicidad debe ser un entero mayor a cero.');await saveActivity({id:editing,vehicle_id:vehicleId,name:form.name.trim(),category:form.category,description:form.description,due_date:due,due_mileage:km,advance_days:advanceDays,advance_km:advanceKm,period_days:periodDays,period_km:periodKm});setEditing(undefined);setForm(blank);await load();message('Actividad guardada','El plan se recalculó y quedó guardado.');}catch(e){message('No se pudo guardar',errorMessage(e));}};
 const remove=(activity:Activity)=>Alert.alert('Eliminar actividad',`¿Deseas eliminar “${activity.name}”? Solo se puede borrar si no tiene servicios asociados.`,[{text:'Cancelar',style:'cancel'},{text:'Eliminar',style:'destructive',onPress:()=>void (async()=>{try{await deleteActivity(activity.id);if(editing===activity.id){setEditing(undefined);setForm(blank);}await load();message('Actividad eliminada','La actividad se quitó del plan.');}catch(error){message('No se pudo eliminar',errorMessage(error));}})()}]);
 const today=new Date().toISOString().slice(0,10);const status=(a:Activity&{mileage:number})=>activityStatus(a,today);
 return (
  <Screen load={load}>
   <Title subtitle="Programa servicios por fecha o kilometraje y revisa qué debes atender próximamente.">Mantenimiento</Title>
   {vehicles.length===0 ? <Card><EmptyState icon="🛠️" title="Añade un vehículo para empezar">Cada actividad se asocia a un vehículo y sus vencimientos se calculan con los datos guardados.</EmptyState></Card> : (
    <>
     <Card>
      <SectionTitle>Vehículo asociado</SectionTitle>
      <View style={styles.vehicleChoices}>{vehicles.map(v=><Button key={v.id} compact secondary title={`${vehicleId===v.id?'✓ ':''}${v.plate} · ${v.brand}`} onPress={()=>setVehicleId(v.id)}/>)}</View>
     </Card>
     <Card>
      <SectionTitle detail="Define al menos una fecha o un límite de kilometraje">{editing?'Editar actividad':'Nueva actividad'}</SectionTitle>
      <Field label="Nombre de la actividad" value={form.name} onChangeText={v=>set('name',v)} required />
      <Field label="Categoría (también puedes escribir otra)" value={form.category} onChangeText={v=>set('category',v)} required />
      <ViewCategories set={v=>set('category',v)} styles={styles} />
      <Field label="Descripción" value={form.description} onChangeText={v=>set('description',v)} />
      <View style={styles.formDivider}/>
      <Text style={styles.groupTitle}>Vencimiento</Text>
      <Field label="Fecha límite (AAAA-MM-DD, opcional)" value={form.due_date} onChangeText={v=>set('due_date',v)} />
      <Field label="Kilometraje límite (opcional)" value={form.due_mileage} onChangeText={v=>set('due_mileage',v)} keyboardType="numeric" />
      <Text style={styles.helper}>Una actividad vence al pasar su fecha o al alcanzar su límite de kilometraje.</Text>
      <View style={styles.formDivider}/>
      <Text style={styles.groupTitle}>Anticipación y periodicidad</Text>
      <Field label="Avisar con cuántos días" value={form.advance_days} onChangeText={v=>set('advance_days',v)} keyboardType="numeric" />
      <Field label="Avisar con cuántos km" value={form.advance_km} onChangeText={v=>set('advance_km',v)} keyboardType="numeric" />
      <Field label="Repetir cada (días, opcional)" value={form.period_days} onChangeText={v=>set('period_days',v)} keyboardType="numeric" />
      <Field label="Repetir cada (km, opcional)" value={form.period_km} onChangeText={v=>set('period_km',v)} keyboardType="numeric" />
      <Button title={editing?'Guardar cambios':'Guardar actividad'} onPress={()=>void save()} />
      {editing&&<Button secondary title="Cancelar edición" onPress={()=>{setEditing(undefined);setForm(blank);}}/>}
     </Card>
    </>
   )}
   <SectionTitle detail={`${activities.length} registradas`}>Tu plan</SectionTitle>
   {activities.length===0 ? <Card><EmptyState icon="🗓️" title="Sin actividades todavía">Crea un recordatorio para visualizar aquí su estado y próximo vencimiento.</EmptyState></Card> : activities.map(a=>(
    <Card key={a.id}>
     <View style={styles.activityHeader}><View style={styles.activityCopy}><Text style={styles.activityTitle}>{a.name}</Text><Text style={styles.activityMeta}>{a.plate} · {a.category}</Text></View><StatusBadge label={status(a)}/></View>
     <View style={styles.duePanel}>
      <Text style={styles.dueCaption}>PRÓXIMO VENCIMIENTO</Text>
      <Text style={styles.dueValue}>{a.due_date?`📅 ${a.due_date}`:'Sin fecha'}{a.due_date&&a.due_mileage!=null?'  ·  ':''}{a.due_mileage!=null?`🛣️ ${a.due_mileage.toLocaleString()} km`:''}</Text>
     </View>
     {a.description ? <Body>{a.description}</Body> : null}
     <View style={styles.actionRow}>
      <Button compact secondary title="Editar" onPress={()=>edit(a)}/>
      <Button compact secondary title={a.paused?'Reactivar':'Pausar'} onPress={async()=>{await toggleActivity(a.id,a.paused?0:1);await load();}}/>
      <Button compact danger title="Eliminar" onPress={()=>remove(a)}/>
     </View>
    </Card>
   ))}
  </Screen>
 );
}
function ViewCategories({set,styles}:{set:(s:string)=>void;styles:ReturnType<typeof makeStyles>}) {return <View style={styles.categoryChoices}>{categories.map(c=><Button key={c} compact title={c} secondary onPress={()=>set(c)}/>)}</View>;}

function makeStyles(colors:ReturnType<typeof useUiColors>){return {vehicleChoices:{gap:7},categoryChoices:{flexDirection:'row' as const,flexWrap:'wrap' as const,gap:6},formDivider:{height:1,backgroundColor:colors.line,marginVertical:3},groupTitle:{fontSize:14,fontWeight:'800' as const,color:colors.navy},helper:{fontSize:12,lineHeight:17,color:colors.muted},activityHeader:{flexDirection:'row' as const,alignItems:'center' as const,justifyContent:'space-between' as const,gap:8},activityCopy:{flex:1,gap:4},activityTitle:{fontSize:16,fontWeight:'800' as const,color:colors.navy},activityMeta:{fontSize:12,color:colors.muted},duePanel:{padding:12,borderRadius:13,backgroundColor:colors.background,gap:5},dueCaption:{fontSize:10,fontWeight:'800' as const,letterSpacing:0.7,color:colors.muted},dueValue:{fontSize:14,fontWeight:'700' as const,color:colors.ink},actionRow:{flexDirection:'row' as const,gap:8}};}
