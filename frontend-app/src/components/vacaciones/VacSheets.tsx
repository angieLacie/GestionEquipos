import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSize, radius, spacing } from '@/theme';
import { BottomSheet } from '@/components/BottomSheet';
import { DateField, FieldLabel, fechaValida } from '@/components/gestion/AccionFields';
import { diasEntre, programarVacaciones, type EmpleadoVac } from '@/lib/vacaciones';
import { EstadoPeriodoChip, SaldoCards } from './primitives';

/** Modo de hoja abierto para el empleado seleccionado. */
export type ModoVac = 'acciones' | 'programar' | 'resumen';

interface Props {
  empleado: EmpleadoVac | null;
  modo: ModoVac | null;
  onCambiarModo: (m: ModoVac) => void;
  onClose: () => void;
}

/** Orquesta las hojas del empleado: selector de acción, programar y resumen. */
export function VacSheets({ empleado, modo, onCambiarModo, onClose }: Props) {
  if (!empleado || !modo) return null;
  if (modo === 'acciones') {
    return <AccionesSheet empleado={empleado} onCambiarModo={onCambiarModo} onClose={onClose} />;
  }
  if (modo === 'programar') {
    return <ProgramarSheet empleado={empleado} onClose={onClose} />;
  }
  return <ResumenSheet empleado={empleado} onProgramar={() => onCambiarModo('programar')} onClose={onClose} />;
}

// --- Selector de acción (2 botones) -----------------------------------------

function AccionesSheet({
  empleado,
  onCambiarModo,
  onClose,
}: {
  empleado: EmpleadoVac;
  onCambiarModo: (m: ModoVac) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={2}>{empleado.nombre}</Text>
            <Pressable hitSlop={10} onPress={onClose} style={styles.closeBtn} accessibilityLabel="Cerrar">
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => onCambiarModo('programar')}
            style={({ pressed }) => [styles.gradWrap, pressed && styles.pressed]}
          >
            <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradBtn}>
              <Ionicons name="calendar" size={18} color={colors.white} />
              <Text style={styles.gradText}>Programar vacaciones</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => onCambiarModo('resumen')}
            style={({ pressed }) => [styles.lightBtn, pressed && styles.pressed]}
          >
            <Ionicons name="reader-outline" size={18} color={colors.brandIndigo} />
            <Text style={styles.lightText}>Ver resumen</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// --- Programar vacaciones ----------------------------------------------------

function ProgramarSheet({ empleado, onClose }: { empleado: EmpleadoVac; onClose: () => void }) {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [exito, setExito] = useState<string | null>(null);

  useEffect(() => {
    setDesde('');
    setHasta('');
    setSubmitting(false);
    setExito(null);
  }, [empleado.id]);

  const dias = diasEntre(desde, hasta);
  const valido = fechaValida(desde) && fechaValida(hasta) && dias > 0;

  async function confirmar() {
    setSubmitting(true);
    try {
      const r = await programarVacaciones({ idEmpleado: empleado.id, desde, hasta, dias });
      setExito(`✓ Programado (demo) · ${r.ref}`);
      setTimeout(() => {
        setSubmitting(false);
        onClose();
      }, 900);
    } catch {
      setSubmitting(false);
      setExito('No se pudo programar. Intenta nuevamente.');
    }
  }

  return (
    <BottomSheet
      visible
      title={`Programar vacaciones — ${empleado.nombre}`}
      confirmLabel="Programar vacaciones"
      confirmDisabled={!valido}
      submitting={submitting}
      onClose={() => (submitting ? null : onClose())}
      onConfirm={() => void confirmar()}
    >
      {exito ? (
        <View style={[styles.banner, exito.startsWith('✓') ? styles.bannerOk : styles.bannerErr]}>
          <Ionicons
            name={exito.startsWith('✓') ? 'checkmark-circle' : 'alert-circle'}
            size={18}
            color={exito.startsWith('✓') ? colors.success : colors.danger}
          />
          <Text style={[styles.bannerText, { color: exito.startsWith('✓') ? colors.success : colors.danger }]}>
            {exito}
          </Text>
        </View>
      ) : null}

      <SaldoCards saldo={empleado.saldo} />

      <View>
        <FieldLabel>RANGO DE FECHAS</FieldLabel>
        <View style={styles.rango}>
          <DateField value={desde} placeholder="dd/mm/aaaa" onChange={setDesde} />
          <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
          <DateField value={hasta} placeholder="dd/mm/aaaa" onChange={setHasta} />
        </View>
      </View>

      <View>
        <FieldLabel>DÍAS A TOMAR</FieldLabel>
        <View style={styles.diasBox}>
          <Text style={dias > 0 ? styles.diasValue : styles.diasPlaceholder}>
            {dias > 0 ? `${dias} día${dias === 1 ? '' : 's'}` : 'Selecciona el rango'}
          </Text>
        </View>
      </View>
    </BottomSheet>
  );
}

