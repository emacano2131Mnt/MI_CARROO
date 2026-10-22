import { Tabs } from 'expo-router';

import { useThemeColors } from '@/hooks/theme-context';

export default function AppTabsWeb() {
  const colors = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarIcon: () => null,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          paddingTop: 7,
          maxWidth: 800,
          alignSelf: 'center',
          width: '100%',
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarLabel: '🏠 Inicio', tabBarAccessibilityLabel: 'Inicio' }} />
      <Tabs.Screen name="vehicles" options={{ title: 'Vehículos', tabBarLabel: '🚗 Autos', tabBarAccessibilityLabel: 'Vehículos' }} />
      <Tabs.Screen name="mileage" options={{ title: 'Kilometraje', tabBarLabel: '🛣️ Km', tabBarAccessibilityLabel: 'Kilometraje' }} />
      <Tabs.Screen name="maintenance" options={{ title: 'Mantenimiento', tabBarLabel: '🛠️ Plan', tabBarAccessibilityLabel: 'Plan de mantenimiento' }} />
      <Tabs.Screen name="history" options={{ title: 'Historial', tabBarLabel: '📋 Historial', tabBarAccessibilityLabel: 'Historial de servicios' }} />
      <Tabs.Screen name="settings" options={{ title: 'Ajustes', tabBarLabel: '⚙️ Ajustes', tabBarAccessibilityLabel: 'Ajustes de apariencia' }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
