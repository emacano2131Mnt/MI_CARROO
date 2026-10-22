import { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { listVehicles, saveVehicle, setVehicleFlag, Vehicle } from '@/database/database';
import { Button, Card, EmptyState, Field, Screen, SectionTitle, StatusBadge, Title, useUiColors, errorMessage, message } from '@/components/ui-kit';

const blank={plate:'',type:'Automóvil',brand:'',line:'',model:'',year:'',mileage:'',color:'',vin:'',fuel:'',displacement:''};
export default function Vehicles() {
 const colors=useUiColors(); const styles=makeStyles(colors);
 const [vehicles,setVehicles]=useState<Vehicle[]>([]); const [form,setForm]=useState(blank); const [editing,setEditing]=useState<number|undefined>();
 const load=useCallback(async()=>setVehicles(await listVehicles()),[]); const set=(key:keyof typeof blank,value:string)=>setForm(current=>({...current,[key]:value}));
 const edit=(v:Vehicle)=>{setEditing(v.id);setForm({plate:v.plate,type:v.type,brand:v.brand,line:v.line,model:v.model,year:String(v.year),mileage:String(v.mileage),color:v.color??'',vin:v.vin??'',fuel:v.fuel??'',displacement:v.displacement??''});};
 const submit=async(confirmed=false)=>{try{const year=Number(form.year),mileage=Number(form.mileage);if(!form.plate.trim()||!form.type.trim()||!form.brand.trim()||!form.line.trim()||!form.model.trim()||form.year===''||form.mileage==='')throw new Error('Completa placa, tipo, marca, línea, modelo, año y kilometraje.');if(!Number.isInteger(year)||year<0||year>new Date().getFullYear()+1)throw new Error('El año no es válido.');if(!Number.isInteger(mileage)||mileage<0)throw new Error('El kilometraje debe ser un entero cero o mayor.');const current=vehicles.find(v=>v.id===editing);if(current&&mileage<current.mileage&&!confirmed){Alert.alert('Kilometraje menor al actual',`El vehículo tiene ${current.mileage.toLocaleString()} km. ¿Confirmas registrar una lectura inferior?`,[{text:'Cancelar',style:'cancel'},{text:'Confirmar',onPress:()=>void submit(true)}]);return;}await saveVehicle({id:editing,plate:form.plate,type:form.type,brand:form.brand,line:form.line,model:form.model,year,mileage,color:form.color,vin:form.vin,fuel:form.fuel,displacement:form.displacement});setForm(blank);setEditing(undefined);await load();message('Guardado','El vehículo quedó guardado en la base local.');}catch(e){message('No se pudo guardar',errorMessage(e));}};
 const toggle=(v:Vehicle)=>Alert.alert(v.active?'Archivar vehículo':'Reactivar vehículo',v.active?'El vehículo se ocultará de la flota activa y conservará su historial.':'El vehículo volverá a la flota activa.',[{text:'Cancelar',style:'cancel'},{text:v.active?'Archivar':'Reactivar',onPress:async()=>{await setVehicleFlag(v.id,'active',v.active?0:1);await load();}}]);
 return (
  <Screen load={load}>
   <Title subtitle="Registra tus vehículos y mantén a mano su placa, odómetro y estado.">Vehículos</Title>
   <Card>
    <SectionTitle detail="Los campos con * son obligatorios">{editing?'Editar vehículo':'Registrar vehículo'}</SectionTitle>
    <View style={styles.formSection}><Text style={styles.formSectionTitle}>Datos principales</Text>
     {(['plate','type','brand','line','model','year','mileage'] as const).map(k=><Field key={k} label={({plate:'Placa',type:'Tipo',brand:'Marca',line:'Línea',model:'Modelo',year:'Año',mileage:'Kilometraje actual (km)'} as const)[k]} required value={form[k]} onChangeText={v=>set(k,v)} keyboardType={k==='year'||k==='mileage'?'numeric':'default'} autoCapitalize={k==='plate'?'characters':'words'}/>)}
    </View>
    <View style={styles.formSection}><Text style={styles.formSectionTitle}>Información adicional</Text>
     {(['color','vin','fuel','displacement'] as const).map(k=><Field key={k} label={({color:'Color (opcional)',vin:'VIN (opcional)',fuel:'Combustible (opcional)',displacement:'Cilindraje (opcional)'} as const)[k]} value={form[k]} onChangeText={v=>set(k,v)} autoCapitalize={k==='vin'?'characters':'words'}/>)}
    </View>
    <Button title={editing?'Guardar cambios':'Registrar vehículo'} onPress={()=>void submit()}/>
    {editing&&<Button title="Cancelar edición" secondary onPress={()=>{setEditing(undefined);setForm(blank);}}/>}
   </Card>

   <SectionTitle detail={`${vehicles.length} en total`}>Tu lista</SectionTitle>
   {vehicles.length===0 ? <Card><EmptyState icon="🚘" title="Aún no hay vehículos">Completa el formulario para registrar el primero.</EmptyState></Card> : vehicles.map(v=>(
    <Card key={v.id}>
     <View style={styles.vehicleHeader}>
      <View style={styles.plateBlock}><Text style={styles.plateLabel}>PLACA</Text><Text style={styles.plate}>{v.plate}</Text></View>
      <View style={styles.badgeColumn}>{v.primary_vehicle&&<StatusBadge label="Principal"/>}<StatusBadge label={v.active?'Activo':'Archivado'}/></View>
     </View>
     <Text style={styles.vehicleName}>{v.brand} {v.line}</Text>
     <Text style={styles.vehicleDetails}>{v.type} · {v.model} · {v.year}</Text>
     <View style={styles.odometer}><Text style={styles.odometerLabel}>ODÓMETRO ACTUAL</Text><Text style={styles.odometerValue}>{v.mileage.toLocaleString()} <Text style={styles.odometerUnit}>km</Text></Text></View>
     <View style={styles.actionRow}>
      <Button compact title="Editar" secondary onPress={()=>edit(v)}/>
      <Button compact title={v.primary_vehicle?'Principal ✓':'Hacer principal'} secondary onPress={async()=>{await setVehicleFlag(v.id,'primary_vehicle',1);await load();}}/>
      <Button compact title={v.active?'Archivar':'Reactivar'} secondary onPress={()=>toggle(v)}/>
     </View>
    </Card>
   ))}
  </Screen>
 );
}

function makeStyles(colors:ReturnType<typeof useUiColors>){return {
 formSection:{gap:10},formSectionTitle:{fontSize:13,fontWeight:'700' as const,color:colors.green,paddingBottom:2},
 vehicleHeader:{flexDirection:'row' as const,justifyContent:'space-between' as const,alignItems:'flex-start' as const},
 plateBlock:{gap:3},plateLabel:{fontSize:10,fontWeight:'800' as const,letterSpacing:1,color:colors.muted},plate:{fontSize:22,fontWeight:'900' as const,color:colors.navy,letterSpacing:1.4},
 badgeColumn:{alignItems:'flex-end' as const,gap:6},vehicleName:{fontSize:18,fontWeight:'800' as const,color:colors.ink},vehicleDetails:{fontSize:13,color:colors.muted},
 odometer:{padding:12,borderRadius:13,backgroundColor:colors.background,gap:2},odometerLabel:{fontSize:10,fontWeight:'800' as const,letterSpacing:0.7,color:colors.muted},odometerValue:{fontSize:23,fontWeight:'800' as const,color:colors.navy},odometerUnit:{fontSize:13,fontWeight:'600' as const,color:colors.muted},
 actionRow:{flexDirection:'row' as const,gap:7,marginTop:2},
};}
