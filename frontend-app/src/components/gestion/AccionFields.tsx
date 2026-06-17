import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '@/theme';

/** Etiqueta de campo en mayúsculas, estilo formulario nativo. */
export function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export interface OpcionSelect {
  value: string;
  label: string;
}

/**
 * Select propio (sin libs): muestra el valor seleccionado y abre un modal
 * de opciones tocables. Si no hay selección muestra el placeholder.
 */
export function Select({
  options,
  value,
  placeholder = 'Seleccionar…',
  onChange,
}: {
  options: OpcionSelect[];
  value: string | null;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const seleccionada = options.find((o) => o.value === value) ?? null;

  return (
    <>
      <Pressable
        style={styles.control}
        onPress={() => setOpen(true)}
        accessibilityLabel={seleccionada?.label ?? placeholder}
      >
        <Text style={seleccionada ? styles.controlValue : styles.controlPlaceholder} numberOfLines={1}>
          {seleccionada?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.pickerOverlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.pickerCard} onPress={() => {}}>
            <Text style={styles.pickerTitle}>Seleccionar</Text>
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              style={{ maxHeight: 320 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const activo = item.value === value;
                return (
                  <Pressable
                    style={styles.pickerOption}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.pickerOptionText, activo && styles.pickerOptionActive]}>
                      {item.label}
                    </Text>
                    {activo ? (
                      <Ionicons name="checkmark" size={18} color={colors.brandIndigo} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/** Control segmentado de N opciones (pill). */
export function Segmented({
  options,
  value,
  onChange,
}: {
  options: OpcionSelect[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const activo = o.value === value;
        return (
          <Pressable
            key={o.value}
            style={[styles.segment, activo && styles.segmentActive]}
            onPress={() => onChange(o.value)}
            accessibilityLabel={o.label}
          >
            <Text style={[styles.segmentText, activo && styles.segmentTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const FECHA_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/** true si la cadena tiene formato dd/mm/aaaa válido. */
export function fechaValida(s: string): boolean {
  const m = FECHA_RE.exec(s.trim());
  if (!m) return false;
  const d = Number(m[1]);
  const mes = Number(m[2]);
  const y = Number(m[3]);
  if (mes < 1 || mes > 12 || d < 1 || d > 31 || y < 2000 || y > 2100) return false;
  const fecha = new Date(y, mes - 1, d);
  return fecha.getDate() === d && fecha.getMonth() === mes - 1;
}

/**
 * Campo de fecha por texto (dd/mm/aaaa) con máscara y validación básica.
 * Se evita `@react-native-community/datetimepicker` (no instalado) para no
 * agregar dependencias; el seam queda listo para sustituirlo a futuro.
 */
export function DateField({
  value,
  placeholder = 'dd/mm/aaaa',
  onChange,
}: {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const invalido = value.length > 0 && !fechaValida(value);

  const aplicarMascara = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let out = digits;
    if (digits.length > 4) out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    else if (digits.length > 2) out = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    onChange(out);
  };

  return (
    <View style={[styles.control, styles.dateControl, invalido && styles.controlError]}>
      <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
      <TextInput
        style={styles.dateInput}
        value={value}
        onChangeText={aplicarMascara}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        maxLength={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  controlError: { borderColor: colors.danger },
  controlValue: { flex: 1, fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  controlPlaceholder: { flex: 1, fontSize: fontSize.md, color: colors.textMuted },
  dateControl: { flex: 1 },
  dateInput: { flex: 1, fontSize: fontSize.md, color: colors.text, fontWeight: '600', paddingVertical: 0 },
  // Picker modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  pickerCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  pickerTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerOptionText: { fontSize: fontSize.md, color: colors.text },
  pickerOptionActive: { color: colors.brandIndigo, fontWeight: '800' },
  // Segmented
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textMuted },
  segmentTextActive: { color: colors.brandIndigo },
});
