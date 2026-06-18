import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { EmpleadoVac, TiendaVac } from '@/lib/vacaciones';
import { EstadoVencimiento, SaldoInline } from './primitives';

interface Props {
  tienda: TiendaVac;
  abierta: boolean;
  onToggle: () => void;
  onEmpleado: (e: EmpleadoVac) => void;
}

/** Tarjeta de tienda con acordeón de empleados. */
export function TiendaVacCard({ tienda, abierta, onToggle, onEmpleado }: Props) {
  return (
    <View style={styles.card}>
      <Pressable style={styles.head} onPress={onToggle}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nombre}>{tienda.nombre}</Text>
          <View style={{ marginTop: spacing.xs }}>
            <SaldoInline saldo={{ indemnizables: tienda.indemnizables, pendientes: tienda.pendientes, truncos: tienda.truncos }} muted />
          </View>
        </View>
        <View style={styles.totalChip}>
          <Text style={styles.totalText}>{tienda.total} total</Text>
        </View>
        <Ionicons name={abierta ? 'chevron-down' : 'chevron-forward'} size={18} color={colors.textMuted} />
      </Pressable>

      {abierta ? (
        <View style={styles.empleados}>
          {tienda.empleados.map((e) => (
            <EmpleadoVacRow key={e.id} empleado={e} onPress={() => onEmpleado(e)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function EmpleadoVacRow({ empleado, onPress }: { empleado: EmpleadoVac; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.empRow, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.empHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.empNombre}>{empleado.nombre}</Text>
          <Text style={styles.empPuesto}>{empleado.puesto}</Text>
        </View>
        <EstadoVencimiento indemnizable={empleado.indemnizable} diasPendientes={empleado.diasPendientes} />
      </View>
      <View style={styles.empFoot}>
        <SaldoInline saldo={empleado.saldo} muted />
        <Text style={styles.limite}>Límite: {empleado.limite}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  nombre: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  totalChip: { backgroundColor: '#dcfce7', borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
  totalText: { fontSize: fontSize.xs, fontWeight: '800', color: colors.success },
  empleados: { borderTopWidth: 1, borderTopColor: colors.border },
  empRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  pressed: { backgroundColor: '#f9fafb' },
  empHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  empNombre: { fontSize: fontSize.sm, fontWeight: '800', color: colors.text },
  empPuesto: { fontSize: fontSize.xs, color: colors.brandIndigo, fontWeight: '600', marginTop: 1 },
  empFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  limite: { fontSize: fontSize.xs, color: colors.danger, fontWeight: '700' },
});
