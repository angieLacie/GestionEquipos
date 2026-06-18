import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { SolicitudRol } from '@/lib/aprobaciones';
import { ChipTexto } from './primitives';

interface Props {
  item: SolicitudRol;
  onPress: () => void;
}

/** Tarjeta de Roles: tipo + estado + vencimiento, navegable a detalle. */
export function CardRol({ item, onPress }: Props) {
  const porVencer = item.estado === 'POR_VENCER';
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.head}>
        <Ionicons name="albums-outline" size={18} color={colors.brandIndigo} />
        <Text style={styles.tipo} numberOfLines={1}>
          {item.tipo}
        </Text>
        {porVencer ? (
          <ChipTexto texto="Por vencer" color={colors.warning} bg="#fef3c7" />
        ) : (
          <ChipTexto texto="Pendiente" color={colors.brandBlue} bg="#dbeafe" />
        )}
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>

      <View style={styles.linea}>
        <Ionicons name="location-outline" size={14} color={colors.danger} />
        <Text style={styles.lineaText}>
          {item.tienda} · {item.persona} ({item.rolPersona})
        </Text>
      </View>
      <View style={styles.linea}>
        <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
        <Text style={styles.lineaText}>
          {item.desde} – {item.hasta}
        </Text>
      </View>
      <Text style={styles.enviado}>
        Enviado por: {item.enviadoPor} ({item.cargoEnviador})
      </Text>
      <Text style={styles.vence}>
        Vence: {item.vence}{'  '}
        <Text style={styles.faltan}>(Faltan {item.faltanDias} días)</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pressed: { opacity: 0.9 },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  tipo: { flex: 1, fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  linea: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  lineaText: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  enviado: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  vence: { fontSize: fontSize.sm, color: colors.warning, fontWeight: '700', marginTop: 2 },
  faltan: { fontSize: fontSize.xs, color: colors.warning, fontWeight: '600' },
});
