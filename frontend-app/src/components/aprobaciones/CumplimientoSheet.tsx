import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { SolicitudAscenso } from '@/lib/aprobaciones';

interface Props {
  ascenso: SolicitudAscenso | null;
  onClose: () => void;
}

/**
 * Hoja inferior de SOLO LECTURA con la tabla de cumplimiento (6 meses):
 * % de cuota por mes, azul si ≥100, rojo si <100.
 */
export function CumplimientoSheet({ ascenso, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const visible = ascenso != null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]} onPress={() => {}}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={2}>
              Cumplimiento (6 meses) — {ascenso?.nombre}
            </Text>
            <Pressable hitSlop={10} onPress={onClose} style={styles.closeBtn} accessibilityLabel="Cerrar">
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.md }}>
            <Text style={styles.kicker}>CANDIDATO A SENIOR</Text>
            <Text style={styles.candidato}>{ascenso?.nombre}</Text>

            <View style={styles.tableHead}>
              <Text style={[styles.th, { flex: 1 }]}>MES</Text>
              <Text style={[styles.th, styles.thRight]}>% CUOTA ASESOR</Text>
            </View>
            {ascenso?.cumplimiento.map((m) => {
              const ok = m.pct >= 100;
              return (
                <View key={m.mes} style={styles.tr}>
                  <Text style={[styles.mes, { flex: 1 }]}>{m.mes}</Text>
                  <Text style={[styles.pct, { color: ok ? colors.brandBlue : colors.danger }]}>
                    {m.pct.toFixed(1)}%
                  </Text>
                </View>
              );
            })}

            <Text style={styles.nota}>
              Valores ≥ 100% en azul, &lt; 100% en rojo. Datos de ejemplo.
            </Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    maxHeight: '80%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  title: { flex: 1, fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: { fontSize: fontSize.xs, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 },
  candidato: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginTop: 2, marginBottom: spacing.lg },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
  },
  th: { fontSize: fontSize.xs, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 },
  thRight: { textAlign: 'right', minWidth: 130 },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mes: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  pct: { fontSize: fontSize.sm, fontWeight: '800', minWidth: 130, textAlign: 'right' },
  nota: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.lg },
});
