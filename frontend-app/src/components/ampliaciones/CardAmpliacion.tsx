import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '@/theme';
import { abreviaturaTipo, nuevoUid, type Ampliacion, type LineaAmpliacion } from '@/lib/ampliaciones';
import { DotChip, ChipTexto } from '@/components/aprobaciones/primitives';
import { TipoStepperRow, AgregarTipo } from './TipoStepperRow';

interface Props {
  item: Ampliacion;
  editando: boolean;
  submitting?: boolean;
  onEditar: () => void;
  onCancelar: () => void;
  onGuardar: (lineas: LineaAmpliacion[]) => void;
}

/** Tarjeta de ampliación: modo vista (chips + estado) o edición inline. */
export function CardAmpliacion({ item, editando, submitting, onEditar, onCancelar, onGuardar }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.tienda} numberOfLines={1}>{item.tienda}</Text>
        <ChipEstado estado={item.estado} />
      </View>

      {editando ? (
        <EdicionLineas item={item} submitting={submitting} onCancelar={onCancelar} onGuardar={onGuardar} />
      ) : (
        <VistaLineas item={item} onEditar={onEditar} />
      )}
    </View>
  );
}

function ChipEstado({ estado }: { estado: Ampliacion['estado'] }) {
  if (estado === 'PENDIENTE') return <ChipTexto texto="Pendiente" color={colors.warning} bg="#fef3c7" />;
  if (estado === 'APROBADA') return <ChipTexto texto="Aprobada" color={colors.success} bg="#dcfce7" />;
  return <ChipTexto texto="Rechazada" color={colors.danger} bg="#fee2e2" />;
}

function VistaLineas({ item, onEditar }: { item: Ampliacion; onEditar: () => void }) {
  return (
    <>
      <View style={styles.chipsRow}>
        {item.lineas.map((l) => (
          <DotChip key={l.uid} texto={`${l.cantidad} ${abreviaturaTipo(l.tipo)}`} />
        ))}
      </View>
      <View style={styles.fechaRow}>
        <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
        <Text style={styles.fecha}>Fecha: {item.fecha}</Text>
      </View>
      <View style={styles.footer}>
        {item.estado === 'PENDIENTE' ? (
          <>
            <Text style={styles.faltaAprobar}>FALTA APROBAR</Text>
            <Pressable style={({ pressed }) => [styles.editarBtn, pressed && { opacity: 0.7 }]} onPress={onEditar}>
              <Text style={styles.editarText}>Editar</Text>
            </Pressable>
          </>
        ) : item.estado === 'APROBADA' ? (
          <>
            <Text style={[styles.estadoFoot, { color: colors.success }]}>APROBADA</Text>
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
          </>
        ) : (
          <Text style={[styles.estadoFoot, { color: colors.danger }]}>RECHAZADA</Text>
        )}
      </View>
    </>
  );
}

function EdicionLineas({
  item,
  submitting,
  onCancelar,
  onGuardar,
}: {
  item: Ampliacion;
  submitting?: boolean;
  onCancelar: () => void;
  onGuardar: (lineas: LineaAmpliacion[]) => void;
}) {
  const [lineas, setLineas] = useState<LineaAmpliacion[]>(item.lineas);

  useEffect(() => {
    setLineas(item.lineas.map((l) => ({ ...l })));
  }, [item.id]);

  const setLinea = (uid: string, patch: Partial<LineaAmpliacion>) =>
    setLineas((prev) => prev.map((l) => (l.uid === uid ? { ...l, ...patch } : l)));
  const eliminar = (uid: string) => setLineas((prev) => prev.filter((l) => l.uid !== uid));
  const agregar = () => setLineas((prev) => [...prev, { uid: nuevoUid(), tipo: 'ASESOR', cantidad: 1 }]);

  return (
    <View style={styles.editWrap}>
      {lineas.map((l) => (
        <TipoStepperRow
          key={l.uid}
          linea={l}
          onChangeTipo={(tipo) => setLinea(l.uid, { tipo })}
          onChangeCantidad={(cantidad) => setLinea(l.uid, { cantidad })}
          onEliminar={() => eliminar(l.uid)}
        />
      ))}
      <AgregarTipo onPress={agregar} />
      <View style={styles.fechaRow}>
        <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
        <Text style={styles.fecha}>Fecha: {item.fecha}</Text>
      </View>
      <View style={styles.editBtns}>
        <Pressable
          style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
          onPress={onCancelar}
          disabled={submitting}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.guardarWrap, pressed && { opacity: 0.85 }, (submitting || lineas.length === 0) && { opacity: 0.5 }]}
          onPress={() => onGuardar(lineas)}
          disabled={submitting || lineas.length === 0}
        >
          <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.guardarBtn}>
            <Text style={styles.guardarText}>{submitting ? 'Guardando…' : 'Guardar cambios'}</Text>
          </LinearGradient>
        </Pressable>
      </View>
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
  tienda: { flex: 1, fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  fechaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  fecha: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  faltaAprobar: { fontSize: fontSize.sm, fontWeight: '800', color: '#ea580c', letterSpacing: 0.3 },
  estadoFoot: { fontSize: fontSize.sm, fontWeight: '800', letterSpacing: 0.3 },
  editarBtn: { borderWidth: 1.5, borderColor: colors.brandIndigo, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  editarText: { fontSize: fontSize.sm, fontWeight: '800', color: colors.brandIndigo },
  editWrap: { gap: spacing.sm },
  editBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: fontSize.sm, fontWeight: '800', color: colors.textMuted },
  guardarWrap: { flex: 1.6, borderRadius: radius.md, overflow: 'hidden' },
  guardarBtn: { paddingVertical: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  guardarText: { fontSize: fontSize.sm, fontWeight: '800', color: colors.white, letterSpacing: 0.3 },
});
