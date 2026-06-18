import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import {
  cargarAprobaciones,
  contadoresTabs,
  resolverAprobacion,
  type AprobacionesData,
  type EstadoAprob,
  type SolicitudAscenso,
  type TabAprob,
} from '@/lib/aprobaciones';
import { colors, fontSize, radius, spacing } from '@/theme';
import { TabBar } from '@/components/aprobaciones/TabBar';
import { FiltroPills, type PillDef } from '@/components/aprobaciones/primitives';
import { CardSolicitud } from '@/components/aprobaciones/CardSolicitud';
import { CardRol } from '@/components/aprobaciones/CardRol';
import { CardLicencia } from '@/components/aprobaciones/CardLicencia';
import { CardAscenso } from '@/components/aprobaciones/CardAscenso';
import { CumplimientoSheet } from '@/components/aprobaciones/CumplimientoSheet';
import { RechazoSheet } from '@/components/aprobaciones/RechazoSheet';

type FiltroEstado = 'TODAS' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

interface RechazoTarget {
  tab: TabAprob;
  id: string;
  titulo: string;
}

export default function AprobacionesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sesion } = useAuth();

  const [data, setData] = useState<AprobacionesData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<TabAprob>('solicitudes');
  const [filtroSol, setFiltroSol] = useState<FiltroEstado>('TODAS');
  const [filtroAsc, setFiltroAsc] = useState<FiltroEstado>('TODAS');

  const [cumplimiento, setCumplimiento] = useState<SolicitudAscenso | null>(null);
  const [rechazo, setRechazo] = useState<RechazoTarget | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cargar = useCallback(async () => {
    if (!sesion) return;
    setCargando(true);
    setError(null);
    try {
      setData(await cargarAprobaciones(sesion.token));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar las aprobaciones.');
    } finally {
      setCargando(false);
    }
  }, [sesion]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const contadores = useMemo(
    () => (data ? contadoresTabs(data) : { solicitudes: 0, roles: 0, licencias: 0, ascensos: 0 }),
    [data],
  );

  // Aplica una decisión a un item y actualiza el estado local (optimista).
  function aplicarDecision(t: TabAprob, id: string, estado: EstadoAprob) {
    setData((prev) => {
      if (!prev) return prev;
      if (t === 'solicitudes') {
        return { ...prev, solicitudes: prev.solicitudes.map((s) => (s.id === id ? { ...s, estado } : s)) };
      }
      if (t === 'licencias') {
        return { ...prev, licencias: prev.licencias.map((l) => (l.id === id ? { ...l, estado } : l)) };
      }
      if (t === 'ascensos') {
        return { ...prev, ascensos: prev.ascensos.map((a) => (a.id === id ? { ...a, estado } : a)) };
      }
      return prev;
    });
  }

  async function aprobar(t: TabAprob, id: string) {
    aplicarDecision(t, id, 'APROBADA');
    void resolverAprobacion({ tab: t, id, decision: 'APROBAR' });
  }

  async function confirmarRechazo(comentario: string) {
    if (!rechazo) return;
    setSubmitting(true);
    try {
      await resolverAprobacion({ tab: rechazo.tab, id: rechazo.id, decision: 'RECHAZAR', comentario });
      aplicarDecision(rechazo.tab, rechazo.id, 'RECHAZADA');
      setRechazo(null);
    } finally {
      setSubmitting(false);
    }
  }

  const irDetalleRol = () =>
    router.push({ pathname: '/proximamente', params: { titulo: 'Detalle de solicitud de rol' } });

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
          <Text style={styles.headerTitle}>Aprobaciones</Text>
          <Pressable hitSlop={8} onPress={() => void cargar()} accessibilityLabel="Filtrar">
            <Ionicons name="funnel-outline" size={22} color={colors.white} />
          </Pressable>
        </View>
      </LinearGradient>

      {data ? (
        <TabBar activa={tab} contadores={contadores} onChange={setTab} />
      ) : null}

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
          {tab === 'solicitudes' ? (
            <ListaSolicitudes
              data={data}
              filtro={filtroSol}
              onFiltro={setFiltroSol}
              insetBottom={insets.bottom}
              onAprobar={(id) => void aprobar('solicitudes', id)}
              onRechazar={(id, titulo) => setRechazo({ tab: 'solicitudes', id, titulo })}
            />
          ) : tab === 'roles' ? (
            <ListaRoles data={data} insetBottom={insets.bottom} onDetalle={irDetalleRol} />
          ) : tab === 'licencias' ? (
            <ListaLicencias
              data={data}
              insetBottom={insets.bottom}
              onAprobar={(id) => void aprobar('licencias', id)}
              onRechazar={(id, titulo) => setRechazo({ tab: 'licencias', id, titulo })}
            />
          ) : (
            <ListaAscensos
              data={data}
              filtro={filtroAsc}
              onFiltro={setFiltroAsc}
              insetBottom={insets.bottom}
              onVerCumplimiento={setCumplimiento}
              onAprobar={(id) => void aprobar('ascensos', id)}
              onRechazar={(id, titulo) => setRechazo({ tab: 'ascensos', id, titulo })}
            />
          )}
        </>
      ) : null}

      <CumplimientoSheet ascenso={cumplimiento} onClose={() => setCumplimiento(null)} />
      <RechazoSheet
        visible={rechazo != null}
        titulo={rechazo?.titulo ?? ''}
        submitting={submitting}
        onClose={() => (submitting ? null : setRechazo(null))}
        onConfirm={(c) => void confirmarRechazo(c)}
      />
    </View>
  );
}

