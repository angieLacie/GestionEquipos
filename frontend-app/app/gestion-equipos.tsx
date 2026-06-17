import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { cargarGestionEquipos, type GestionData } from '@/lib/gestion-equipos';
import type { GestionKpis, ZonaResumen } from '@/lib/types';
import { colors, coverageColor, fontSize, radius, spacing } from '@/theme';

export default function GestionEquiposScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sesion } = useAuth();

  const [data, setData] = useState<GestionData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const cargar = useCallback(async () => {
    if (!sesion) return;
    setCargando(true);
    setError(null);
    try {
      const d = await cargarGestionEquipos(sesion.token);
      setData(d);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'No se pudieron cargar los datos.',
      );
    } finally {
      setCargando(false);
    }
  }, [sesion]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const zonasFiltradas = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toUpperCase();
    if (!q) return data.zonas;
    return data.zonas.filter((z) => z.zona.includes(q));
  }, [data, query]);

  return (
    <View style={styles.root}>
      {/* Header */}
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
          <Text style={styles.headerTitle}>GESTIÓN DE EQUIPOS</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.search}
            placeholder="Buscar zona…"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="characters"
          />
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
          data={zonasFiltradas}
          keyExtractor={(z) => z.zona}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
          ListHeaderComponent={
            <View>
              <KpiStrip kpis={data.kpis} />
              {data.esMock ? (
                <View style={styles.mockBanner}>
                  <Ionicons name="information-circle" size={16} color={colors.info} />
                  <Text style={styles.mockText}>
                    Datos de ejemplo (resumen por zona aún no disponible en el backend).
                  </Text>
                </View>
              ) : null}
            </View>
          }
          renderItem={({ item }) => <ZonaRow zona={item} />}
          ListFooterComponent={<TotalGeneral kpis={data.kpis} tiendas={totalTiendas(data.zonas)} />}
        />
      ) : null}
    </View>
  );
}

function totalTiendas(zonas: ZonaResumen[]): number {
  return zonas.reduce((s, z) => s + z.tiendas, 0);
}

function KpiStrip({ kpis }: { kpis: GestionKpis }) {
  const items: { label: string; value: string }[] = [
    { label: 'PLANT.', value: String(kpis.plantilla) },
    { label: 'ACTIVOS', value: String(kpis.activos) },
    { label: 'COBERT.%', value: `${kpis.coberturaPct}` },
    { label: 'DESC.M', value: String(kpis.descansoMedico) },
    { label: 'VACAC.', value: String(kpis.vacaciones) },
    { label: 'LICEN.', value: String(kpis.licencias) },
  ];
  return (
    <View style={styles.kpiStrip}>
      {items.map((it) => (
        <View key={it.label} style={styles.kpi}>
          <Text style={styles.kpiValue}>{it.value}</Text>
          <Text style={styles.kpiLabel}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

function Chip({ icon, label, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: `${color}1a` }]}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

function ZonaRow({ zona }: { zona: ZonaResumen }) {
  const cobColor = coverageColor(zona.coberturaPct);
  return (
    <View style={styles.zonaRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.zonaNombre}>{zona.zona}</Text>
        <Text style={styles.zonaSub}>
          {zona.plantilla} plantilla · {zona.activos} activos · {zona.tiendas} tiendas
        </Text>
        <View style={styles.chipsRow}>
          <Chip icon="medkit-outline" label={`DM ${zona.descansoMedico}`} color={colors.danger} />
          <Chip icon="sunny-outline" label={`VAC ${zona.vacaciones}`} color={colors.warning} />
          <Chip icon="document-text-outline" label={`LIC ${zona.licencias}`} color={colors.tile.licencias} />
        </View>
      </View>
      <View style={[styles.cobBadge, { backgroundColor: cobColor }]}>
        <Text style={styles.cobValue}>{zona.coberturaPct}%</Text>
        <Text style={styles.cobLabel}>cobert.</Text>
      </View>
    </View>
  );
}

function TotalGeneral({ kpis, tiendas }: { kpis: GestionKpis; tiendas: number }) {
  const cobColor = coverageColor(kpis.coberturaPct);
  return (
    <View style={styles.totalRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.totalNombre}>TOTAL GENERAL</Text>
        <Text style={styles.totalSub}>
          {kpis.plantilla} plantilla · {kpis.activos} activos · {tiendas} tiendas
        </Text>
        <View style={styles.chipsRow}>
          <Chip icon="medkit-outline" label={`DM ${kpis.descansoMedico}`} color={colors.danger} />
          <Chip icon="sunny-outline" label={`VAC ${kpis.vacaciones}`} color={colors.warning} />
          <Chip icon="document-text-outline" label={`LIC ${kpis.licencias}`} color={colors.tile.licencias} />
        </View>
      </View>
      <View style={[styles.cobBadge, { backgroundColor: cobColor }]}>
        <Text style={styles.cobValue}>{kpis.coberturaPct}%</Text>
        <Text style={styles.cobLabel}>cobert.</Text>
      </View>
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: '800', letterSpacing: 0.5 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  search: { flex: 1, paddingVertical: 9, fontSize: fontSize.md, color: colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  errorText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center' },
  retry: {
    backgroundColor: colors.brandIndigo,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryText: { color: colors.white, fontWeight: '700' },
  kpiStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.card,
    margin: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  kpi: { width: '33.33%', alignItems: 'center', paddingVertical: spacing.sm },
  kpiValue: { fontSize: fontSize.xl, fontWeight: '800', color: colors.brandIndigo },
  kpiLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '700', letterSpacing: 0.5 },
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
  zonaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  zonaNombre: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  zonaSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, marginBottom: spacing.sm },
  chipsRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  chipText: { fontSize: fontSize.xs, fontWeight: '700' },
  cobBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cobValue: { color: colors.white, fontSize: fontSize.lg, fontWeight: '800' },
  cobLabel: { color: colors.white, fontSize: 9, fontWeight: '600' },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#eef2ff',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.brandIndigo,
  },
  totalNombre: { fontSize: fontSize.md, fontWeight: '800', color: colors.brandIndigo, letterSpacing: 0.5 },
  totalSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, marginBottom: spacing.sm },
});
