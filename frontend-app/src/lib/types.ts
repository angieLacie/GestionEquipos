/** Tipos compartidos del dominio Nova consumidos por la app. */

/** Respuesta de POST /v1/segu/auth/login */
export interface LoginResponse {
  token: string;
  idUsuario: number | string;
  nombreUsuario: string;
  requiereCambioPassword: boolean;
  roles: string[];
}

/** Sesión autenticada persistida en SecureStore (sin el password). */
export interface Sesion {
  token: string;
  idUsuario: number | string;
  nombreUsuario: string;
  requiereCambioPassword: boolean;
  roles: string[];
}

/** Item del roster de empleados: GET /v1/maes/empleados/roster (shape tentativo). */
export interface RosterEmpleado {
  idEmpleado?: number | string;
  zona?: string | null;
  tienda?: string | null;
  estado?: string | null; // ACTIVO, DESCANSO_MEDICO, VACACIONES, LICENCIA, ...
  [key: string]: unknown;
}

/** Agregado por zona para la pantalla de Gestión de Equipos. */
export interface ZonaResumen {
  zona: string;
  plantilla: number;
  activos: number;
  tiendas: number;
  descansoMedico: number;
  vacaciones: number;
  licencias: number;
  coberturaPct: number;
}

/** KPIs globales de la cabecera de Gestión de Equipos. */
export interface GestionKpis {
  plantilla: number;
  activos: number;
  coberturaPct: number;
  descansoMedico: number;
  vacaciones: number;
  licencias: number;
}
