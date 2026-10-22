/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#172B45',
    background: '#F4F6FA',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8F0FF',
    textSecondary: '#66758A',
  },
  dark: {
    text: '#F2F6FC',
    background: '#101923',
    backgroundElement: '#1A2735',
    backgroundSelected: '#203B5D',
    textSecondary: '#AAB8C8',
  },
} as const;

const sharedColors = {
  navy: '#17324D',
  teal: '#16A6A1',
  onNavy: '#D1DCEC',
  onNavyAccent: '#A9C5FF',
  white: '#FFFFFF',
  shadow: '#17324D',
} as const;

export const ThemeColors = {
  light: {
  background: '#F4F6FA',
  surface: '#FFFFFF',
  text: '#172B45',
  muted: '#66758A',
  border: '#E2E8F0',
  surfaceSecondary: '#F0F4FA',
  field: '#FFFFFF',
  placeholder: '#718096',
  tabBar: '#FFFFFF',
  selected: '#EAF1FF',
    primary: '#2468E8',
    primaryDark: '#245CC5',
    onPrimary: '#FFFFFF',
    success: '#18845B',
    warning: '#A96608',
    danger: '#B63C45',
  paleBlue: '#EAF1FF',
  paleTeal: '#E7F7F5',
  paleSuccess: '#E8F6EF',
  paleWarning: '#FFF4DB',
  paleDanger: '#FCEBED',
  neutral: '#EDF0F4',
  ...sharedColors,
  },
  dark: {
    background: '#101923',
    surface: '#1A2735',
    text: '#F2F6FC',
    muted: '#AAB8C8',
    border: '#334456',
    surfaceSecondary: '#223244',
    field: '#172433',
    placeholder: '#9AAABD',
    tabBar: '#172433',
    selected: '#203B5D',
    primary: '#88B4FF',
    primaryDark: '#AACBFF',
    onPrimary: '#102033',
    success: '#67D5A5',
    warning: '#FFC66B',
    danger: '#FF929A',
    paleBlue: '#203B5D',
    paleTeal: '#173B3A',
    paleSuccess: '#1A3C32',
    paleWarning: '#49381E',
    paleDanger: '#48262B',
    neutral: '#2D3B49',
    ...sharedColors,
  },
} as const;

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = ThemeMode | 'automatic';
export type MiCarroPalette = { [Key in keyof typeof ThemeColors.light]: string };

export const MiCarroColors = ThemeColors.light;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
