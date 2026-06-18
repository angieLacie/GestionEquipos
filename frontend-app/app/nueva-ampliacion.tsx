import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSize, radius, spacing } from '@/theme';
import {
  nuevoUid,
  solicitarAmpliaciones,
  tiendasNecesidadMock,
  totalLineas,
  type LineaAmpliacion,
  type TiendaNecesidad,
} from '@/lib/ampliaciones';
import { TipoStepperRow, AgregarTipo } from '@/components/ampliaciones/TipoStepperRow';

type FiltroNec = 'TODAS' | 'CON_NECESIDAD';

export default function NuevaAmpliacionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [tiendas, setTiendas] = useState<TiendaNecesidad[]>(() => tiendasNecesidadMock());
  const [abiertas, setAbiertas] = useState<Set<string>>(() => new Set(tiendasNecesidadMock().filter((t) => t.necesidad > 0).map((t) => t.id)));
  const [query, setQuery] = useState('');
  const [filtro, setFiltro] = useState<FiltroNec>('TODAS');
  const [submitting, setSubmitting] = useState(false);

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tiendas.filter((t) => {
      if (filtro === 'CON_NECESIDAD' && totalLineas(t.lineas) === 0) return false;
      return !q || t.nombre.toLowerCase().includes(q);
    });
  }, [tiendas, query, filtro]);

  const totalGeneral = tiendas.reduce((s, t) => s + totalLineas(t.lineas), 0);

  const toggle = (id: string) =>
    setAbiertas((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const setLineas = (idTienda: string, fn: (l: LineaAmpliacion[]) => LineaAmpliacion[]) =>
    setTiendas((prev) => prev.map((t) => (t.id === idTienda ? { ...t, lineas: fn(t.lineas) } : t)));

  async function solicitar() {
    setSubmitting(true);
    try {
      const payload = tiendas.filter((t) => totalLineas(t.lineas) > 0).map((t) => ({ idTienda: t.id, lineas: t.lineas }));
      await solicitarAmpliaciones({ tiendas: payload });
      router.back();
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
            <Text style={styles.headerTitle}>Nueva Ampliación</Text>
            <Text style={styles.headerSub}>Solicitudes de ampliación</Text>
          </View>
          <View style={{ width: 26 }} />
        </View>
      </LinearGradient>

      <FlatList
        data={visibles}
        keyExtractor={(t) => t.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
        ListHeaderComponent={
          <View>
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={18} color={colors.brandIndigo} />
              <Text style={styles.infoText}>Agrega asesores y/o SAS/PT según la necesidad de cobertura por tienda.</Text>
            </View>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar tienda…"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.pillsRow}>
              <Pill label="Todas" activa={filtro === 'TODAS'} onPress={() => setFiltro('TODAS')} />
              <Pill label="Con necesidad" activa={filtro === 'CON_NECESIDAD'} onPress={() => setFiltro('CON_NECESIDAD')} />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TiendaNecesidadRow
            tienda={item}
            abierta={abiertas.has(item.id)}
            onToggle={() => toggle(item.id)}
            onChangeTipo={(uid, tipo) => setLineas(item.id, (ls) => ls.map((l) => (l.uid === uid ? { ...l, tipo } : l)))}
            onChangeCantidad={(uid, cantidad) => setLineas(item.id, (ls) => ls.map((l) => (l.uid === uid ? { ...l, cantidad } : l)))}
            onEliminar={(uid) => setLineas(item.id, (ls) => ls.filter((l) => l.uid !== uid))}
            onAgregar={() => setLineas(item.id, (ls) => [...ls, { uid: nuevoUid(), tipo: 'ASESOR', cantidad: 1 }])}
          />
        )}
      />

      <View style={[styles.fabWrap, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }, (submitting || totalGeneral === 0) && { opacity: 0.5 }]}
          onPress={() => void solicitar()}
          disabled={submitting || totalGeneral === 0}
        >
          <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fabGrad}>
            <Text style={styles.fabText}>
              {submitting ? 'Enviando…' : `Solicitar ampliaciones${totalGeneral > 0 ? ` (${totalGeneral})` : ''}`}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function Pill({ label, activa, onPress }: { label: string; activa: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.pill, activa ? styles.pillActiva : styles.pillInactiva]} onPress={onPress}>
      <Text style={[styles.pillText, { color: activa ? colors.white : colors.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

function TiendaNecesidadRow({
  tienda,
  abierta,
  onToggle,
  onChangeTipo,
  onChangeCantidad,
  onEliminar,
  onAgregar,
}: {
  tienda: TiendaNecesidad;
  abierta: boolean;
  onToggle: () => void;
  onChangeTipo: (uid: string, tipo: string) => void;
  onChangeCantidad: (uid: string, cantidad: number) => void;
  onEliminar: (uid: string) => void;
  onAgregar: () => void;
}) {
  const total = totalLineas(tienda.lineas);
  return (
    <View style={styles.tiendaBlock}>
      <Pressable style={styles.tiendaHead} onPress={onToggle}>
        <Text style={styles.tiendaNombre}>{tienda.nombre}</Text>
        <View style={[styles.badge, total > 0 ? styles.badgeOn : styles.badgeOff]}>
          <Text style={[styles.badgeText, { color: total > 0 ? colors.white : colors.textMuted }]}>{total}</Text>
        </View>
        <Ionicons name={abierta ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </Pressable>

      {abierta ? (
        <View style={styles.tiendaBody}>
          {tienda.lineas.map((l) => (
            <TipoStepperRow
              key={l.uid}
              linea={l}
              onChangeTipo={(tipo) => onChangeTipo(l.uid, tipo)}
              onChangeCantidad={(cantidad) => onChangeCantidad(l.uid, cantidad)}
              onEliminar={() => onEliminar(l.uid)}
            />
          ))}
          <AgregarTipo onPress={onAgregar} />
        </View>
      ) : null}
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
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: colors.white, fontSize: fontSize.lg, fontWeight: '800', letterSpacing: 0.5 },
  headerSub: { color: colors.textOnBrandMuted, fontSize: fontSize.xs, marginTop: 2 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: '#eef2ff',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  infoText: { flex: 1, color: colors.brandIndigo, fontSize: fontSize.xs, fontWeight: '600' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    height: 46,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: fontSize.md, color: colors.text },
  pillsRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  pill: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill },
  pillActiva: { backgroundColor: colors.brandIndigo },
  pillInactiva: { backgroundColor: '#e5e7eb' },
  pillText: { fontSize: fontSize.sm, fontWeight: '700' },
  tiendaBlock: { backgroundColor: colors.card, marginHorizontal: spacing.lg, marginVertical: spacing.xs, borderRadius: radius.lg, overflow: 'hidden' },
  tiendaHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
  tiendaNombre: { flex: 1, fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  badge: { minWidth: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeOn: { backgroundColor: colors.brandIndigo },
  badgeOff: { backgroundColor: '#e5e7eb' },
  badgeText: { fontSize: fontSize.sm, fontWeight: '800' },
  tiendaBody: { borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, paddingBottom: spacing.md },
  fabWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  fab: { borderRadius: radius.lg, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  fabGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  fabText: { color: colors.white, fontSize: fontSize.md, fontWeight: '800' },
});
