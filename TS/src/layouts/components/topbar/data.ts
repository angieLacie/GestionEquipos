export type NotificationType = {
  /** id de icono en /icons/sprite.svg */
  icon: string
  /** variante de color Bootstrap: primary | success | warning | danger | info */
  variant: string
  /** título de la notificación */
  name: string
  /** detalle */
  description: string
  /** etiqueta de tiempo relativa */
  time: string
  unread?: boolean
  /** ruta destino al hacer clic */
  to?: string
}

// MOCK — datos de ejemplo. Para conectar backend real, reemplazar solo este arreglo
// (o la fuente que lo alimente) manteniendo la forma de NotificationType.
export const notifications: NotificationType[] = [
  {
    icon: 'calendar',
    variant: 'primary',
    name: 'Rol semanal pendiente de aprobación',
    description: 'Tienda Miraflores — semana 25',
    time: 'hace 5 minutos',
    unread: true,
    to: '/rol-personal',
  },
  {
    icon: 'umbrella',
    variant: 'info',
    name: 'Nueva solicitud de vacaciones',
    description: 'Juan Pérez solicita del 01 al 15 de julio',
    time: 'hace 22 minutos',
    unread: true,
    to: '/vacaciones',
  },
  {
    icon: 'clock',
    variant: 'warning',
    name: 'Marcación fuera de horario',
    description: 'Tienda San Isidro — 3 incidencias hoy',
    time: 'hace 1 hora',
    unread: true,
    to: '/marcaciones',
  },
  {
    icon: 'award',
    variant: 'success',
    name: 'Ascenso Senior aprobado',
    description: 'María Gómez cumple los 6 meses requeridos',
    time: 'hace 3 horas',
    to: '/ascensos',
  },
  {
    icon: 'briefcase',
    variant: 'danger',
    name: 'Encargatura por vencer',
    description: 'Tienda Surco — vence en 2 días',
    time: 'hace 5 horas',
    to: '/encargaturas',
  },
  {
    icon: 'coffee',
    variant: 'success',
    name: 'Compensación registrada',
    description: 'Descanso compensado para Luis Ramos',
    time: 'ayer',
    to: '/descansos',
  },
]
