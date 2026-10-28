import { StyleSheet, Text, View, type ColorValue } from 'react-native';

export function TabLabel({ emoji, label, color, focused }: { emoji: string; label: string; color: ColorValue; focused: boolean }) {
  return (
    <View style={styles.container}>
      <Text accessibilityElementsHidden style={styles.emoji}>{emoji}</Text>
      <Text numberOfLines={1} style={[styles.label, { color }, focused && styles.active]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', minWidth: 48, gap: 1 },
  emoji: { fontSize: 21, lineHeight: 24, textAlign: 'center' },
  label: { fontSize: 9, lineHeight: 12, fontWeight: '600', textAlign: 'center' },
  active: { fontWeight: '800' },
});
