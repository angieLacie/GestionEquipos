import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { cargarVacaciones, type EmpleadoVac, type TiendaVac, type VacacionesData } from '@/lib/vacaciones';
import { colors, fontSize, radius, spacing } from '@/theme';
import { KpiVacStrip } from '@/components/vacaciones/primitives';
import { TiendaVacCard } from '@/components/vacaciones/TiendaVacCard';
import { VacSheets, type ModoVac } from '@/components/vacaciones/VacSheets';

export default function VacacionesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sesion } = useAuth();

  const [data, setData] = useState<VacacionesData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [abiertas, setAbiertas] = useState<Set<string>>(new Set());
  const [buscando, setBuscando] = useState(false);
  const [query, setQuery] = useState('');

  // Empleado seleccionado + modo de hoja (acciones/programar/resumen).
  const [sel, setSel] = useState<EmpleadoVac | null>(null);
  const [modo, setModo] = useState<ModoVac | null>(null);

  const cargar = useCallback(async () => {
    if (!sesion) return;
    setCargando(true);
    setError(null);
    try {
      setData(await cargarVacaciones(sesion.token));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar las vacaciones.');
    } finally {
      setCargando(false);
    }
  }, [sesion]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const toggle = (id: string) =>
    setAbiertas((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const abrirEmpleado = (e: EmpleadoVac) => {
    setSel(e);
    setModo('acciones');
  };

  // Filtro por texto: tienda visible si su nombre o algún empleado coincide.
  const tiendas = useMemo(() => filtrar(data?.tiendas ?? [], query), [data, query]);
  const forzarAbiertas = query.trim().length > 0;

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
          {buscando ? (
            <TextInput
              style={styles.search}
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar tienda o empleado…"
              placeholderTextColor="rgba(255,255,255,0.7)"
              autoFocus
            />
          ) : (
            <Text style={styles.headerTitle}>Módulo de Vacaciones</Text>
          )}
          <Pressable
            hitSlop={8}
            onPress={() => {
              setBuscando((b) => !b);
              setQuery('');
            }}
            accessibilityLabel={buscando ? 'Cerrar búsqueda' : 'Buscar'}
          >
            <Ionicons name={buscando ? 'close' : 'search'} size={24} color={colors.white} />
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
      ) : data ? (
        <FlatList
          data={tiendas}
          keyExtractor={(t) => t.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View>
              <KpiVacStrip kpis={data.kpis} />
              {data.esMock ? (
                <View style={styles.mockBanner}>
                  <Ionicons name="information-circle" size={16} color={colors.info} />
                  <Text style={styles.mockText}>Datos de ejemplo (módulo Vacaciones aún no disponible en el backend).</Text>
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.vacio}>Sin resultados para “{query}”.</Text>
          }
          renderItem={({ item }) => (
            <TiendaVacCard
              tienda={item}
              abierta={forzarAbiertas || abiertas.has(item.id)}
              onToggle={() => toggle(item.id)}
              onEmpleado={abrirEmpleado}
            />
          )}
        />
      ) : null}

      <VacSheets
        empleado={sel}
        modo={modo}
        onCambiarModo={setModo}
        onClose={() => {
          setModo(null);
          setSel(null);
        }}
      />
    </View>
  );
}

/** Filtra tiendas por nombre o por empleados que coincidan con la búsqueda. */
function filtrar(tiendas: TiendaVac[], query: string): TiendaVac[] {
  const q = query.trim().toLowerCase();
  if (!q) return tiendas;
  const out: TiendaVac[] = [];
  for (const t of tiendas) {
    if (t.nombre.toLowerCase().includes(q)) {
      out.push(t);
      continue;
    }
    const emp = t.empleados.filter((e) => e.nombre.toLowerCase().includes(q) || e.puesto.toLowerCase().includes(q));
    if (emp.length > 0) out.push({ ...t, empleados: emp });
  }
  return out;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.white, fontSize: fontSize.lg, fontWeight: '800', letterSpacing: 0.5 },
  search: {
    flex: 1,
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
  },
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
  vacio: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl, fontSize: fontSize.sm },
});
