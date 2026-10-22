import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Screen, Title } from '@/components/ui-kit';
import { ThemePreference } from '@/constants/theme';
import { useTheme } from '@/hooks/theme-context';

const options: { value: ThemePreference; icon: string; title: string; detail: string }[] = [
  { value: 'light', icon: '☀️', title: 'Claro', detail: 'Mantén MiCarro con fondos luminosos.' },
  { value: 'dark', icon: '🌙', title: 'Oscuro', detail: 'Usa superficies oscuras y cómodas para la vista.' },
  { value: 'automatic', icon: '📱', title: 'Automático del dispositivo', detail: 'Sigue la apariencia configurada en tu dispositivo.' },
];

export default function Settings() {
  const { preference, setPreference, colors } = useTheme();
  const styles = StyleSheet.create({
    description: { color: colors.muted, fontSize: 14, lineHeight: 21 },
    option: { minHeight: 70, borderWidth: 1, borderColor: colors.border, borderRadius: 15, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface },
    optionSelected: { borderColor: colors.primary, backgroundColor: colors.selected },
    icon: { fontSize: 23 },
    copy: { flex: 1, gap: 3 },
    title: { color: colors.text, fontSize: 15, fontWeight: '700' },
    detail: { color: colors.muted, fontSize: 12, lineHeight: 17 },
    check: { color: colors.primary, fontSize: 18, fontWeight: '800' },
  });

  return (
    <Screen>
      <Title subtitle="Adapta los colores de MiCarro a tu gusto.">Ajustes</Title>
      <Card>
        <Text style={{ color: colors.navy, fontSize: 19, fontWeight: '800' }}>Apariencia</Text>
        <Text style={styles.description}>Personaliza la apariencia de MiCarro. El modo automático sigue la configuración de tu dispositivo.</Text>
        <View style={{ gap: 9, marginTop: 3 }}>
          {options.map(option => {
            const selected = preference === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${option.title}. ${option.detail}`}
                onPress={() => void setPreference(option.value).catch(() => Alert.alert('No se pudo guardar', 'Revisa el almacenamiento disponible e inténtalo de nuevo.'))}
                style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && { opacity: 0.78 }]}
              >
                <Text style={styles.icon} accessibilityElementsHidden>{option.icon}</Text>
                <View style={styles.copy}>
                  <Text style={styles.title}>{option.title}</Text>
                  <Text style={styles.detail}>{option.detail}</Text>
                </View>
                {selected ? <Text style={styles.check} accessibilityElementsHidden>✓</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </Card>
    </Screen>
  );
}
