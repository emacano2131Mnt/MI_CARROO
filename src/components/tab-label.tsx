import { StyleSheet, Text, View, useWindowDimensions, type ColorValue } from 'react-native';

export function TabLabel({ emoji, label, color, focused }: { emoji: string; label: string; color: ColorValue; focused: boolean }) {
  const { width } = useWindowDimensions();
  const compactLabel = width < 468 && (label === 'Mantenimiento' || label === 'Configuración')
    ? label === 'Mantenimiento' ? 'Manteni\nmiento' : 'Configu\nración'
    : label;
  return (
    <View style={styles.container}>
      <Text accessibilityElementsHidden style={styles.emoji}>{emoji}</Text>
      <Text numberOfLines={2} style={[styles.label, { color }, focused && styles.active]}>{compactLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', width: '100%', minWidth: 0, gap: 2, paddingVertical: 2 },
  emoji: { fontSize: 24, lineHeight: 26, textAlign: 'center' },
  label: { width: '100%', fontSize: 10, lineHeight: 12, fontWeight: '600', textAlign: 'center' },
  active: { fontWeight: '800' },
});
