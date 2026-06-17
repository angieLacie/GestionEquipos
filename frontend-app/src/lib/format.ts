/** Iniciales a partir de un nombre de usuario o nombre completo. */
export function iniciales(nombre: string): string {
  const limpio = nombre.trim();
  if (!limpio) return '?';
  // Si es un email, usa la parte local.
  const base = limpio.includes('@') ? limpio.split('@')[0] : limpio;
  const partes = base.split(/[.\s_-]+/).filter(Boolean);
  if (partes.length === 0) return base.slice(0, 2).toUpperCase();
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** "Junio 2026" del mes actual. */
export function mesActual(date = new Date()): string {
  return `${MESES[date.getMonth()]} ${date.getFullYear()}`;
}
