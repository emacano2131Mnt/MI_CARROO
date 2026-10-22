/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useThemeColors } from '@/hooks/theme-context';

export function useTheme() {
  const colors = useThemeColors();
  return {
    text: colors.text,
    background: colors.background,
    backgroundElement: colors.surface,
    backgroundSelected: colors.selected,
    textSecondary: colors.muted,
  };
}
