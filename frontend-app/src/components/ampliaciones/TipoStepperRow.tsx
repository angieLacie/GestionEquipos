import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '@/theme';
import { Select } from '@/components/gestion/AccionFields';
import { TIPOS_PUESTO, type LineaAmpliacion } from '@/lib/ampliaciones';

const OPCIONES = TIPOS_PUESTO.map((t) => ({ value: t, label: t }));

interface Props {
  linea: LineaAmpliacion;
  onChangeTipo: (tipo: string) => void;
  onChangeCantidad: (cantidad: number) => void;
  onEliminar: () => void;
}

/** Fila editable: Select de tipo + stepper de cantidad + botón eliminar. */
export function TipoStepperRow({ linea, onChangeTipo, onChangeCantidad, onEliminar }: Props) {
  const dec = () => onChangeCantidad(Math.max(1, linea.cantidad - 1));
  const inc = () => onChangeCantidad(linea.cantidad + 1);
  return (
    <View style={styles.row}>
      <View style={styles.select}>
        <Select options={OPCIONES} value={linea.tipo} onChange={onChangeTipo} />
      </View>
      <View style={styles.stepper}>
        <Pressable style={styles.stepBtn} onPress={dec} hitSlop={4} accessibilityLabel="Disminuir">
          <Ionicons name="remove" size={18} color={colors.brandIndigo} />
        </Pressable>
        <Text style={styles.cant}>{linea.cantidad}</Text>
        <Pressable style={styles.stepBtn} onPress={inc} hitSlop={4} accessibilityLabel="Aumentar">
          <Ionicons name="add" size={18} color={colors.brandIndigo} />
        </Pressable>
      </View>
      <Pressable style={styles.trash} onPress={onEliminar} hitSlop={6} accessibilityLabel="Eliminar fila">
        <Ionicons name="trash-outline" size={20} color={colors.danger} />
      </Pressable>
    </View>
  );
}

/** Botón "+ Agregar tipo". */
export function AgregarTipo({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.agregar, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <Ionicons name="add" size={18} color={colors.brandIndigo} />
      <Text style={styles.agregarText}>Agregar tipo</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  select: { flex: 1 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  stepBtn: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef2ff' },
  cant: { width: 34, textAlign: 'center', fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  trash: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  agregar: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm },
  agregarText: { fontSize: fontSize.sm, fontWeight: '800', color: colors.brandIndigo },
});
