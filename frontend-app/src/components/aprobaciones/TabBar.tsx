import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { TabAprob } from '@/lib/aprobaciones';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface TabDef {
  key: TabAprob;
  label: string;
  icon: IoniconName;
}

const TABS: TabDef[] = [
  { key: 'solicitudes', label: 'Solicitudes', icon: 'document-outline' },
  { key: 'roles', label: 'Roles', icon: 'calendar-outline' },
  { key: 'licencias', label: 'Licencias', icon: 'copy-outline' },
  { key: 'ascensos', label: 'Ascensos', icon: 'trending-up-outline' },
];

interface Props {
  activa: TabAprob;
  contadores: Record<TabAprob, number>;
  onChange: (t: TabAprob) => void;
}

/**
 * Barra de 4 pestañas (Solicitudes/Roles/Licencias/Ascensos) con ícono y badge
 * contador. La pestaña activa lleva borde + texto índigo y su badge en azul;
 * las inactivas, badge rojo.
 */
export function TabBar({ activa, contadores, onChange }: Props) {
  return (
    <View style={styles.row}>
      {TABS.map((t) => {
        const activo = t.key === activa;
        const n = contadores[t.key];
        return (
          <Pressable
            key={t.key}
            style={[styles.tab, activo && styles.tabActiva]}
            onPress={() => onChange(t.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activo }}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name={t.icon}
                size={22}
                color={activo ? colors.brandIndigo : colors.textMuted}
              />
              {n > 0 ? (
                <View style={[styles.badge, { backgroundColor: activo ? colors.brandBlue : colors.danger }]}>
                  <Text style={styles.badgeText}>{n}</Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[styles.label, activo && styles.labelActiva]}
              numberOfLines={1}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tabActiva: {
    borderColor: colors.brandIndigo,
    backgroundColor: '#eef2ff',
  },
  iconWrap: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '800' },
  label: { fontSize: fontSize.xs, fontWeight: '600', color: colors.textMuted },
  labelActiva: { color: colors.brandIndigo, fontWeight: '800' },
});
