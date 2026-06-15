import type { MenuItemType } from '@/types/layout'
import { rolesFor } from '@/lib/acl'

export const menuItems: MenuItemType[] = [
  { key: 'insights', label: 'Insights', isTitle: true },
  {
    key: 'dashboards',
    label: 'Dashboards',
    icon: '/icons/sprite.svg#trello',
    badge: { variant: 'danger', text: 'New' },
    children: [
      { key: 'control-center', label: 'Control Center', url: '/dashboards/control-center' },
      { key: 'subscription', label: 'Subscription & Billing', url: '/dashboards/subscription' },
      { key: 'marketing', label: 'Marketing & Sales', url: '/dashboards/marketing' },
      { key: 'project-management', label: 'Project Management', url: '/dashboards/project-management' },
    ],
  },
  { key: 'nova', label: 'Gestión', isTitle: true },
  {
    icon: '/icons/sprite.svg#calendar',
    key: 'rol',
    label: 'Rol de Personal',
    url: '/rol',
    roles: rolesFor('/rol'),
  },
  {
    icon: '/icons/sprite.svg#clock',
    key: 'marcaciones',
    label: 'Marcaciones',
    url: '/marcaciones',
    roles: rolesFor('/marcaciones'),
  },
  {
    icon: '/icons/sprite.svg#trending-up',
    key: 'ascensos',
    label: 'Ascenso Senior',
    url: '/ascensos',
    roles: rolesFor('/ascensos'),
  },
  {
    icon: '/icons/sprite.svg#refresh-cw',
    key: 'encargaturas',
    label: 'Encargatura',
    url: '/encargaturas',
    roles: rolesFor('/encargaturas'),
  },
  {
    icon: '/icons/sprite.svg#sun',
    key: 'vacaciones',
    label: 'Vacaciones',
    url: '/vacaciones',
    roles: rolesFor('/vacaciones'),
  },
  {
    icon: '/icons/sprite.svg#coffee',
    key: 'descansos',
    label: 'Descansos y Compensaciones',
    url: '/descansos',
    roles: rolesFor('/descansos'),
  },
  {
    icon: '/icons/sprite.svg#bar-chart-2',
    key: 'reportes',
    label: 'Reportes',
    url: '/reportes',
    roles: rolesFor('/reportes'),
  },
  { key: 'configuracion', label: 'Configuración', isTitle: true },
  {
    icon: '/icons/sprite.svg#settings',
    key: 'config-mapeo-puestos',
    label: 'Mapeo Puestos',
    url: '/config/mapeo-puestos',
    roles: rolesFor('/config/mapeo-puestos'),
  },
  {
    icon: '/icons/sprite.svg#sliders',
    key: 'config-parametros-puestos',
    label: 'Tabla de Puestos',
    url: '/config/parametros-puestos',
    roles: rolesFor('/config/parametros-puestos'),
  },
  {
    icon: '/icons/sprite.svg#calendar',
    key: 'config-feriados',
    label: 'Feriados',
    url: '/config/feriados',
    roles: rolesFor('/config/feriados'),
  },
  {
    icon: '/icons/sprite.svg#shopping-bag',
    key: 'config-tiendas',
    label: 'Maestro de Tiendas',
    url: '/config/tiendas',
    roles: rolesFor('/config/tiendas'),
  },
  {
    icon: '/icons/sprite.svg#trending-up',
    key: 'config-campania',
    label: 'Semanas de Campaña',
    url: '/config/campania',
    roles: rolesFor('/config/campania'),
  },
  {
    icon: '/icons/sprite.svg#sliders',
    key: 'config-parametros',
    label: 'Parámetros del Sistema',
    url: '/config/parametros',
    roles: rolesFor('/config/parametros'),
  },
  {
    icon: '/icons/sprite.svg#shuffle',
    key: 'config-flujos-aprobacion',
    label: 'Flujos de Aprobación',
    url: '/config/flujos-aprobacion',
    roles: rolesFor('/config/flujos-aprobacion'),
  },
  {
    icon: '/icons/sprite.svg#list',
    key: 'config-historial',
    label: 'Historial de Cambios',
    url: '/config/historial',
    roles: rolesFor('/config/historial'),
  },
]

/**
 * Filtra el menú según los roles de la sesión.
 * - Ítem sin `roles` (o vacío) = visible para todos.
 * - Padre sin hijos visibles se descarta.
 * - Título sin grupo visible debajo se descarta.
 */
export function filterMenuByRoles(items: MenuItemType[], roles: string[]): MenuItemType[] {
  const permitido = (it: MenuItemType) =>
    !it.roles || it.roles.length === 0 || it.roles.some((r) => roles.includes(r))

  const visibles = items
    .map((item) => {
      if (item.isTitle) return item
      if (!permitido(item)) return null
      if (item.children) {
        const children = filterMenuByRoles(item.children, roles)
        return children.length ? { ...item, children } : null
      }
      return item
    })
    .filter(Boolean) as MenuItemType[]

  // Descarta títulos cuyo grupo quedó vacío.
  return visibles.filter((item, idx) => {
    if (!item.isTitle) return true
    for (let i = idx + 1; i < visibles.length; i++) {
      if (visibles[i].isTitle) break
      return true
    }
    return false
  })
}
