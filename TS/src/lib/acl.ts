// Fuente única de autorización por ruta. Menú (filterMenuByRoles) y guard
// (RequireRoles) la consumen para no divergir. Códigos = maes.rol.Codigo.

/** Ruta → IdRol que pueden acceder. Ruta ausente = libre para cualquier sesión. */
export const routeRoles: Record<string, string[]> = {
  '/rol': ['R-ADM', 'R-GG', 'R-GZ', 'R-GT', 'R-AV'],
  '/marcaciones': ['R-ADM', 'R-GG', 'R-GZ', 'R-GT', 'R-AV'],
  '/ascensos': ['R-ADM', 'R-GG', 'R-AV'],
  '/encargaturas': ['R-ADM', 'R-GG', 'R-GZ', 'R-GT', 'R-AV'],
  '/vacaciones': ['R-ADM', 'R-GG', 'R-GZ', 'R-GT', 'R-AV'],
  '/descansos': ['R-ADM', 'R-GG', 'R-GZ', 'R-GT', 'R-AV'],
  '/reportes': ['R-ADM', 'R-GG', 'R-GZ', 'R-AV'],
  '/config/mapeo-puestos': ['R-ADM', 'R-GG'],
  '/config/parametros-puestos': ['R-ADM', 'R-GG'],
  '/config/feriados': ['R-ADM', 'R-GG'],
  '/config/tiendas': ['R-ADM', 'R-GG'],
  '/config/campania': ['R-ADM', 'R-GG'],
  '/config/parametros': ['R-ADM'],
  '/config/historial': ['R-ADM'],
  '/config/flujos-aprobacion': ['R-ADM', 'R-GG'],
}

/** Roles requeridos por una ruta (undefined = sin restricción). */
export const rolesFor = (url?: string): string[] | undefined =>
  url ? routeRoles[url] : undefined

/** ¿La sesión cubre los roles requeridos? Sin requisito = permitido. */
export const puedeAcceder = (rolesSesion: string[], requeridos?: string[]): boolean =>
  !requeridos || requeridos.length === 0 || requeridos.some((r) => rolesSesion.includes(r))
