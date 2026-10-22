import { Tabs } from 'expo-router';

import { useThemeColors } from '@/hooks/theme-context';

export default function AppTabs() {
  const colors = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarIcon: () => null,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 9, fontWeight: '700', marginTop: 2, marginBottom: 3 },
        tabBarItemStyle: { paddingHorizontal: 0 },
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 7,
          elevation: 12,
          shadowColor: colors.shadow,
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
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
