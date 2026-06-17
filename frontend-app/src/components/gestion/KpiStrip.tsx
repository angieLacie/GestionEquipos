import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GestionKpis } from '@/lib/types';
import { colors, fontSize, radius, spacing } from '@/theme';

/** Tira de 6 KPIs (PLANT./ACTIVOS/COBERT.%/DESC.M/VACAC./LICEN.). */
export function KpiStrip({ kpis }: { kpis: GestionKpis }) {
  const items: { label: string; value: string }[] = [
    { label: 'PLANT.', value: String(kpis.plantilla) },
    { label: 'ACTIVOS', value: String(kpis.activos) },
    { label: 'COBERT.%', value: `${kpis.coberturaPct}` },
    { label: 'DESC.M', value: String(kpis.descansoMedico) },
    { label: 'VACAC.', value: String(kpis.vacaciones) },
    { label: 'LICEN.', value: String(kpis.licencias) },
  ];
  return (
    <View style={styles.kpiStrip}>
      {items.map((it) => (
        <View key={it.label} style={styles.kpi}>
          <Text style={styles.kpiValue}>{it.value}</Text>
          <Text style={styles.kpiLabel}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

/** Chip pequeño DM/VAC/LIC con ícono. */
export function Chip({
  icon,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: `${color}1a` }]}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

/** Fila de chips DM/VAC/LIC a partir de unos KPIs. */
export function ChipsEstado({ kpis }: { kpis: GestionKpis }) {
  return (
    <View style={styles.chipsRow}>
      <Chip icon="medkit-outline" label={`DM ${kpis.descansoMedico}`} color={colors.danger} />
      <Chip icon="sunny-outline" label={`VAC ${kpis.vacaciones}`} color={colors.warning} />
      <Chip icon="document-text-outline" label={`LIC ${kpis.licencias}`} color={colors.tile.licencias} />
    </View>
  );
}

const styles = StyleSheet.create({
  kpiStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.card,
    margin: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  kpi: { width: '33.33%', alignItems: 'center', paddingVertical: spacing.sm },
  kpiValue: { fontSize: fontSize.xl, fontWeight: '800', color: colors.brandIndigo },
  kpiLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '700', letterSpacing: 0.5 },
  chipsRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  chipText: { fontSize: fontSize.xs, fontWeight: '700' },
});
