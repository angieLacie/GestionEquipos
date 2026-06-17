/**
 * Derivación del "perfil" de la app a partir de los roles del usuario.
 *
 * La app Nova es UNA SOLA pero muestra navegación/contenido distinto según el
 * perfil resuelto del usuario:
 *  - 'gestion' → gerentes/supervisores (Admin de Ventas, GG, GZ, GT).
 *  - 'campo'   → colaborador de tienda (Senior/colaborador/empleado).
 */

export type Perfil = 'gestion' | 'campo';

/**
 * Ids de rol (los que usa el backend) que corresponden al perfil de GESTIÓN.
 * Hoy se conoce con certeza `R-ADM` (Administrador / Admin de Ventas). Por
 * convención del sistema se asumen además los roles gerenciales:
 *  - R-GG → Gerente General
 *  - R-GZ → Gerente de Zona
 *  - R-GT → Gerente de Tienda
 *
 * Cualquier otro rol (Senior, colaborador, empleado, etc.) cae en 'campo'.
 *
 * TODO: confirmar ids de rol reales con Seguridad.
 */
const ROLES_GESTION = ['R-ADM', 'R-GG', 'R-GZ', 'R-GT'];

/**
 * Resuelve el perfil de la app: 'gestion' si alguno de los roles del usuario
 * intersecta con ROLES_GESTION; en caso contrario 'campo'.
 *
 * La comparación es case-insensitive y tolera espacios para no depender del
 * casing exacto que entregue el backend.
 */
export function perfilDeRoles(roles: string[]): Perfil {
  const gestion = new Set(ROLES_GESTION.map((r) => r.trim().toUpperCase()));
  const esGestion = roles.some((r) => gestion.has(r.trim().toUpperCase()));
  return esGestion ? 'gestion' : 'campo';
}

/** Etiqueta legible del perfil para la UI. */
export function etiquetaPerfil(p: Perfil): string {
  return p === 'gestion' ? 'Gestión' : 'Campo';
}

export { ROLES_GESTION };
