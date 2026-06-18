import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { SolicitudLicencia } from '@/lib/aprobaciones';
import { AccionesAprobacion, ChipGoce, ChipTexto } from './primitives';

interface Props {
  item: SolicitudLicencia;
  onAprobar: () => void;
  onRechazar: () => void;
}

/** Tarjeta de Licencias: empleado, goce, rango y motivo. */
export function CardLicencia({ item, onAprobar, onRechazar }: Props) {
  const pendiente = item.estado === 'PENDIENTE';
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.sub}>
            {item.tienda} · {item.puesto}
          </Text>
        </View>
        <ChipGoce goce={item.goce} />
      </View>

      <View style={styles.divider} />

      <View style={styles.rango}>
        <Ionicons name="calendar-outline" size={15} color={colors.brandIndigo} />
        <Text style={styles.rangoText}>
          {item.desde} — {item.hasta}
        </Text>
      </View>
      <Text style={styles.motivo}>"{item.motivo}"</Text>

      {pendiente ? (
        <AccionesAprobacion variante="gradiente" onAprobar={onAprobar} onRechazar={onRechazar} />
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
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  nombre: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  sub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border },
  rango: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rangoText: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  motivo: { fontSize: fontSize.sm, color: colors.textMuted, fontStyle: 'italic' },
});
