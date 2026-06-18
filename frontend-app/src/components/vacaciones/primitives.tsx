import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { SaldoVac, VacKpis } from '@/lib/vacaciones';

/** Paleta de saldos de vacaciones (calca el mockup). */
export const vacColors = {
  indemn: colors.brandBlue, // azul
  pendientes: '#ea580c', // naranja
  truncos: '#7c3aed', // morado
  totales: colors.success, // verde
} as const;

// --- Tira de 4 KPIs (cabecera del módulo) -----------------------------------

export function KpiVacStrip({ kpis }: { kpis: VacKpis }) {
  const items = [
    { label: 'INDEMN.', value: kpis.indemnizables, color: vacColors.indemn },
    { label: 'PENDIENTES', value: kpis.pendientes, color: vacColors.pendientes },
    { label: 'TRUNCOS', value: kpis.truncos, color: vacColors.truncos },
    { label: 'TOTALES', value: kpis.totales, color: vacColors.totales },
  ];
  return (
    <View style={styles.strip}>
      {items.map((it) => (
        <View key={it.label} style={styles.kpi}>
          <Text style={styles.kpiLabel}>{it.label}</Text>
          <Text style={[styles.kpiValue, { color: it.color }]}>{it.value}</Text>
        </View>
      ))}
    </View>
  );
}

// --- Saldo en línea ("Indemn. 5  Pendientes 3  Truncos 5") -------------------

export function SaldoInline({ saldo, muted }: { saldo: SaldoVac; muted?: boolean }) {
  return (
    <View style={styles.inlineRow}>
      <SaldoItem label="Indemn." value={saldo.indemnizables} color={vacColors.indemn} muted={muted} />
      <SaldoItem label="Pendientes" value={saldo.pendientes} color={vacColors.pendientes} muted={muted} />
      <SaldoItem label="Truncos" value={saldo.truncos} color={vacColors.truncos} muted={muted} />
    </View>
  );
}

function SaldoItem({ label, value, color, muted }: { label: string; value: number; color: string; muted?: boolean }) {
  return (
    <Text style={[styles.inlineLabel, muted && styles.inlineMuted]}>
      {label} <Text style={[styles.inlineValue, { color }]}>{value}</Text>
    </Text>
  );
}

// --- Tres tarjetas de saldo (cabecera de los sheets) ------------------------

export function SaldoCards({ saldo }: { saldo: SaldoVac }) {
  const items = [
    { label: 'INDEMNIZ.', value: saldo.indemnizables, color: vacColors.indemn, bg: '#eff6ff' },
    { label: 'PENDIENTES', value: saldo.pendientes, color: vacColors.pendientes, bg: '#fff7ed' },
    { label: 'TRUNCOS', value: saldo.truncos, color: vacColors.truncos, bg: '#f5f3ff' },
  ];
  return (
    <View style={styles.cardsRow}>
      {items.map((it) => (
        <View key={it.label} style={[styles.saldoCard, { backgroundColor: it.bg }]}>
          <Text style={[styles.saldoValue, { color: it.color }]}>{it.value}</Text>
          <Text style={styles.saldoLabel}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

// --- Chip de estado de vencimiento ------------------------------------------

export function EstadoVencimiento({ indemnizable, diasPendientes }: { indemnizable: boolean; diasPendientes?: number }) {
  if (indemnizable) {
    return (
      <View style={[styles.estadoChip, styles.estadoIndemn]}>
        <Ionicons name="warning" size={12} color={colors.danger} />
        <Text style={[styles.estadoText, { color: colors.danger }]}>Indemnizable</Text>
      </View>
    );
  }
  return (
    <View style={[styles.estadoChip, styles.estadoDias]}>
      <Text style={[styles.estadoText, { color: vacColors.pendientes }]}>
        {diasPendientes ?? 0} días pendientes
      </Text>
    </View>
  );
}

// --- Chip de estado de periodo (historial) ----------------------------------

export function EstadoPeriodoChip({ estado }: { estado: 'PROGRAMADA' | 'TOMADA' | 'PENDIENTE' }) {
  const map = {
    PROGRAMADA: { texto: 'Programada', color: colors.brandBlue, bg: '#dbeafe' },
    TOMADA: { texto: 'Tomada', color: colors.success, bg: '#dcfce7' },
    PENDIENTE: { texto: 'Pendiente', color: vacColors.pendientes, bg: '#fff7ed' },
  }[estado];
  return (
    <View style={[styles.periodoChip, { backgroundColor: map.bg }]}>
      <Text style={[styles.periodoText, { color: map.color }]}>{map.texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
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
  kpi: { flex: 1, alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs },
  kpiLabel: { fontSize: 9, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.4 },
  kpiValue: { fontSize: fontSize.xl, fontWeight: '800' },

  inlineRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  inlineLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  inlineMuted: { opacity: 0.85 },
  inlineValue: { fontSize: fontSize.sm, fontWeight: '800' },

  cardsRow: { flexDirection: 'row', gap: spacing.md },
  saldoCard: { flex: 1, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', gap: 2 },
  saldoValue: { fontSize: fontSize.xl, fontWeight: '800' },
  saldoLabel: { fontSize: 9, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.4 },

  estadoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  estadoIndemn: { backgroundColor: '#fee2e2' },
  estadoDias: { backgroundColor: '#fff7ed' },
  estadoText: { fontSize: fontSize.xs, fontWeight: '700' },

  periodoChip: { paddingHorizontal: spacing.md, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  periodoText: { fontSize: fontSize.xs, fontWeight: '700' },
});
