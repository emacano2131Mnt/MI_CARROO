import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, useColorScheme as useSystemColorScheme, View } from 'react-native';
import SQLiteStorage from 'expo-sqlite/kv-store';

import { MiCarroPalette, ThemeColors, ThemeMode, ThemePreference } from '@/constants/theme';

type ThemeContextValue = {
  preference: ThemePreference;
  mode: ThemeMode;
  colors: MiCarroPalette;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const preferenceKey = 'micarro.theme.preference';
const ThemeContext = createContext<ThemeContextValue | null>(null);

async function readPreference(): Promise<ThemePreference | null> {
  try {
    const stored = Platform.OS === 'web'
      ? (typeof window === 'undefined' ? null : window.localStorage.getItem(preferenceKey))
      : await SQLiteStorage.getItemAsync(preferenceKey);
    return stored === 'light' || stored === 'dark' || stored === 'automatic' ? stored : null;
  } catch {
    return null;
  }
}

async function savePreference(preference: ThemePreference) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.setItem(preferenceKey, preference);
  } else {
    await SQLiteStorage.setItemAsync(preferenceKey, preference);
  }
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('automatic');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    void readPreference().then(stored => {
      if (mounted && stored) setPreferenceState(stored);
      if (mounted) setLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  const setPreference = useCallback(async (next: ThemePreference) => {
    const previous = preference;
    setPreferenceState(next);
    try {
      await savePreference(next);
    } catch (error) {
      setPreferenceState(previous);
      throw error;
    }
  }, [preference]);

  const mode: ThemeMode = preference === 'automatic' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  const value = useMemo(() => ({ preference, mode, colors: ThemeColors[mode], setPreference }), [preference, mode, setPreference]);

  return <ThemeContext.Provider value={value}>{loaded ? children : <View style={{ flex: 1, backgroundColor: value.colors.background, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={value.colors.primary} /></View>}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme debe utilizarse dentro de ThemeProvider.');
  return value;
}

export function useThemeColors() {
  return useTheme().colors;
}
