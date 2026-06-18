import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { Goce } from '@/lib/aprobaciones';

// --- Pills de filtro ---------------------------------------------------------

export interface PillDef<T extends string> {
  key: T;
  label: string;
  count: number;
}

interface FiltroPillsProps<T extends string> {
  options: PillDef<T>[];
  value: T;
  onChange: (v: T) => void;
}

/** Fila horizontal de pills de filtro. Activa = índigo lleno. */
export function FiltroPills<T extends string>({ options, value, onChange }: FiltroPillsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pillsRow}
    >
      {options.map((o) => {
        const activo = o.key === value;
        return (
          <Pressable
            key={o.key}
            style={[styles.pill, activo ? styles.pillActiva : styles.pillInactiva]}
            onPress={() => onChange(o.key)}
          >
            <Text style={[styles.pillText, activo ? styles.pillTextActiva : styles.pillTextInactiva]}>
              {o.label} {o.count}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// --- Chip con punto verde ("1 ASES", "1 SEC/PT") -----------------------------

export function DotChip({ texto }: { texto: string }) {
  return (
    <View style={styles.dotChip}>
      <View style={styles.dot} />
      <Text style={styles.dotChipText}>{texto}</Text>
    </View>
  );
}

// --- Chip de goce de haber ---------------------------------------------------

export function ChipGoce({ goce }: { goce: Goce }) {
  const con = goce === 'CON_GOCE';
  return (
    <View style={[styles.goceChip, con ? styles.gocePositivo : styles.goceNeutro]}>
      <Text style={[styles.goceText, { color: con ? colors.success : colors.warning }]}>
        {con ? 'Con goce de haber' : 'Sin goce de haber'}
      </Text>
    </View>
  );
}

// --- Chip de estado genérico (texto + color) ---------------------------------

export function ChipTexto({ texto, color, bg }: { texto: string; color: string; bg: string }) {
  return (
    <View style={[styles.estadoChip, { backgroundColor: bg }]}>
      <Text style={[styles.estadoText, { color }]}>{texto}</Text>
    </View>
  );
}

// --- Par de botones Aprobar / Rechazar ---------------------------------------

/** Variantes de estilo según mockup por bandeja. */
export type VarianteBotones = 'solido' | 'gradiente';

interface AccionesProps {
  variante: VarianteBotones;
  onAprobar: () => void;
  onRechazar: () => void;
  disabled?: boolean;
}

/**
 * `solido`: APROBAR negro + RECHAZAR rojo relleno (Solicitudes).
 * `gradiente`: APROBAR gradiente índigo + RECHAZAR outline rojo (Licencias/Ascensos).
 */
export function AccionesAprobacion({ variante, onAprobar, onRechazar, disabled }: AccionesProps) {
  if (variante === 'solido') {
    return (
      <View style={styles.btnRow}>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnNegro, pressed && styles.pressed, disabled && styles.btnDisabled]}
          onPress={onAprobar}
          disabled={disabled}
        >
          <Text style={styles.btnTextClaro}>APROBAR</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnRojo, pressed && styles.pressed, disabled && styles.btnDisabled]}
          onPress={onRechazar}
          disabled={disabled}
        >
          <Text style={styles.btnTextClaro}>RECHAZAR</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={styles.btnRow}>
      <Pressable
        style={({ pressed }) => [styles.btn, styles.btnGradWrap, pressed && styles.pressed, disabled && styles.btnDisabled]}
        onPress={onAprobar}
        disabled={disabled}
      >
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btnGrad}
        >
          <Text style={styles.btnTextClaro}>APROBAR</Text>
        </LinearGradient>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.btn, styles.btnOutline, pressed && styles.pressed, disabled && styles.btnDisabled]}
        onPress={onRechazar}
        disabled={disabled}
      >
        <Text style={styles.btnTextOutline}>RECHAZAR</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // Pills
  pillsRow: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  pillActiva: { backgroundColor: colors.brandIndigo },
  pillInactiva: { backgroundColor: '#e5e7eb' },
  pillText: { fontSize: fontSize.sm, fontWeight: '700' },
  pillTextActiva: { color: colors.white },
  pillTextInactiva: { color: colors.textMuted },

  // Dot chip
  dotChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  dotChipText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.text },

  // Goce
  goceChip: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  gocePositivo: { backgroundColor: '#dcfce7' },
  goceNeutro: { backgroundColor: '#fef3c7' },
  goceText: { fontSize: fontSize.xs, fontWeight: '700' },

  // Estado genérico
  estadoChip: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  estadoText: { fontSize: fontSize.xs, fontWeight: '700' },

  // Botones
  btnRow: { flexDirection: 'row', gap: spacing.md },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  btnNegro: { backgroundColor: '#111827' },
  btnRojo: { backgroundColor: '#ef4444' },
  btnGradWrap: {},
  btnGrad: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  btnOutline: { borderWidth: 1.5, borderColor: '#ef4444', backgroundColor: colors.card },
  btnDisabled: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
  btnTextClaro: { color: colors.white, fontSize: fontSize.sm, fontWeight: '800', letterSpacing: 0.3 },
  btnTextOutline: { color: '#ef4444', fontSize: fontSize.sm, fontWeight: '800', letterSpacing: 0.3 },
});