// --- Helpers de filtro -------------------------------------------------------

function pillsEstado(items: { estado: EstadoAprob }[]): PillDef<FiltroEstado>[] {
  return [
    { key: 'TODAS', label: 'Todas', count: items.length },
    { key: 'PENDIENTE', label: 'Pendientes', count: items.filter((i) => i.estado === 'PENDIENTE').length },
    { key: 'APROBADA', label: 'Aprobadas', count: items.filter((i) => i.estado === 'APROBADA').length },
    { key: 'RECHAZADA', label: 'Rechazadas', count: items.filter((i) => i.estado === 'RECHAZADA').length },
  ];
}

function aplicaFiltro(estado: EstadoAprob, filtro: FiltroEstado): boolean {
  return filtro === 'TODAS' || estado === filtro;
}

function MockBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View style={styles.mockBanner}>
      <Ionicons name="information-circle" size={16} color={colors.info} />
      <Text style={styles.mockText}>Datos de ejemplo (módulo Aprobaciones aún no disponible en el backend).</Text>
    </View>
  );
}

// --- Bandeja: Solicitudes ----------------------------------------------------

function ListaSolicitudes({
  data,
  filtro,
  onFiltro,
  insetBottom,
  onAprobar,
  onRechazar,
}: {
  data: AprobacionesData;
  filtro: FiltroEstado;
  onFiltro: (f: FiltroEstado) => void;
  insetBottom: number;
  onAprobar: (id: string) => void;
  onRechazar: (id: string, titulo: string) => void;
}) {
  const items = data.solicitudes.filter((s) => aplicaFiltro(s.estado, filtro));
  return (
    <FlatList
      data={items}
      keyExtractor={(s) => s.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insetBottom + spacing.xl }}
      ListHeaderComponent={
        <View>
          <FiltroPills options={pillsEstado(data.solicitudes)} value={filtro} onChange={onFiltro} />
          <MockBanner visible={data.esMock} />
        </View>
      }
      renderItem={({ item }) => (
        <CardSolicitud
          item={item}
          onAprobar={() => onAprobar(item.id)}
          onRechazar={() => onRechazar(item.id, `${item.aprobador} – ${item.zona}`)}
        />
      )}
    />
  );
}

// --- Bandeja: Roles ----------------------------------------------------------

function ListaRoles({
  data,
  insetBottom,
  onDetalle,
}: {
  data: AprobacionesData;
  insetBottom: number;
  onDetalle: () => void;
}) {
  return (
    <FlatList
      data={data.roles}
      keyExtractor={(r) => r.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insetBottom + spacing.xl }}
      ListHeaderComponent={
        <View>
          <View style={styles.kpiRow}>
            <KpiMini valor={data.rolesKpis.pendientes} label="PENDIENTES" color={colors.warning} />
            <KpiMini valor={data.rolesKpis.porVencer} label="POR VENCER" color={colors.danger} />
            <KpiMini valor={data.rolesKpis.aprobadosHoy} label="APROBADOS HOY" color={colors.success} />
          </View>
          <MockBanner visible={data.esMock} />
        </View>
      }
      renderItem={({ item }) => <CardRol item={item} onPress={onDetalle} />}
    />
  );
}

function KpiMini({ valor, label, color }: { valor: number; label: string; color: string }) {
  return (
    <View style={styles.kpiMini}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValor, { color }]}>{valor}</Text>
    </View>
  );
}

// --- Bandeja: Licencias ------------------------------------------------------

function ListaLicencias({
  data,
  insetBottom,
  onAprobar,
  onRechazar,
}: {
  data: AprobacionesData;
  insetBottom: number;
  onAprobar: (id: string) => void;
  onRechazar: (id: string, titulo: string) => void;
}) {
  return (
    <FlatList
      data={data.licencias}
      keyExtractor={(l) => l.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: insetBottom + spacing.xl }}
      ListHeaderComponent={<MockBanner visible={data.esMock} />}
      renderItem={({ item }) => (
        <CardLicencia
          item={item}
          onAprobar={() => onAprobar(item.id)}
          onRechazar={() => onRechazar(item.id, item.nombre)}
        />
      )}
    />
  );
}

// --- Bandeja: Ascensos -------------------------------------------------------

function ListaAscensos({
  data,
  filtro,
  onFiltro,
  insetBottom,
  onVerCumplimiento,
  onAprobar,
  onRechazar,
}: {
  data: AprobacionesData;
  filtro: FiltroEstado;
  onFiltro: (f: FiltroEstado) => void;
  insetBottom: number;
  onVerCumplimiento: (a: SolicitudAscenso) => void;
  onAprobar: (id: string) => void;
  onRechazar: (id: string, titulo: string) => void;
}) {
  const items = data.ascensos.filter((a) => aplicaFiltro(a.estado, filtro));
  return (
    <FlatList
      data={items}
      keyExtractor={(a) => a.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insetBottom + spacing.xl }}
      ListHeaderComponent={
        <View>
          <FiltroPills options={pillsEstado(data.ascensos)} value={filtro} onChange={onFiltro} />
          <MockBanner visible={data.esMock} />
        </View>
      }
      renderItem={({ item }) => (
        <CardAscenso
          item={item}
          onVerCumplimiento={() => onVerCumplimiento(item)}
          onAprobar={() => onAprobar(item.id)}
          onRechazar={() => onRechazar(item.id, item.nombre)}
        />
      )}
    />
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
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
  kpiRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  kpiMini: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  kpiLabel: { fontSize: 9, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.3 },
  kpiValor: { fontSize: fontSize.xl, fontWeight: '800' },
});
