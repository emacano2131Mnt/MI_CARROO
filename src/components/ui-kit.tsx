import { PropsWithChildren, ReactNode, useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { useThemeColors } from '@/hooks/theme-context';
import { isValidISODate } from '@/utils/business-rules';

export function useUiColors() {
  const c = useThemeColors();
  return useMemo(() => ({ ink: c.text, green: c.primary, pale: c.paleBlue, muted: c.muted, line: c.border, white: c.white, red: c.danger, navy: c.navy, teal: c.teal, background: c.background, onNavy: c.onNavy, onNavyAccent: c.onNavyAccent }), [c]);
}

export function useUiStyles() {
  const c = useThemeColors();
  return useMemo(() => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.background },
    screen: { flex: 1, backgroundColor: c.background },
    content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 32, gap: 14 },
    titleBlock: { gap: 5, marginBottom: 2 },
    title: { fontSize: 28, lineHeight: 34, fontWeight: '800', color: c.navy, letterSpacing: -0.4 },
    subtitle: { color: c.muted, fontSize: 14, lineHeight: 20 },
    sectionTitleBlock: { gap: 3, marginBottom: 2 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: c.navy },
    sectionDetail: { color: c.muted, fontSize: 13 },
    card: { backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 16, gap: 11, shadowColor: c.shadow, shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
    heroCard: { backgroundColor: c.navy, borderColor: c.navy, padding: 19 },
    softCard: { backgroundColor: c.surfaceSecondary, borderColor: c.border },
    metricCard: { flex: 1, minWidth: 88, borderRadius: 16, padding: 13, gap: 4, borderWidth: 1 },
    metricBlue: { backgroundColor: c.paleBlue, borderColor: c.border },
    metricTeal: { backgroundColor: c.paleTeal, borderColor: c.border },
    metricWarning: { backgroundColor: c.paleWarning, borderColor: c.border },
    metricDanger: { backgroundColor: c.paleDanger, borderColor: c.border },
    metricLabel: { color: c.muted, fontSize: 12, fontWeight: '600' },
    metricValue: { color: c.navy, fontSize: 27, fontWeight: '800', fontVariant: ['tabular-nums'] },
    metricHint: { color: c.muted, fontSize: 11 },
    badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
    badgeText: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
    emptyState: { alignItems: 'center', paddingVertical: 18, paddingHorizontal: 12, gap: 9 },
    emptyIcon: { fontSize: 34, marginBottom: 2 },
    emptyTitle: { color: c.navy, fontSize: 17, fontWeight: '700', textAlign: 'center' },
    quickAction: { flex: 1, minHeight: 78, paddingHorizontal: 5, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 15, backgroundColor: c.paleBlue },
    quickIcon: { fontSize: 22 },
    quickLabel: { color: c.navy, fontSize: 11, fontWeight: '700', textAlign: 'center' },
    field: { gap: 6 },
    label: { color: c.text, fontSize: 13, fontWeight: '600' },
    required: { color: c.danger },
    input: { minHeight: 48, backgroundColor: c.field, borderColor: c.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 10, fontSize: 16, color: c.text },
    button: { minHeight: 48, backgroundColor: c.primary, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    secondary: { backgroundColor: c.surfaceSecondary, borderWidth: 1, borderColor: c.border },
    compactButton: { flex: 1, minWidth: 0, paddingHorizontal: 8, minHeight: 44 },
    dangerButton: { backgroundColor: c.paleDanger, borderWidth: 1, borderColor: c.border },
    buttonText: { color: c.onPrimary, fontWeight: '700', fontSize: 14, textAlign: 'center' },
    secondaryText: { color: c.primary },
    dangerText: { color: c.danger },
    body: { color: c.muted, fontSize: 14, lineHeight: 21 },
    pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  }), [c]);
}

