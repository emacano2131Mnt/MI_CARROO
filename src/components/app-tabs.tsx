import { Tabs } from 'expo-router';

import { TabLabel } from '@/components/tab-label';
import { tabItems } from '@/constants/tab-items';
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
        tabBarLabelStyle: { margin: 0 },
        tabBarItemStyle: { paddingHorizontal: 0, paddingTop: 2 },
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 4,
          elevation: 12,
          shadowColor: colors.shadow,
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      {tabItems.map(item => (
        <Tabs.Screen
          key={item.route}
          name={item.route}
          options={{
            title: item.title,
            tabBarAccessibilityLabel: item.title,
            tabBarLabel: ({ color, focused }) => <TabLabel emoji={item.emoji} label={item.label} color={color} focused={focused} />,
          }}
        />
      ))}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