// --- Ver resumen (historial) ------------------------------------------------

function ResumenSheet({
  empleado,
  onProgramar,
  onClose,
}: {
  empleado: EmpleadoVac;
  onProgramar: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheetTall, { paddingBottom: insets.bottom + spacing.lg }]} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={2}>Resumen — {empleado.nombre}</Text>
            <Pressable hitSlop={10} onPress={onClose} style={styles.closeBtn} accessibilityLabel="Cerrar">
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={{ marginBottom: spacing.lg }}>
            <SaldoCards saldo={empleado.saldo} />
          </View>

          <Text style={styles.histTitle}>Historial de vacaciones</Text>
          <View style={styles.tableHead}>
            <Text style={[styles.th, { flex: 1.1 }]}>PERIODO</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>F. INICIO</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>F. FIN</Text>
            <Text style={[styles.th, { width: 32, textAlign: 'center' }]}>DÍAS</Text>
            <Text style={[styles.th, { flex: 1.6 }]}>ESTADO</Text>
          </View>
          <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
            {empleado.historial.map((p) => (
              <View key={p.periodo} style={styles.tr}>
                <Text style={[styles.td, { flex: 1.1 }]}>{p.periodo}</Text>
                <Text style={[styles.td, { flex: 1.2 }]}>{p.fInicio}</Text>
                <Text style={[styles.td, { flex: 1.2 }]}>{p.fFin}</Text>
                <Text style={[styles.tdBold, { width: 32, textAlign: 'center' }]}>{p.dias}</Text>
                <View style={{ flex: 1.6 }}>
                  <EstadoPeriodoChip estado={p.estado} />
                </View>
              </View>
            ))}
          </ScrollView>

          <Pressable onPress={onProgramar} style={({ pressed }) => [styles.gradWrap, pressed && styles.pressed]}>
            <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradBtn}>
              <Ionicons name="calendar" size={18} color={colors.white} />
              <Text style={styles.gradText}>Programar vacaciones</Text>
            </LinearGradient>
          </Pressable>
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
    gap: spacing.md,
  },
  sheetTall: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  title: { flex: 1, fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradWrap: { borderRadius: radius.md, overflow: 'hidden', marginTop: spacing.sm },
  gradBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  gradText: { color: colors.white, fontSize: fontSize.md, fontWeight: '800', letterSpacing: 0.3 },
  lightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: '#eef2ff',
  },
  lightText: { color: colors.brandIndigo, fontSize: fontSize.md, fontWeight: '800' },
  pressed: { opacity: 0.85 },
  rango: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  diasBox: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  diasValue: { fontSize: fontSize.md, color: colors.text, fontWeight: '700' },
  diasPlaceholder: { fontSize: fontSize.md, color: colors.textMuted },
  banner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.md, padding: spacing.md },
  bannerOk: { backgroundColor: '#ecfdf5' },
  bannerErr: { backgroundColor: '#fef2f2' },
  bannerText: { flex: 1, fontSize: fontSize.sm, fontWeight: '700' },
  histTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#f3f4f6',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  th: { fontSize: 9, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.3 },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  td: { fontSize: fontSize.xs, color: colors.text },
  tdBold: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text },
});
