import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import {
  cargarAmpliaciones,
  guardarAmpliacion,
  type AmpliacionesData,
  type EstadoAmp,
  type LineaAmpliacion,
} from '@/lib/ampliaciones';
import { colors, fontSize, radius, spacing } from '@/theme';
import { FiltroPills, type PillDef } from '@/components/aprobaciones/primitives';
import { CardAmpliacion } from '@/components/ampliaciones/CardAmpliacion';

type FiltroEstado = 'TODAS' | EstadoAmp;

export default function AmpliacionesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sesion } = useAuth();

  const [data, setData] = useState<AmpliacionesData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroEstado>('TODAS');
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cargar = useCallback(async () => {
    if (!sesion) return;
    setCargando(true);
    setError(null);
    try {
      setData(await cargarAmpliaciones(sesion.token));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar las ampliaciones.');
    } finally {
      setCargando(false);
    }
  }, [sesion]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const items = useMemo(
    () => (data?.ampliaciones ?? []).filter((a) => filtro === 'TODAS' || a.estado === filtro),
    [data, filtro],
  );

  async function guardar(id: string, lineas: LineaAmpliacion[]) {
    setSubmitting(true);
    try {
      await guardarAmpliacion({ id, lineas });
      setData((prev) =>
        prev ? { ...prev, ampliaciones: prev.ampliaciones.map((a) => (a.id === id ? { ...a, lineas } : a)) } : prev,
      );
      setEditId(null);
    } finally {
      setSubmitting(false);
    }
  }

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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Ampliaciones</Text>
            <Text style={styles.headerSub}>Historial de ampliaciones enviadas</Text>
          </View>
          <Ionicons name="search" size={24} color={colors.white} />
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
      ) : data ? (
        <FlatList
          data={items}
          keyExtractor={(a) => a.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
          ListHeaderComponent={
            <View>
              <FiltroPills options={pills(data)} value={filtro} onChange={setFiltro} />
              {data.esMock ? (
                <View style={styles.mockBanner}>
                  <Ionicons name="information-circle" size={16} color={colors.info} />
                  <Text style={styles.mockText}>Datos de ejemplo (módulo Ampliaciones aún no disponible en el backend).</Text>
                </View>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <CardAmpliacion
              item={item}
              editando={editId === item.id}
              submitting={submitting && editId === item.id}
              onEditar={() => setEditId(item.id)}
              onCancelar={() => setEditId(null)}
              onGuardar={(lineas) => void guardar(item.id, lineas)}
            />
          )}
        />
      ) : null}

      {/* FAB ancho inferior */}
      <View style={[styles.fabWrap, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }]}
          onPress={() => router.push('/nueva-ampliacion')}
        >
          <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fabGrad}>
            <Ionicons name="add" size={22} color={colors.white} />
            <Text style={styles.fabText}>Nueva solicitud de ampliación</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function pills(data: AmpliacionesData): PillDef<FiltroEstado>[] {
  const a = data.ampliaciones;
  return [
    { key: 'TODAS', label: 'Todas', count: a.length },
    { key: 'PENDIENTE', label: 'Pendientes', count: a.filter((x) => x.estado === 'PENDIENTE').length },
    { key: 'APROBADA', label: 'Aprobadas', count: a.filter((x) => x.estado === 'APROBADA').length },
    { key: 'RECHAZADA', label: 'Rechazadas', count: a.filter((x) => x.estado === 'RECHAZADA').length },
  ];
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: '800', letterSpacing: 0.5 },
  headerSub: { color: colors.textOnBrandMuted, fontSize: fontSize.xs, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  errorText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center' },
  retry: { backgroundColor: colors.brandIndigo, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.md },
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
  fabWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  fab: { borderRadius: radius.lg, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  fabGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  fabText: { color: colors.white, fontSize: fontSize.md, fontWeight: '800' },
});
