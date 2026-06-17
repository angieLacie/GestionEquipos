import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { usePreviewPerfil } from '@/context/PreviewPerfilContext';
import { usePerfilActivo } from '@/lib/usePerfil';
import { etiquetaPerfil, type Perfil } from '@/lib/perfil';
import { colors, fontSize, radius, spacing } from '@/theme';
import { iniciales } from '@/lib/format';

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { sesion, signOut } = useAuth();
  const { perfilReal, perfilEfectivo, enPreview } = usePerfilActivo();
  const { previewPerfil, setPreviewPerfil } = usePreviewPerfil();

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
        <View style={styles.perfilChip}>
          <Ionicons
            name={perfilEfectivo === 'gestion' ? 'briefcase' : 'storefront'}
            size={14}
            color={colors.white}
          />
          <Text style={styles.perfilChipText}>
            Perfil: {etiquetaPerfil(perfilEfectivo)}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Datos de perfil */}
        <View style={styles.card}>
          <Row label="Rol(es)" value={roles.length ? roles.join(', ') : '—'} />
          <Divider />
          <Row label="Perfil resuelto" value={etiquetaPerfil(perfilReal)} />
        </View>

        {/* Selector "Ver como" — HERRAMIENTA DE DESARROLLO (solo __DEV__).
            En producción este bloque no se renderiza y el perfil real manda. */}
        {__DEV__ ? (
          <View style={styles.devCard}>
            <View style={styles.devHead}>
              <Ionicons name="construct" size={16} color={colors.textMuted} />
              <Text style={styles.devTitle}>Ver como (solo desarrollo)</Text>
            </View>
            <Text style={styles.devHint}>
              Previsualiza la app con cada perfil. No afecta producción.
            </Text>
            <View style={styles.segment}>
              <SegBtn
                label="Real"
                active={previewPerfil === null}
                onPress={() => setPreviewPerfil(null)}
              />
              <SegBtn
                label="Gestión"
                active={previewPerfil === 'gestion'}
                onPress={() => setPreviewPerfil('gestion' as Perfil)}
              />
              <SegBtn
                label="Campo"
                active={previewPerfil === 'campo'}
                onPress={() => setPreviewPerfil('campo' as Perfil)}
              />
            </View>
            {enPreview ? (
              <Text style={styles.devWarn}>
                Mostrando {etiquetaPerfil(perfilEfectivo)} (override activo).
              </Text>
            ) : null}
          </View>
        ) : null}

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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function SegBtn({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.segBtn, active && styles.segBtnActive]}
    >
      <Text style={[styles.segBtnText, active && styles.segBtnTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
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
  perfilChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginTop: spacing.md,
  },
  perfilChipText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '700' },
  body: { padding: spacing.lg, gap: spacing.lg },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowLabel: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600' },
  rowValue: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
    textAlign: 'right',
  },
  divider: { height: 1, backgroundColor: colors.border },
  devCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  devHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  devTitle: { color: colors.text, fontSize: fontSize.sm, fontWeight: '800' },
  devHint: { color: colors.textMuted, fontSize: fontSize.xs },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
    marginTop: spacing.xs,
  },
  segBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  segBtnActive: { backgroundColor: colors.brandIndigo },
  segBtnText: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '700' },
  segBtnTextActive: { color: colors.white },
  devWarn: { color: colors.brandIndigo, fontSize: fontSize.xs, fontWeight: '700' },
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
