import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { cargarGestionEquipos, type GestionData } from '@/lib/gestion-equipos';
import type { AsesorItem, GestionKpis, TiendaResumen, ZonaDetalle } from '@/lib/types';
import { colors, coverageColor, fontSize, radius, spacing } from '@/theme';
import { KpiStrip, ChipsEstado } from '@/components/gestion/KpiStrip';
import { AsesorRow } from '@/components/gestion/AsesorRow';
import { BuscadorModal } from '@/components/gestion/BuscadorModal';

export default function GestionEquiposScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sesion } = useAuth();

  const [data, setData] = useState<GestionData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buscadorVisible, setBuscadorVisible] = useState(false);
  const [zonasAbiertas, setZonasAbiertas] = useState<Set<string>>(new Set());
  const [tiendasAbiertas, setTiendasAbiertas] = useState<Set<string>>(new Set());

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

  const toggleZona = (zona: string) =>
    setZonasAbiertas((prev) => {
      const next = new Set(prev);
      next.has(zona) ? next.delete(zona) : next.add(zona);
      return next;
    });
  const toggleTienda = (id: string) =>
    setTiendasAbiertas((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // TODO: definir acciones por asesor con la usuaria.
  const onAccionAsesor = (accion: 'estado' | 'detalle' | 'ficha', a: AsesorItem) => {
    const etiqueta = accion === 'estado' ? 'Estado/marcación' : accion === 'detalle' ? 'Detalle' : 'Ficha/rol';
    router.push({
      pathname: '/proximamente',
      params: { titulo: `${etiqueta} · ${a.nombreCompleto}` },
    });
  };

  const irATienda = (t: TiendaResumen) =>
    router.push({ pathname: '/tienda/[id]', params: { id: t.id } });

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
          <Text style={styles.headerTitle}>GESTIÓN DE EQUIPOS</Text>
          <Pressable
            hitSlop={8}
            onPress={() => setBuscadorVisible(true)}
            accessibilityLabel="Buscar"
            disabled={!data}
          >
            <Ionicons name="search" size={24} color={colors.white} />
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
        <>
          <FlatList
            data={data.zonas}
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
                      Datos de ejemplo (resumen aún no disponible en el backend).
                    </Text>
                  </View>
                ) : null}
              </View>
            }
            renderItem={({ item }) => (
              <ZonaBlock
                zona={item}
                abierta={zonasAbiertas.has(item.zona)}
                tiendasAbiertas={tiendasAbiertas}
                onToggleZona={() => toggleZona(item.zona)}
                onToggleTienda={toggleTienda}
                onAccionAsesor={onAccionAsesor}
                onIrTienda={irATienda}
              />
            )}
            ListFooterComponent={
              <TotalGeneral kpis={data.kpis} tiendas={totalTiendas(data.zonas)} />
            }
          />

          <BuscadorModal
            visible={buscadorVisible}
            zonas={data.zonas}
            onClose={() => setBuscadorVisible(false)}
            onSelTienda={irATienda}
            onSelEmpleado={(a) => onAccionAsesor('detalle', a)}
          />
        </>
      ) : null}
    </View>
  );
}

function totalTiendas(zonas: ZonaDetalle[]): number {
  return zonas.reduce((s, z) => s + z.tiendas.length, 0);
}

