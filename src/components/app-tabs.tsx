import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';

import { TabLabel } from '@/components/tab-label';
import { tabItems } from '@/constants/tab-items';
import { useThemeColors } from '@/hooks/theme-context';

export default function AppTabs() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarIcon: () => null,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { margin: 0, flex: 1, fontSize: 10 },
        tabBarItemStyle: { flex: 1, minWidth: 0, paddingHorizontal: 1, paddingVertical: 2 },
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: 3,
          height: 62 + insets.bottom,
          // Expo Router's tab bar already adds the device bottom inset and paints it with this background.
          // Do not add a second SafeAreaView or bottom padding here.
          elevation: 2,
          shadowColor: colors.shadow,
          shadowOpacity: 0.04,
          shadowRadius: 4,
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
            tabBarLabel: ({ color, focused }) => <TabLabel emoji={item.emoji} label={item.label} color={focused ? colors.tabActive : colors.muted} focused={focused} />,
          }}
        />
      ))}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
