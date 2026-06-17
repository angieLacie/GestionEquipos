import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AsesorItem, TiendaResumen, ZonaDetalle } from '@/lib/types';
import { colors, fontSize, radius, spacing } from '@/theme';

interface BuscadorModalProps {
  visible: boolean;
  zonas: ZonaDetalle[];
  onClose: () => void;
  onSelTienda: (tienda: TiendaResumen) => void;
  onSelEmpleado: (asesor: AsesorItem) => void;
}

type Resultado =
  | { tipo: 'tienda'; tienda: TiendaResumen }
  | { tipo: 'empleado'; asesor: AsesorItem; tienda: string };

/** Buscador modal combinado: tiendas + empleados, filtrado en vivo. */
export function BuscadorModal({
  visible,
  zonas,
  onClose,
  onSelTienda,
  onSelEmpleado,
}: BuscadorModalProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const resultados = useMemo<Resultado[]>(() => {
    const q = query.trim().toLowerCase();
    const tiendas: Resultado[] = [];
    const empleados: Resultado[] = [];
    for (const z of zonas) {
      for (const t of z.tiendas) {
        if (!q || t.nombre.toLowerCase().includes(q) || t.encargado.toLowerCase().includes(q)) {
          tiendas.push({ tipo: 'tienda', tienda: t });
        }
        for (const a of t.asesores) {
          if (
            q &&
            (a.nombreCompleto.toLowerCase().includes(q) || a.puesto.toLowerCase().includes(q))
          ) {
            empleados.push({ tipo: 'empleado', asesor: a, tienda: t.nombre });
          }
        }
      }
    }
    // Cuando no hay texto, mostramos solo tiendas (lista navegable).
    return [...tiendas.slice(0, 50), ...empleados.slice(0, 50)];
  }, [zonas, query]);

  const cerrar = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={cerrar}>
      <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.topRow}>
          <Text style={styles.titulo}>Buscar en Gestión de Equipos</Text>
          <Pressable hitSlop={10} onPress={cerrar} accessibilityLabel="Cerrar buscador">
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.search}
            placeholder="Buscar empleado o tienda…"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query ? (
            <Pressable hitSlop={8} onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <FlatList
          data={resultados}
          keyExtractor={(r) =>
            r.tipo === 'tienda' ? `t-${r.tienda.id}` : `e-${r.asesor.id}`
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyText}>Sin resultados</Text>
            </View>
          }
          renderItem={({ item }) =>
            item.tipo === 'tienda' ? (
              <Pressable
                style={styles.itemRow}
                onPress={() => {
                  cerrar();
                  onSelTienda(item.tienda);
                }}
              >
                <View style={[styles.itemIcon, { backgroundColor: '#eef2ff' }]}>
                  <Ionicons name="storefront-outline" size={20} color={colors.brandIndigo} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemNombre} numberOfLines={1}>
                    {item.tienda.nombre}
                  </Text>
                  <Text style={styles.itemSub} numberOfLines={1}>
                    Tienda · {item.tienda.encargado}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            ) : (
              <Pressable
                style={styles.itemRow}
                onPress={() => {
                  cerrar();
                  onSelEmpleado(item.asesor);
                }}
              >
                <View style={styles.itemAvatar}>
                  <Text style={styles.itemAvatarText}>{iniciales(item.asesor.nombreCompleto)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemNombre} numberOfLines={1}>
                    {item.asesor.nombreCompleto}
                  </Text>
                  <Text style={styles.itemSub} numberOfLines={1}>
                    {item.asesor.puesto} · {item.tienda}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            )
          }
        />
      </View>
    </Modal>
  );
}

function iniciales(nombre: string): string {
  const parts = nombre.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titulo: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, flex: 1 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  search: { flex: 1, paddingVertical: 10, fontSize: fontSize.md, color: colors.text },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemAvatarText: { color: colors.brandIndigo, fontWeight: '800', fontSize: fontSize.sm },
  itemNombre: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  itemSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingTop: spacing.xxl },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md },
});
