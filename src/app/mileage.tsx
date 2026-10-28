import { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { addReading, listReadings, listVehicles, Vehicle } from '@/database/database';
import { Body, Button, Card, EmptyState, Field, MetricCard, Screen, SectionTitle, Title, useUiColors, errorMessage, isValidDate, message } from '@/components/ui-kit';
import { isValidOdometer, sanitizeIntegerInput } from '@/utils/vehicle-rules';

export default function Mileage() {
  const colors = useUiColors();
  const styles = makeStyles(colors);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<number>();
  const [readings, setReadings] = useState<{ id: number; date: string; mileage: number }[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [mileage, setMileage] = useState('');
  const [mileageError, setMileageError] = useState<string>();
  const selectedVehicle = vehicles.find(vehicle => vehicle.id === selected);

  const load = useCallback(async () => {
    const availableVehicles = await listVehicles(false);
    setVehicles(availableVehicles);
    const id = selected ?? availableVehicles[0]?.id;
    if (id) {
      setSelected(id);
      setReadings(await listReadings(id));
    }
  }, [selected]);

  const choose = async (id: number) => {
    setSelected(id);
    setReadings(await listReadings(id));
  };

  const save = async (confirmed = false) => {
    try {
      const value = Number(mileage);
      if (!selected) throw new Error('Registra o selecciona un vehículo primero.');
      if (!isValidDate(date)) throw new Error('Usa una fecha válida con formato AAAA-MM-DD.');
      if (!isValidOdometer(mileage)) throw new Error('El kilometraje debe ser un entero de hasta 7 dígitos (máximo 9.999.999 km).');
      const previous = readings[0]?.mileage ?? selectedVehicle?.mileage ?? 0;
      if (value < previous && !confirmed) {
        Alert.alert('Lectura menor a la anterior', `La última lectura fue ${previous.toLocaleString()} km. ¿Confirmas guardar ${value.toLocaleString()} km?`, [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar lectura', onPress: () => void save(true) },
        ]);
        return;
      }
      await addReading(selected, date, value);
      setReadings(await listReadings(selected));
      setVehicles(await listVehicles(false));
      setMileage('');
      setMileageError(undefined);
      message('Lectura guardada', 'El odómetro actual y los estados de mantenimiento se actualizaron.');
    } catch (error) {
      message('No se pudo guardar', errorMessage(error));
    }
  };

  return (
    <Screen load={load}>
      <Title subtitle="Lleva el historial del odómetro y actualiza los vencimientos basados en kilometraje.">Kilometraje</Title>
      {vehicles.length === 0 ? (
        <Card><EmptyState icon="🛣️" title="Primero registra un vehículo">Luego podrás guardar lecturas y revisar cómo cambia su kilometraje.</EmptyState></Card>
      ) : (
        <>
          <Card>
            <SectionTitle>Selecciona el vehículo</SectionTitle>
            <View style={styles.vehicleChoices}>
              {vehicles.map(vehicle => (
                <Button key={vehicle.id} title={`${selected===vehicle.id?'✓  ':''}${vehicle.plate} · ${vehicle.brand} ${vehicle.model}`} secondary onPress={()=>void choose(vehicle.id)} />
              ))}
            </View>
          </Card>

          {selectedVehicle && <MetricCard label="Odómetro actual" value={selectedVehicle.mileage.toLocaleString()} hint={`${selectedVehicle.plate} · kilómetros`} tone="teal" />}

          <Card>
            <SectionTitle detail="Confirma si la lectura es menor a la registrada">Nueva lectura</SectionTitle>
            <Field label="Fecha de lectura (AAAA-MM-DD)" value={date} onChangeText={setDate} required />
            <Field label="Odómetro (km)" value={mileage} onChangeText={raw => { const result = sanitizeIntegerInput(raw, 7); setMileage(result.value); setMileageError(result.exceedsLimit ? 'Máximo 7 dígitos (9.999.999 km).' : result.hasInvalidCharacters ? 'Usa solo números enteros.' : undefined); }} keyboardType="numeric" required error={mileageError} placeholder="0 a 9.999.999" />
            <Button title="Guardar lectura" onPress={()=>void save()} />
          </Card>

          <Card>
            <SectionTitle detail={`${readings.length} ${readings.length === 1 ? 'lectura guardada' : 'lecturas guardadas'}`}>Historial de lecturas</SectionTitle>
            {readings.length === 0 ? (
              <Body>Aún no hay lecturas adicionales para este vehículo.</Body>
            ) : readings.map((reading, index) => (
              <View key={reading.id} style={styles.readingRow}>
                <View style={styles.readingDate}><Text style={styles.readingDateText}>{reading.date}</Text><Text style={styles.readingCaption}>{index===0?'Más reciente':'Lectura registrada'}</Text></View>
                <Text style={styles.readingValue}>{reading.mileage.toLocaleString()} <Text style={styles.readingUnit}>km</Text></Text>
              </View>
            ))}
          </Card>
        </>
      )}
    </Screen>
  );
}

function makeStyles(colors: ReturnType<typeof useUiColors>) { return {vehicleChoices:{gap:8},readingRow:{flexDirection:'row' as const,justifyContent:'space-between' as const,alignItems:'center' as const,paddingVertical:10,borderTopWidth:1,borderTopColor:colors.line},readingDate:{gap:3},readingDateText:{fontSize:14,fontWeight:'700' as const,color:colors.ink},readingCaption:{fontSize:11,color:colors.muted},readingValue:{fontSize:18,fontWeight:'800' as const,color:colors.navy},readingUnit:{fontSize:12,fontWeight:'600' as const,color:colors.muted}}; }
