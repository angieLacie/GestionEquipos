/**
 * Paleta de marca Nova — "Gestión de Equipos".
 * Gradiente principal índigo -> azul (#4f46e5 -> #2563eb).
 */
export const colors = {
  // Marca
  brandIndigo: '#4f46e5',
  brandBlue: '#2563eb',
  gradient: ['#4f46e5', '#2563eb'] as const,

  // Neutrales
  white: '#ffffff',
  background: '#f3f4f6',
  card: '#ffffff',
  border: '#e5e7eb',

  // Texto
  text: '#111827',
  textMuted: '#6b7280',
  textOnBrand: '#ffffff',
  textOnBrandMuted: 'rgba(255,255,255,0.85)',

  // Estados
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  info: '#0ea5e9',

  // Tiles del Home (cuadro de color por módulo)
  tile: {
    equipos: '#2563eb', // azul
    vacaciones: '#dc2626', // rojo
    ampliaciones: '#ea580c', // naranja
    aprobaciones: '#7c3aed', // morado
    licencias: '#0d9488', // teal
  },
} as const;

/** Color de cobertura: verde >=95, ámbar <90, azul intermedio. */
export function coverageColor(pct: number): string {
  if (pct >= 95) return colors.success;
  if (pct < 90) return colors.warning;
  return colors.info;
}
