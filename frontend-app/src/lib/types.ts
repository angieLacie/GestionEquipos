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
  nombreCompleto?: string | null;
  puesto?: string | null;
  esSenior?: boolean | null;
  estado?: string | null; // ACTIVO, DESCANSO_MEDICO, VACACIONES, LICENCIA, ...
  vigenciaDesde?: string | null; // ISO o dd/mm/aaaa
  vigenciaHasta?: string | null;
  [key: string]: unknown;
}

/** Asesor dentro de la jerarquía zona -> tienda -> asesores. */
export interface AsesorItem {
  id: string;
  nombreCompleto: string;
  puesto: string;
  esSenior: boolean;
  estado: string;
  /** true si el asesor cuenta como activo (cobertura). */
  activo: boolean;
  /** Vigencia mockeada/real para mostrar "dd/mm/aaaa – dd/mm/aaaa". */
  vigenciaDesde?: string;
  vigenciaHasta?: string;
}

/** Tienda dentro de una zona, con sus asesores y KPIs. */
export interface TiendaResumen {
  id: string;
  nombre: string;
  encargado: string;
  kpis: GestionKpis;
  asesores: AsesorItem[];
}

/** Zona con detalle completo: KPIs + tiendas + asesores. */
export interface ZonaDetalle {
  zona: string;
  kpis: GestionKpis;
  tiendas: TiendaResumen[];
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
