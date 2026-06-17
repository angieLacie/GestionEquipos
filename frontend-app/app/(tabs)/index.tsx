import { useMemo } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { colors, fontSize, radius, spacing } from '@/theme';
import { iniciales, mesActual } from '@/lib/format';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface Tile {
  key: string;
  label: string;
  icon: IoniconName;
  color: string;
  ruta?: string;
}

const TILES: Tile[] = [
  { key: 'equipos', label: 'Gestión Equipos', icon: 'people', color: colors.tile.equipos, ruta: '/gestion-equipos' },
  { key: 'vacaciones', label: 'Vacaciones', icon: 'sunny', color: colors.tile.vacaciones },
  { key: 'ampliaciones', label: 'Ampliaciones', icon: 'time', color: colors.tile.ampliaciones },
  { key: 'aprobaciones', label: 'Aprobaciones', icon: 'checkmark-done', color: colors.tile.aprobaciones },
  { key: 'licencias', label: 'Licencias', icon: 'document-text', color: colors.tile.licencias },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sesion } = useAuth();

  const nombre = sesion?.nombreUsuario ?? 'Usuario';
  const ini = useMemo(() => iniciales(nombre), [nombre]);
  const mes = useMemo(() => mesActual(), []);

  function onTile(t: Tile) {
    if (t.ruta) {
      router.push(t.ruta as never);
    } else {
      Alert.alert(t.label, 'Próximamente');
    }
  }

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Barra superior con gradiente */}
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + spacing.lg }]}
        >
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{ini}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.saludo}>Bienvenido de vuelta</Text>
              <Text style={styles.nombre} numberOfLines={1}>
                {nombre}
              </Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => Alert.alert('Notificaciones', 'Próximamente')}
              accessibilityLabel="Notificaciones"
            >
              <View>
                <Ionicons name="notifications-outline" size={26} color={colors.white} />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </View>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Acceso rápido */}
        <View style={styles.body}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Acceso rápido</Text>
            <Text style={styles.sectionMes}>{mes}</Text>
          </View>

          <View style={styles.grid}>
            {TILES.map((t) => (
              <Pressable
                key={t.key}
                style={({ pressed }) => [styles.tile, pressed && { opacity: 0.7 }]}
                onPress={() => onTile(t)}
              >
                <View style={[styles.tileIcon, { backgroundColor: t.color }]}>
                  <Ionicons name={t.icon} size={26} color={colors.white} />
                </View>
                <Text style={styles.tileLabel} numberOfLines={2}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ height: insets.bottom + spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const TILE_GAP = spacing.md;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '800', fontSize: fontSize.lg },
  saludo: { color: colors.textOnBrandMuted, fontSize: fontSize.sm },
  nombre: { color: colors.white, fontSize: fontSize.lg, fontWeight: '700' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '800' },
  body: { padding: spacing.lg },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  sectionMes: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TILE_GAP,
  },
  tile: {
    width: '31%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  tileIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});
