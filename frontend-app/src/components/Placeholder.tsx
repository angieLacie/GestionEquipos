import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSize, radius, spacing } from '@/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface PlaceholderProps {
  /** Título del módulo (ej. "Mi marcación"). */
  titulo: string;
  /** Ícono representativo del módulo. */
  icon: IoniconName;
  /** Color del badge del ícono. Por defecto azul de marca. */
  color?: string;
}

/**
 * Pantalla placeholder reutilizable: header con back + título, e ícono grande
 * con leyenda "Próximamente". Para módulos sin backend aún.
 */
export function Placeholder({ titulo, icon, color = colors.brandBlue }: PlaceholderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <View style={styles.headerRow}>
          <Pressable
            hitSlop={10}
            onPress={() => router.back()}
            accessibilityLabel="Volver"
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {titulo}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={[styles.iconWrap, { backgroundColor: color }]}>
          <Ionicons name={icon} size={48} color={colors.white} />
        </View>
        <Text style={styles.soon}>Próximamente</Text>
        <Text style={styles.modulo}>módulo {titulo}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerTitle: {
    flex: 1,
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  soon: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  modulo: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
});
