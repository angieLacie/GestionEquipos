import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { SolicitudAscenso } from '@/lib/aprobaciones';
import { AccionesAprobacion, ChipGoce, ChipTexto } from './primitives';

interface Props {
  item: SolicitudAscenso;
  onVerCumplimiento: () => void;
  onAprobar: () => void;
  onRechazar: () => void;
}

/** Tarjeta de Ascensos (Senior): candidato, promotor y acceso a cumplimiento. */
export function CardAscenso({ item, onVerCumplimiento, onAprobar, onRechazar }: Props) {
  const pendiente = item.estado === 'PENDIENTE';
  const bloqueado = item.iniciadaPorUsuario === true;
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

      <Text style={styles.promotor}>
        Promotor / solicitante: <Text style={styles.promotorFuerte}>{item.promotor}</Text>
        {bloqueado ? ' · iniciada por el usuario actual' : ''}
      </Text>

      <Pressable
        style={({ pressed }) => [styles.verBtn, pressed && styles.pressed]}
        onPress={onVerCumplimiento}
      >
        <Ionicons name="stats-chart-outline" size={16} color={colors.text} />
        <Text style={styles.verText}>Ver cumplimiento (últimos 6 meses)</Text>
      </Pressable>

      {bloqueado ? (
        <View style={styles.aviso}>
          <Ionicons name="warning-outline" size={16} color={colors.warning} />
          <Text style={styles.avisoText}>
            Por segregación de funciones, esta solicitud debe ser resuelta por otro aprobador.
          </Text>
        </View>
      ) : null}

      {pendiente ? (
        <AccionesAprobacion
          variante="gradiente"
          onAprobar={onAprobar}
          onRechazar={onRechazar}
          disabled={bloqueado}
        />
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
  promotor: { fontSize: fontSize.sm, color: colors.textMuted },
  promotorFuerte: { color: colors.brandIndigo, fontWeight: '700' },
  verBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#f9fafb',
  },
  pressed: { opacity: 0.85 },
  verText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#fffbeb',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  avisoText: { flex: 1, fontSize: fontSize.xs, color: '#92400e', fontWeight: '600' },
});
