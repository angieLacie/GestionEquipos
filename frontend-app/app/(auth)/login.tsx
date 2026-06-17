import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { colors, fontSize, radius, spacing } from '@/theme';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, usuarioRecordado } = useAuth();

  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [recordar, setRecordar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prellenar usuario recordado.
  useEffect(() => {
    if (usuarioRecordado) {
      setUsuario(usuarioRecordado);
      setRecordar(true);
    }
  }, [usuarioRecordado]);

  const puedeEnviar = usuario.trim().length > 0 && password.length > 0 && !cargando;

  async function onSubmit() {
    if (!puedeEnviar) return;
    setError(null);
    setCargando(true);
    try {
      await signIn(usuario, password, recordar);
      // El guard en _layout redirige a (tabs) al detectar la sesión.
    } catch (e) {
      if (e instanceof ApiError) {
        setError(
          e.kind === 'unauthorized'
            ? 'Usuario o contraseña incorrectos.'
            : e.message,
        );
      } else {
        setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Cabecera con gradiente de marca */}
          <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.header, { paddingTop: insets.top + spacing.xxl }]}
          >
            <View style={styles.burbuja}>
              <Ionicons name="people" size={42} color={colors.white} />
            </View>
            <Text style={styles.titulo}>Gestión de Equipos</Text>
            <Text style={styles.subtitulo}>Sistema de Gestión de Equipos</Text>
          </LinearGradient>

          {/* Card del formulario */}
          <View style={styles.card}>
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>USUARIO</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="usuario@empresa.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={usuario}
                onChangeText={setUsuario}
                editable={!cargando}
                returnKeyType="next"
              />
            </View>

            <Text style={[styles.label, { marginTop: spacing.lg }]}>CONTRASEÑA</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!verPassword}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                editable={!cargando}
                returnKeyType="go"
                onSubmitEditing={onSubmit}
              />
              <Pressable
                hitSlop={8}
                onPress={() => setVerPassword((v) => !v)}
                accessibilityLabel={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <Ionicons
                  name={verPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </Pressable>
            </View>

            <View style={styles.recordarRow}>
              <Text style={styles.recordarLabel}>Recordar contraseña</Text>
              <Switch
                value={recordar}
                onValueChange={setRecordar}
                trackColor={{ false: colors.border, true: colors.brandIndigo }}
                thumbColor={colors.white}
              />
            </View>

            <Pressable
              onPress={onSubmit}
              disabled={!puedeEnviar}
              style={({ pressed }) => [{ opacity: pressed || !puedeEnviar ? 0.85 : 1 }]}
            >
              <LinearGradient
                colors={colors.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.boton, !puedeEnviar && { opacity: 0.6 }]}
              >
                {cargando ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.botonText}>Iniciar sesión</Text>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable
              style={styles.olvidaste}
              onPress={() =>
                Alert.alert(
                  'Recuperar contraseña',
                  'Contacta al administrador del sistema para restablecer tu contraseña.',
                )
              }
            >
              <Text style={styles.olvidasteText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
          </View>

          <View style={{ height: insets.bottom + spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  header: {
    alignItems: 'center',
    paddingBottom: spacing.xxl + spacing.xl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  burbuja: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  titulo: {
    color: colors.textOnBrand,
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  subtitulo: {
    color: colors.textOnBrandMuted,
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    borderRadius: radius.lg,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: fontSize.md,
    color: colors.text,
  },
  recordarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  recordarLabel: { fontSize: fontSize.md, color: colors.text },
  boton: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  olvidaste: { alignItems: 'center', marginTop: spacing.lg },
  olvidasteText: { color: colors.brandBlue, fontSize: fontSize.sm, fontWeight: '600' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: { flex: 1, color: colors.danger, fontSize: fontSize.sm },
});
