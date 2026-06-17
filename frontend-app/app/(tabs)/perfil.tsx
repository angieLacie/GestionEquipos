import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { colors, fontSize, radius, spacing } from '@/theme';
import { iniciales } from '@/lib/format';

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { sesion, signOut } = useAuth();

  const nombre = sesion?.nombreUsuario ?? 'Usuario';
  const ini = useMemo(() => iniciales(nombre), [nombre]);
  const roles = sesion?.roles ?? [];

  function onCerrarSesion() {
    Alert.alert('Cerrar sesión', '¿Deseas salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => {
          void signOut();
        },
      },
    ]);
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing.xl }]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{ini}</Text>
        </View>
        <Text style={styles.nombre}>{nombre}</Text>
        {roles.length > 0 ? (
          <Text style={styles.roles}>{roles.join(' · ')}</Text>
        ) : null}
      </LinearGradient>

      <View style={styles.body}>
        <Pressable
          style={({ pressed }) => [styles.btnSalir, pressed && { opacity: 0.85 }]}
          onPress={onCerrarSesion}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.btnSalirText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { color: colors.white, fontWeight: '800', fontSize: fontSize.xxl },
  nombre: { color: colors.white, fontSize: fontSize.xl, fontWeight: '800' },
  roles: { color: colors.textOnBrandMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
  body: { padding: spacing.lg },
  btnSalir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  btnSalirText: { color: colors.danger, fontSize: fontSize.md, fontWeight: '700' },
});
