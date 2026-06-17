import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AsesorItem } from '@/lib/types';
import { colors, fontSize, radius, spacing } from '@/theme';

interface AsesorRowProps {
  asesor: AsesorItem;
  /** Acción al tocar un botón-ícono. La pantalla decide (placeholder por ahora). */
  onAccion: (accion: 'estado' | 'detalle' | 'ficha', asesor: AsesorItem) => void;
}

/**
 * Fila de asesor reutilizable (drill-down y detalle de tienda):
 * nombre, badge "Senior", vigencia y 3 botones-ícono de acción.
 */
export function AsesorRow({ asesor, onAccion }: AsesorRowProps) {
  const destacado = asesor.activo; // estado/marcación: ámbar si activo/destacado
  const tieneVigencia = !!(asesor.vigenciaDesde && asesor.vigenciaHasta);

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{iniciales(asesor.nombreCompleto)}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.nombreRow}>
          <Text style={styles.nombre} numberOfLines={1}>
            {asesor.nombreCompleto}
          </Text>
          {asesor.esSenior ? (
            <View style={styles.seniorBadge}>
              <Text style={styles.seniorText}>Senior</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.puesto} numberOfLines={1}>
          {asesor.puesto}
        </Text>
        {tieneVigencia ? (
          <Text style={styles.vigencia}>
            Vigencia: {asesor.vigenciaDesde} – {asesor.vigenciaHasta}
          </Text>
        ) : null}
      </View>

      <View style={styles.acciones}>
        <Pressable
          hitSlop={6}
          onPress={() => onAccion('estado', asesor)}
          accessibilityLabel="Estado / marcación"
          style={[styles.iconBtn, destacado && styles.iconBtnActivo]}
        >
          <Ionicons
            name="ellipse"
            size={16}
            color={destacado ? colors.warning : colors.textMuted}
          />
        </Pressable>
        <Pressable
          hitSlop={6}
          onPress={() => onAccion('detalle', asesor)}
          accessibilityLabel="Ver detalle del asesor"
          style={styles.iconBtn}
        >
          <Ionicons name="arrow-forward" size={18} color={colors.brandIndigo} />
        </Pressable>
        <Pressable
          hitSlop={6}
          onPress={() => onAccion('ficha', asesor)}
          accessibilityLabel="Ver ficha / rol"
          style={styles.iconBtn}
        >
          <Ionicons name="document-text-outline" size={18} color={colors.brandIndigo} />
        </Pressable>
      </View>
    </View>
  );
}

function iniciales(nombre: string): string {
  const parts = nombre.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '';
  const b = parts[1]?.[0] ?? '';
  return (a + b).toUpperCase() || '?';
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.brandIndigo, fontWeight: '800', fontSize: fontSize.xs },
  nombreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  nombre: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, flexShrink: 1 },
  seniorBadge: {
    backgroundColor: '#f3e8ff',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  seniorText: { color: colors.tile.aprobaciones, fontSize: 10, fontWeight: '800' },
  puesto: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  vigencia: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  acciones: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActivo: { backgroundColor: '#fef3c7' },
});
