import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { buscarTienda, cargarGestionEquipos, type GestionData } from '@/lib/gestion-equipos';
import type { AsesorItem, TiendaResumen } from '@/lib/types';
import { colors, fontSize, radius, spacing } from '@/theme';
import { KpiStrip } from '@/components/gestion/KpiStrip';
import { AsesorRow } from '@/components/gestion/AsesorRow';

export default function TiendaDetalleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sesion } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [data, setData] = useState<GestionData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!sesion) return;
    setCargando(true);
    setError(null);
    try {
      const d = await cargarGestionEquipos(sesion.token);
      setData(d);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los datos.');
    } finally {
      setCargando(false);
    }
  }, [sesion]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const tienda: TiendaResumen | undefined = useMemo(
    () => (data && id ? buscarTienda(data.zonas, id) : undefined),
    [data, id],
  );

  // TODO: definir acciones por asesor con la usuaria.
  const onAccionAsesor = (accion: 'estado' | 'detalle' | 'ficha', a: AsesorItem) => {
    const etiqueta = accion === 'estado' ? 'Estado/marcación' : accion === 'detalle' ? 'Detalle' : 'Ficha/rol';
    router.push({ pathname: '/proximamente', params: { titulo: `${etiqueta} · ${a.nombreCompleto}` } });
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing.sm }]}
      >
        <View style={styles.headerTop}>
          <Pressable hitSlop={8} onPress={() => router.back()} accessibilityLabel="Volver">
            <Ionicons name="arrow-back" size={26} color={colors.white} />
          </Pressable>
          <View style={{ flex: 1, marginHorizontal: spacing.md }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {tienda?.nombre ?? 'Tienda'}
            </Text>
            <Text style={styles.headerSub}>Detalle de la tienda</Text>
          </View>
          <Pressable
            hitSlop={8}
            onPress={() => router.push({ pathname: '/proximamente', params: { titulo: 'Opciones de tienda' } })}
            accessibilityLabel="Más opciones"
          >
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.white} />
          </Pressable>
        </View>
      </LinearGradient>

      {cargando ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brandIndigo} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retry} onPress={() => void cargar()}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : !tienda ? (
        <View style={styles.center}>
          <Ionicons name="storefront-outline" size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>No se encontró la tienda.</Text>
        </View>
      ) : (
        <FlatList
          data={tienda.asesores}
          keyExtractor={(a) => a.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
          ListHeaderComponent={
            <View>
              <KpiStrip kpis={tienda.kpis} />
              {data?.esMock ? (
                <View style={styles.mockBanner}>
                  <Ionicons name="information-circle" size={16} color={colors.info} />
                  <Text style={styles.mockText}>Datos de ejemplo.</Text>
                </View>
              ) : null}
              <Text style={styles.seccion}>Listado de asesores</Text>
              <Text style={styles.encargado}>Encargado: {tienda.encargado}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.asesorCard}>
              <AsesorRow asesor={item} onAccion={onAccionAsesor} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: '800' },
  headerSub: { color: colors.textOnBrandMuted, fontSize: fontSize.xs, marginTop: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  errorText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center' },
  retry: {
    backgroundColor: colors.brandIndigo,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryText: { color: colors.white, fontWeight: '700' },
  mockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: '#eff6ff',
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  mockText: { flex: 1, color: colors.info, fontSize: fontSize.xs },
  seccion: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  encargado: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginHorizontal: spacing.lg,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  asesorCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: radius.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
});