function ZonaBlock({
  zona,
  abierta,
  tiendasAbiertas,
  onToggleZona,
  onToggleTienda,
  onAccionAsesor,
  onIrTienda,
}: {
  zona: ZonaDetalle;
  abierta: boolean;
  tiendasAbiertas: Set<string>;
  onToggleZona: () => void;
  onToggleTienda: (id: string) => void;
  onAccionAsesor: (a: 'estado' | 'detalle' | 'ficha', x: AsesorItem) => void;
  onIrTienda: (t: TiendaResumen) => void;
}) {
  const cobColor = coverageColor(zona.kpis.coberturaPct);
  return (
    <View style={styles.zonaCard}>
      <Pressable style={styles.zonaRow} onPress={onToggleZona}>
        <Ionicons
          name={abierta ? 'chevron-down' : 'chevron-forward'}
          size={20}
          color={colors.brandIndigo}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.zonaNombre}>{zona.zona}</Text>
          <Text style={styles.zonaSub}>
            {zona.kpis.plantilla} plantilla · {zona.kpis.activos} activos · {zona.tiendas.length} tiendas
          </Text>
          <ChipsEstado kpis={zona.kpis} />
        </View>
        <View style={[styles.cobBadge, { backgroundColor: cobColor }]}>
          <Text style={styles.cobValue}>{zona.kpis.coberturaPct}%</Text>
          <Text style={styles.cobLabel}>cobert.</Text>
        </View>
      </Pressable>

      {abierta
        ? zona.tiendas.map((t) => (
            <TiendaBlock
              key={t.id}
              tienda={t}
              abierta={tiendasAbiertas.has(t.id)}
              onToggle={() => onToggleTienda(t.id)}
              onAccionAsesor={onAccionAsesor}
              onIr={() => onIrTienda(t)}
            />
          ))
        : null}
    </View>
  );
}

function TiendaBlock({
  tienda,
  abierta,
  onToggle,
  onAccionAsesor,
  onIr,
}: {
  tienda: TiendaResumen;
  abierta: boolean;
  onToggle: () => void;
  onAccionAsesor: (a: 'estado' | 'detalle' | 'ficha', x: AsesorItem) => void;
  onIr: () => void;
}) {
  const cobColor = coverageColor(tienda.kpis.coberturaPct);
  return (
    <View style={styles.tiendaWrap}>
      <Pressable style={styles.tiendaRow} onPress={onToggle}>
        <Ionicons name="location-outline" size={18} color={colors.brandBlue} />
        <View style={{ flex: 1 }}>
          <View style={styles.tiendaNombreRow}>
            <Text style={styles.tiendaNombre} numberOfLines={1}>
              {tienda.nombre}
            </Text>
            <Pressable hitSlop={6} onPress={onIr} accessibilityLabel="Abrir detalle de tienda">
              <Ionicons name="open-outline" size={16} color={colors.textMuted} />
            </Pressable>
          </View>
          <Text style={styles.tiendaSub}>
            {tienda.kpis.plantilla} plantilla · {tienda.kpis.activos} activos
          </Text>
          <ChipsEstado kpis={tienda.kpis} />
        </View>
        <View style={[styles.cobBadgeSm, { backgroundColor: cobColor }]}>
          <Text style={styles.cobValueSm}>{tienda.kpis.coberturaPct}%</Text>
        </View>
        <Ionicons
          name={abierta ? 'chevron-down' : 'chevron-forward'}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>

      {abierta ? (
        <View style={styles.asesoresWrap}>
          {tienda.asesores.map((a) => (
            <AsesorRow key={a.id} asesor={a} onAccion={onAccionAsesor} />
          ))}
        </View>
      ) : null}
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
          {kpis.plantilla} plantilla · {kpis.activos} asesores activos · {tiendas} tiendas
        </Text>
        <Text style={styles.totalSub}>
          DM: {kpis.descansoMedico} · VAC: {kpis.vacaciones} · LIC: {kpis.licencias}
        </Text>
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
  },
  headerTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: '800', letterSpacing: 0.5 },
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
  zonaCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  zonaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  zonaNombre: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  zonaSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, marginBottom: spacing.sm },
  cobBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cobValue: { color: colors.white, fontSize: fontSize.lg, fontWeight: '800' },
  cobLabel: { color: colors.white, fontSize: 9, fontWeight: '600' },
  tiendaWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#fafafe',
  },
  tiendaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  tiendaNombreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tiendaNombre: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, flexShrink: 1 },
  tiendaSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1, marginBottom: spacing.sm },
  cobBadgeSm: {
    minWidth: 44,
    paddingHorizontal: spacing.sm,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cobValueSm: { color: colors.white, fontSize: fontSize.xs, fontWeight: '800' },
  asesoresWrap: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
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
  totalSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
});
