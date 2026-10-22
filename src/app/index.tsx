import { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Activity, dashboardData } from '@/database/database';
import { Body, Button, Card, EmptyState, MetricCard, QuickAction, Screen, SectionTitle, StatusBadge, Title, useUiColors } from '@/components/ui-kit';
import { activityStatus, ActivityStatus } from '@/utils/business-rules';

type DashboardData = Awaited<ReturnType<typeof dashboardData>>;

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({ count: 0, activities: [], services: [] });
  const colors = useUiColors();
  const styles = makeStyles(colors);
  const load = useCallback(async () => setData(await dashboardData()), []);
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const activities = useMemo(() => data.activities.map(activity => ({
    activity,
    status: activityStatus(activity, today),
  })), [data.activities, today]);
  const upcoming = activities.filter(item => item.status === 'Próxima').length;
  const overdue = activities.filter(item => item.status === 'Vencida').length;
  const recentSpend = data.services.reduce((sum, service) => sum + Number(service.total ?? 0), 0);

  return (
    <Screen load={load}>
      <Title subtitle="Organiza mantenimientos, controla el kilometraje y consulta los gastos de tus vehículos.">MiCarro</Title>

      {data.count === 0 ? (
        <Card>
          <EmptyState
            icon="🚘"
            title="Empieza con tu primer vehículo"
            action={<Button title="Registrar vehículo" onPress={() => router.navigate('/vehicles')} />}
          >
            Registra los datos básicos para organizar kilometraje, mantenimientos y servicios.
          </EmptyState>
        </Card>
      ) : (
        <>
          <Card variant="hero">
            <Text style={styles.heroEyebrow}>RESUMEN DE FLOTA</Text>
            <Text style={styles.heroTitle}>{data.count} {data.count === 1 ? 'vehículo activo' : 'vehículos activos'}</Text>
            <Text style={styles.heroCopy}>Consulta tus próximos servicios y mantén todo al día.</Text>
          </Card>
          <View style={styles.metricRow}>
            <MetricCard label="Vehículos" value={data.count} hint="activos" />
            <MetricCard label="Próximos" value={upcoming} hint="por atender" tone="warning" />
            <MetricCard label="Vencidos" value={overdue} hint="por revisar" tone="danger" />
          </View>
        </>
      )}

      <Card>
        <SectionTitle>Accesos rápidos</SectionTitle>
        <View style={styles.quickRow}>
          <QuickAction icon="🚗" label="Vehículo" onPress={() => router.navigate('/vehicles')} />
          <QuickAction icon="🛣️" label="Kilometraje" onPress={() => router.navigate('/mileage')} />
          <QuickAction icon="🛠️" label="Plan" onPress={() => router.navigate('/maintenance')} />
          <QuickAction icon="🧰" label="Servicio" onPress={() => router.navigate('/history')} />
        </View>
      </Card>

      <Card>
        <SectionTitle detail="Suma de los últimos cinco servicios registrados">Gasto reciente</SectionTitle>
        <Text style={styles.expense}>${recentSpend.toLocaleString('es-CO')}</Text>
      </Card>

      <Card>
        <SectionTitle detail="Calculado con fecha y kilometraje actuales">Próximos mantenimientos</SectionTitle>
        {activities.length === 0 ? (
          <Body>No hay actividades pendientes. Puedes crear un plan desde la pestaña Mantenimiento.</Body>
        ) : activities.map(({ activity, status }) => (
          <ActivityRow key={activity.id} activity={activity} status={status} colors={colors} />
        ))}
      </Card>

      <Card>
        <SectionTitle detail="Los más recientes primero">Actividad reciente</SectionTitle>
        {data.services.length === 0 ? (
          <EmptyState icon="🧾" title="Aún no hay servicios">
            Cuando registres un mantenimiento, aquí verás su descripción y costo.
          </EmptyState>
        ) : data.services.map(service => (
          <View key={service.id} style={styles.serviceRow}>
            <View style={styles.serviceCopy}>
              <Text style={styles.serviceTitle}>{service.description}</Text>
              <Text style={styles.serviceMeta}>{service.date} · {service.plate} · {service.kind}</Text>
            </View>
            <Text style={styles.serviceCost}>${Number(service.total).toLocaleString('es-CO')}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

function ActivityRow({ activity, status, colors }: { activity: Activity & { plate: string; mileage: number }; status: ActivityStatus; colors: ReturnType<typeof useUiColors> }) {
  const styles = makeStyles(colors);
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityCopy}>
        <Text style={styles.activityTitle}>{activity.name}</Text>
        <Text style={styles.activityMeta}>{activity.plate} · {activity.category}</Text>
        <Text style={styles.activityMeta}>
          {activity.due_date ? activity.due_date : ''}
          {activity.due_date && activity.due_mileage != null ? ' · ' : ''}
          {activity.due_mileage != null ? `${activity.due_mileage.toLocaleString()} km` : ''}
        </Text>
      </View>
      <StatusBadge label={status} />
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useUiColors>) { return {
  heroEyebrow: { color: colors.onNavyAccent, fontSize: 11, fontWeight: '800' as const, letterSpacing: 1.1 },
  heroTitle: { color: colors.white, fontSize: 22, fontWeight: '800' as const },
  heroCopy: { color: colors.onNavy, fontSize: 14, lineHeight: 20 },
  metricRow: { flexDirection: 'row' as const, gap: 8 },
  quickRow: { flexDirection: 'row' as const, gap: 9 },
  expense: { fontSize: 29, fontWeight: '800' as const, color: colors.navy },
  activityRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8, paddingVertical: 7, borderTopWidth: 1, borderTopColor: colors.line },
  activityCopy: { flex: 1, gap: 3 },
  activityTitle: { color: colors.ink, fontSize: 15, fontWeight: '700' as const },
  activityMeta: { color: colors.muted, fontSize: 12 },
  serviceRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.line },
  serviceCopy: { flex: 1, gap: 4 },
  serviceTitle: { color: colors.ink, fontSize: 14, fontWeight: '700' as const },
  serviceMeta: { color: colors.muted, fontSize: 12 },
  serviceCost: { color: colors.navy, fontWeight: '800' as const, fontSize: 14 },
}; }
