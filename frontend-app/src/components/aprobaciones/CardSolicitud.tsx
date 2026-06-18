import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { Solicitud } from '@/lib/aprobaciones';
import { AccionesAprobacion, ChipTexto, DotChip } from './primitives';

interface Props {
  item: Solicitud;
  onAprobar: () => void;
  onRechazar: () => void;
}

/** Tarjeta de Solicitudes (gestión de equipos): aprobador, tiendas, fecha. */
export function CardSolicitud({ item, onAprobar, onRechazar }: Props) {
  const pendiente = item.estado === 'PENDIENTE';
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.statusDot} />
        <Text style={styles.titulo} numberOfLines={1}>
          {item.aprobador} – {item.zona}
        </Text>
      </View>

      <View style={styles.tiendas}>
        {item.tiendas.map((t) => (
          <View key={t.nombre} style={styles.tienda}>
            <Text style={styles.tiendaNombre}>{t.nombre}</Text>
            <View style={styles.chipsRow}>
              {t.chips.map((c) => (
                <DotChip key={c} texto={c} />
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.fechaRow}>
        <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
        <Text style={styles.fecha}>Fecha: {item.fecha}</Text>
      </View>

      {pendiente ? (
        <AccionesAprobacion variante="solido" onAprobar={onAprobar} onRechazar={onRechazar} />
      ) : (
        <ChipTexto
          texto={item.estado === 'APROBADA' ? 'Aprobada' : 'Rechazada'}
          color={item.estado === 'APROBADA' ? colors.success : colors.danger}
          bg={item.estado === 'APROBADA' ? '#dcfce7' : '#fee2e2'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.warning },
  titulo: { flex: 1, fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  tiendas: { gap: spacing.md },
  tienda: { gap: spacing.xs },
  tiendaNombre: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  fechaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  fecha: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
});
