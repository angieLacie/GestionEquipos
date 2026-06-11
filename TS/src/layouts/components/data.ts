import type { MenuItemType } from '@/types/layout'

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
  },
  {
    icon: '/icons/sprite.svg#settings',
    key: 'config-mapeo-puestos',
    label: 'Mapeo Puestos',
    url: '/config/mapeo-puestos',
  },
]
