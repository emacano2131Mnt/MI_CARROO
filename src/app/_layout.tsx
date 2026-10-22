import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppTabs from '@/components/app-tabs';
import { initializeDatabase } from '@/database/database';
import { ThemeProvider, useTheme } from '@/hooks/theme-context';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  useEffect(() => { initializeDatabase().then(() => setReady(true)); }, []);
  if (!ready) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  return <ThemeProvider><ThemedApp /></ThemeProvider>;
}

function ThemedApp() {
  const { mode } = useTheme();
  return <><StatusBar style={mode === 'dark' ? 'light' : 'dark'} /><AppTabs /></>;
}
