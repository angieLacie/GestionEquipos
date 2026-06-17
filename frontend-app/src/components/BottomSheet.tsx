import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSize, radius, spacing } from '@/theme';

interface BottomSheetProps {
  visible: boolean;
  title: string;
  /** Texto del botón de confirmar (gradiente índigo→azul). */
  confirmLabel: string;
  /** Deshabilita el botón de confirmar (validación o envío en curso). */
  confirmDisabled?: boolean;
  /** true mientras se ejecuta el submit (muestra "Procesando…"). */
  submitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children: ReactNode;
}

/**
 * Hoja inferior reutilizable: panel blanco anclado abajo con esquinas
 * superiores redondeadas, overlay oscurecido que cierra al tocar fuera,
 * botón X arriba a la derecha, contenido scrollable y un botón ancho de
 * confirmar con gradiente índigo→azul. Usa el Modal nativo de RN (sin libs).
 */
export function BottomSheet({
  visible,
  title,
  confirmLabel,
  confirmDisabled,
  submitting,
  onClose,
  onConfirm,
  children,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Overlay: cierra al tocar fuera del panel. */}
      <Pressable style={styles.overlay} onPress={onClose} accessibilityLabel="Cerrar">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          {/* El panel intercepta el toque para no cerrarse al tocar dentro. */}
          <Pressable
            style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
            onPress={() => {}}
          >
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              <Pressable
                hitSlop={10}
                onPress={onClose}
                accessibilityLabel="Cerrar"
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>

            <Pressable
              onPress={onConfirm}
              disabled={confirmDisabled || submitting}
              accessibilityLabel={confirmLabel}
              style={({ pressed }) => [
                styles.confirmWrap,
                (confirmDisabled || submitting) && styles.confirmDisabled,
                pressed && styles.confirmPressed,
              ]}
            >
              <LinearGradient
                colors={colors.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmGradient}
              >
                <Text style={styles.confirmText}>
                  {submitting ? 'Procesando…' : confirmLabel}
                </Text>
              </LinearGradient>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,.45)',
    justifyContent: 'flex-end',
  },
  kav: { width: '100%' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { marginTop: spacing.lg },
  bodyContent: { paddingBottom: spacing.md, gap: spacing.lg },
  confirmWrap: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  confirmDisabled: { opacity: 0.5 },
  confirmPressed: { opacity: 0.85 },
  confirmGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
