import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@/theme';
import { BottomSheet } from '@/components/BottomSheet';

interface Props {
  visible: boolean;
  /** Nombre/título de lo que se rechaza (cabecera de la hoja). */
  titulo: string;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (comentario: string) => void;
}

/** Hoja para rechazar con comentario obligatorio (CU-14: acción por estado). */
export function RechazoSheet({ visible, titulo, submitting, onClose, onConfirm }: Props) {
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    if (visible) setComentario('');
  }, [visible]);

  const valido = comentario.trim().length >= 3;

  return (
    <BottomSheet
      visible={visible}
      title={`Rechazar — ${titulo}`}
      confirmLabel="Confirmar rechazo"
      confirmDisabled={!valido}
      submitting={submitting}
      onClose={onClose}
      onConfirm={() => onConfirm(comentario.trim())}
    >
      <View>
        <Text style={styles.label}>MOTIVO DEL RECHAZO</Text>
        <TextInput
          style={styles.input}
          value={comentario}
          onChangeText={setComentario}
          placeholder="Explica brevemente el motivo…"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={styles.hint}>El motivo queda registrado en el historial del documento.</Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: fontSize.xs, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 96,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.card,
  },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.sm },
});