export function Screen({ children, load }: PropsWithChildren<{ load?: () => Promise<unknown> }>) {
  const styles = useUiStyles();
  const colors = useThemeColors();
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useCallback(async () => {
    if (!load) return;
    setRefreshing(true);
    try { await load(); } catch (error) { Alert.alert('Error', errorMessage(error)); }
    finally { setRefreshing(false); }
  }, [load]);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Title({ children, subtitle }: { children: string; subtitle?: string }) {
  const styles = useUiStyles();
  return <View style={styles.titleBlock}><Text style={styles.title}>{children}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>;
}

export function SectionTitle({ children, detail }: { children: string; detail?: string }) {
  const styles = useUiStyles();
  return <View style={styles.sectionTitleBlock}><Text style={styles.sectionTitle}>{children}</Text>{detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}</View>;
}

export function Card({ children, variant = 'default' }: PropsWithChildren<{ variant?: 'default' | 'hero' | 'soft' }>) {
  const styles = useUiStyles();
  return <View style={[styles.card, variant === 'hero' && styles.heroCard, variant === 'soft' && styles.softCard]}>{children}</View>;
}

export function MetricCard({ label, value, hint, tone = 'blue' }: { label: string; value: string | number; hint?: string; tone?: 'blue' | 'teal' | 'warning' | 'danger' }) {
  const styles = useUiStyles();
  const toneStyle = tone === 'teal' ? styles.metricTeal : tone === 'warning' ? styles.metricWarning : tone === 'danger' ? styles.metricDanger : styles.metricBlue;
  return <View style={[styles.metricCard, toneStyle]}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text>{hint ? <Text style={styles.metricHint}>{hint}</Text> : null}</View>;
}

export function StatusBadge({ label }: { label: string }) {
  const c = useThemeColors();
  const [backgroundColor, color] = label === 'Vencida' ? [c.paleDanger, c.danger]
    : label === 'Próxima' ? [c.paleWarning, c.warning]
      : label === 'Al día' || label === 'Activo' ? [c.paleSuccess, c.success]
        : label === 'Pausada' || label === 'Archivado' ? [c.neutral, c.muted]
          : [c.paleBlue, c.primary];
  return <View accessibilityLabel={`Estado: ${label}`} style={{ alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor }}><Text style={{ color, fontSize: 12, lineHeight: 16, fontWeight: '700' }}>{label}</Text></View>;
}

export function EmptyState({ icon = '🚘', title, children, action }: PropsWithChildren<{ icon?: string; title: string; action?: ReactNode }>) {
  const styles = useUiStyles();
  return <View style={styles.emptyState}><Text style={styles.emptyIcon} accessibilityElementsHidden>{icon}</Text><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.body}>{children}</Text>{action}</View>;
}

export function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const styles = useUiStyles();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}><Text style={styles.quickIcon} accessibilityElementsHidden>{icon}</Text><Text style={styles.quickLabel}>{label}</Text></Pressable>;
}

export function Label({ children }: { children: string }) {
  const styles = useUiStyles();
  return <Text style={styles.label}>{children}</Text>;
}

export function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', required = false, autoCapitalize = 'sentences' }: {
  label: string; value: string; onChangeText: (value: string) => void; placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad'; required?: boolean; autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  const styles = useUiStyles();
  const colors = useThemeColors();
  return <View style={styles.field}><Text style={styles.label}>{label}{required ? <Text style={styles.required}> *</Text> : null}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} keyboardType={keyboardType} autoCapitalize={autoCapitalize} style={styles.input} placeholderTextColor={colors.placeholder} selectionColor={colors.primary} /></View>;
}

export function Button({ title, onPress, secondary = false, compact = false, danger = false }: { title: string; onPress: () => void; secondary?: boolean; compact?: boolean; danger?: boolean }) {
  const styles = useUiStyles();
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, compact && styles.compactButton, danger && styles.dangerButton, pressed && styles.pressed]}><Text style={[styles.buttonText, secondary && styles.secondaryText, danger && styles.dangerText]}>{title}</Text></Pressable>;
}

export function Body({ children }: { children: ReactNode }) {
  const styles = useUiStyles();
  return <Text style={styles.body}>{children}</Text>;
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar la operación.';
}

export function message(title: string, detail: string) { Alert.alert(title, detail); }
export const isValidDate = isValidISODate;
