import { api, ApiError } from './api';

/**
 * Dominio del módulo Aprobaciones (app móvil — perfil Gestión).
 *
 * Cuatro bandejas: Solicitudes (gestión de equipos), Roles (cobertura /
 * encargatura), Licencias y Ascensos (Senior). Mock seam idéntico a
 * `gestion-equipos.ts`: `cargarAprobaciones()` intenta el backend y, si el
 * módulo aún no existe (404 / shape), cae a datos de ejemplo con `esMock`.
 *
 * NOTA: el módulo backend Aprobaciones (motor de flujos F0) todavía no está
 * construido — ver docs/software-factory/product/pendientes-y-brechas.md.
 */

// --- Tipos compartidos ------------------------------------------------------

export type TabAprob = 'solicitudes' | 'roles' | 'licencias' | 'ascensos';

/** Estado de un documento en flujo de aprobación. */
export type EstadoAprob = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

/** Estado específico de una solicitud de rol (incluye vencimiento). */
export type EstadoRol = 'PENDIENTE' | 'POR_VENCER' | 'APROBADO';

/** Goce de haber de licencias/ascensos. */
export type Goce = 'CON_GOCE' | 'SIN_GOCE';

/** Decisión del aprobador. */
export type Decision = 'APROBAR' | 'RECHAZAR';

// --- Solicitudes (gestión de equipos) ---------------------------------------

export interface TiendaSolicitud {
  nombre: string;
  /** Chips con punto verde: "1 ASES", "1 SEC/PT", "1 SAS/FT"… */
  chips: string[];
}

export interface Solicitud {
  id: string;
  /** Aprobador/solicitante: "JULIO NIEBUHR". */
  aprobador: string;
  zona: string; // "LIMA NORTE"
  tiendas: TiendaSolicitud[];
  fecha: string; // "17/04/2026"
  estado: EstadoAprob;
}

// --- Roles ------------------------------------------------------------------

export interface RolesKpis {
  pendientes: number;
  porVencer: number;
  aprobadosHoy: number;
}

export interface SolicitudRol {
  id: string;
  tipo: string; // "Cobertura de tienda" | "Encargatura" | "Cobertura por tipo de venta"
  tienda: string; // "Plaza Norte"
  persona: string; // "Ana Torres"
  rolPersona: string; // "Asesor" | "Encargado"
  desde: string; // "02 Jun"
  hasta: string; // "06 Jun 2026"
  enviadoPor: string; // "María Pérez"
  cargoEnviador: string; // "Gte. Tienda"
  vence: string; // "28 May 2026"
  faltanDias: number;
  estado: EstadoRol;
}

// --- Licencias --------------------------------------------------------------

export interface SolicitudLicencia {
  id: string;
  nombre: string; // "Ana Torres"
  tienda: string; // "SAN BORJA"
  puesto: string; // "Asesor"
  goce: Goce;
  desde: string; // "05/04/2026"
  hasta: string; // "18/04/2026"
  motivo: string; // "Reposo médico por intervención."
  estado: EstadoAprob;
}

// --- Ascensos ---------------------------------------------------------------

export interface MesCuota {
  mes: string; // "Dic 2025"
  pct: number; // 96.5
}

export interface SolicitudAscenso {
  id: string;
  nombre: string; // "Ramos Martínez, Elmer Jhon"
  tienda: string; // "EL TACNA"
  puesto: string; // "Asesor"
  goce: Goce;
  promotor: string; // "Administración de Ventas (AV)"
  /** true si la inició el usuario actual → bloqueo por segregación de funciones. */
  iniciadaPorUsuario?: boolean;
  cumplimiento: MesCuota[]; // últimos 6 meses
  estado: EstadoAprob;
}

// --- Agregado del módulo ----------------------------------------------------

export interface AprobacionesData {
  solicitudes: Solicitud[];
  roles: SolicitudRol[];
  rolesKpis: RolesKpis;
  licencias: SolicitudLicencia[];
  ascensos: SolicitudAscenso[];
  esMock: boolean;
}

/** Conteos de las pestañas (badges): items que requieren acción por bandeja. */
export function contadoresTabs(d: AprobacionesData): Record<TabAprob, number> {
  return {
    solicitudes: d.solicitudes.filter((s) => s.estado === 'PENDIENTE').length,
    roles: d.roles.filter((r) => r.estado !== 'APROBADO').length,
    licencias: d.licencias.filter((l) => l.estado === 'PENDIENTE').length,
    ascensos: d.ascensos.filter((a) => a.estado === 'PENDIENTE').length,
  };
}

// --- Mock seam --------------------------------------------------------------

const SOLICITUDES_MOCK: Solicitud[] = [
  {
    id: 'sol-1',
    aprobador: 'JULIO NIEBUHR',
    zona: 'LIMA NORTE',
    tiendas: [
      { nombre: 'EL BELLAVISTA', chips: ['1 ASES', '1 SEC/PT'] },
      { nombre: 'EL PLZ NORTE', chips: ['2 ASES', '1 SAS/FT'] },
    ],
    fecha: '17/04/2026',
    estado: 'PENDIENTE',
  },
  {
    id: 'sol-2',
    aprobador: 'CRISGLEN STRIPPOLI',
    zona: 'PROV. SUR',
    tiendas: [
      { nombre: 'EL AREQUIPA MALL', chips: ['1 ASES', '1 SEC/PT'] },
      { nombre: 'EL JULIACA', chips: ['2 ASES', '1 SAS/FT'] },
      { nombre: 'EL CUSCO', chips: ['1 ASES'] },
    ],
    fecha: '16/04/2026',
    estado: 'PENDIENTE',
  },
  {
    id: 'sol-3',
    aprobador: 'RONALD SILVA',
    zona: 'LIMA CENTRO',
    tiendas: [
      { nombre: 'EL JR. DE LA UNION', chips: ['3 ASES', '1 SEC/PT'] },
      { nombre: 'EL EMANCIPACION', chips: ['1 ASES'] },
    ],
    fecha: '16/04/2026',
    estado: 'PENDIENTE',
  },
  {
    id: 'sol-4',
    aprobador: 'MARIELA FLORES',
    zona: 'LIMA SUR',
    tiendas: [{ nombre: 'EL ATOCONGO', chips: ['2 ASES', '1 SAS/FT'] }],
    fecha: '15/04/2026',
    estado: 'PENDIENTE',
  },
  {
    id: 'sol-5',
    aprobador: 'OSCAR PAREDES',
    zona: 'LIMA ESTE',
    tiendas: [{ nombre: 'EL SANTA ANITA', chips: ['1 ASES', '1 SEC/PT'] }],
    fecha: '14/04/2026',
    estado: 'PENDIENTE',
  },
  {
    id: 'sol-6',
    aprobador: 'LUCÍA PRADO',
    zona: 'CALLAO',
    tiendas: [{ nombre: 'EL MINKA', chips: ['2 ASES'] }],
    fecha: '12/04/2026',
    estado: 'APROBADA',
  },
  {
    id: 'sol-7',
    aprobador: 'JAIME ROJAS',
    zona: 'LIMA NORTE',
    tiendas: [{ nombre: 'EL MEGA PLAZA', chips: ['1 ASES', '1 SEC/PT'] }],
    fecha: '11/04/2026',
    estado: 'APROBADA',
  },
  {
    id: 'sol-8',
    aprobador: 'PATRICIA LEÓN',
    zona: 'PROV. NORTE',
    tiendas: [{ nombre: 'EL TRUJILLO', chips: ['1 ASES'] }],
    fecha: '10/04/2026',
    estado: 'RECHAZADA',
  },
];

const ROLES_MOCK: SolicitudRol[] = [
  {
    id: 'rol-1',
    tipo: 'Cobertura de tienda',
    tienda: 'Plaza Norte',
    persona: 'Ana Torres',
    rolPersona: 'Asesor',
    desde: '02 Jun',
    hasta: '06 Jun 2026',
    enviadoPor: 'María Pérez',
    cargoEnviador: 'Gte. Tienda',
    vence: '28 May 2026',
    faltanDias: 2,
    estado: 'POR_VENCER',
  },
  {
    id: 'rol-2',
    tipo: 'Encargatura',
    tienda: 'Mega Plaza',
    persona: 'Luis Quispe',
    rolPersona: 'Encargado',
    desde: '01 Jun',
    hasta: '30 Jun 2026',
    enviadoPor: 'Juan Rodríguez',
    cargoEnviador: 'Gte. Tienda',
    vence: '28 May 2026',
    faltanDias: 2,
    estado: 'POR_VENCER',
  },
  {
    id: 'rol-3',
    tipo: 'Cobertura por tipo de venta',
    tienda: 'Real Plaza (Lukers)',
    persona: 'Marco Ríos',
    rolPersona: 'Asesor',
    desde: '02 Jun',
    hasta: '08 Jun 2026',
    enviadoPor: 'Lucía Prado',
    cargoEnviador: 'Gte. Tienda',
    vence: '30 May 2026',
    faltanDias: 4,
    estado: 'PENDIENTE',
  },
  {
    id: 'rol-4',
    tipo: 'Cobertura de tienda',
    tienda: 'Mall del Sur',
    persona: 'Valeria Castillo',
    rolPersona: 'Asesor',
    desde: '02 Jun',
    hasta: '08 Jun 2026',
    enviadoPor: 'Ana Torres',
    cargoEnviador: 'Gte. Tienda',
    vence: '31 May 2026',
    faltanDias: 5,
    estado: 'PENDIENTE',
  },
  {
    id: 'rol-5',
    tipo: 'Encargatura',
    tienda: 'Jockey Plaza',
    persona: 'Diego Ramos',
    rolPersona: 'Encargado',
    desde: '03 Jun',
    hasta: '17 Jun 2026',
    enviadoPor: 'Rosa Vargas',
    cargoEnviador: 'Gte. Tienda',
    vence: '01 Jun 2026',
    faltanDias: 6,
    estado: 'PENDIENTE',
  },
  {
    id: 'rol-6',
    tipo: 'Cobertura por tipo de venta',
    tienda: 'Plaza San Miguel',
    persona: 'Sofía Núñez',
    rolPersona: 'Asesor',
    desde: '03 Jun',
    hasta: '09 Jun 2026',
    enviadoPor: 'Pedro Castro',
    cargoEnviador: 'Gte. Tienda',
    vence: '02 Jun 2026',
    faltanDias: 7,
    estado: 'PENDIENTE',
  },
  {
    id: 'rol-7',
    tipo: 'Cobertura de tienda',
    tienda: 'Open Plaza',
    persona: 'Iván Cáceres',
    rolPersona: 'Asesor',
    desde: '04 Jun',
    hasta: '10 Jun 2026',
    enviadoPor: 'Elena Torres',
    cargoEnviador: 'Gte. Tienda',
    vence: '03 Jun 2026',
    faltanDias: 8,
    estado: 'PENDIENTE',
  },
];

const ROLES_KPIS_MOCK: RolesKpis = { pendientes: 7, porVencer: 2, aprobadosHoy: 3 };

const LICENCIAS_MOCK: SolicitudLicencia[] = [
  {
    id: 'lic-1',
    nombre: 'Ana Torres',
    tienda: 'SAN BORJA',
    puesto: 'Asesor',
    goce: 'CON_GOCE',
    desde: '05/04/2026',
    hasta: '18/04/2026',
    motivo: 'Reposo médico por intervención.',
    estado: 'PENDIENTE',
  },
  {
    id: 'lic-2',
    nombre: 'Jorge Ruiz',
    tienda: 'C.C. EL POLO',
    puesto: 'Asesor',
    goce: 'SIN_GOCE',
    desde: '10/04/2026',
    hasta: '30/04/2026',
    motivo: 'Asuntos personales.',
    estado: 'PENDIENTE',
  },
];

function cumplimientoMock(base: number): MesCuota[] {
  const meses = ['Dic 2025', 'Ene 2026', 'Feb 2026', 'Mar 2026', 'Abr 2026', 'May 2026'];
  const deltas = [0, 4.7, -8.5, 8.3, 13.8, 1.1];
  return meses.map((mes, i) => ({ mes, pct: Math.round((base + deltas[i]) * 10) / 10 }));
}

const ASCENSOS_MOCK: SolicitudAscenso[] = [
  {
    id: 'asc-1',
    nombre: 'Ramos Martínez, Elmer Jhon',
    tienda: 'EL TACNA',
    puesto: 'Asesor',
    goce: 'CON_GOCE',
    promotor: 'Administración de Ventas (AV)',
    cumplimiento: [
      { mes: 'Dic 2025', pct: 96.5 },
      { mes: 'Ene 2026', pct: 101.2 },
      { mes: 'Feb 2026', pct: 88.0 },
      { mes: 'Mar 2026', pct: 104.8 },
      { mes: 'Abr 2026', pct: 110.3 },
      { mes: 'May 2026', pct: 97.6 },
    ],
    estado: 'PENDIENTE',
  },
  {
    id: 'asc-2',
    nombre: 'Chira Sotil, Mayra Carla',
    tienda: 'EL LARCO',
    puesto: 'Asesor',
    goce: 'CON_GOCE',
    promotor: 'Administración de Ventas (AV)',
    cumplimiento: cumplimientoMock(99),
    estado: 'PENDIENTE',
  },
  {
    id: 'asc-3',
    nombre: 'Huapaya Ruiz, Hugo Sandro',
    tienda: 'LUKERS MENDIOLA',
    puesto: 'Asesor',
    goce: 'SIN_GOCE',
    promotor: 'Administración de Ventas (AV)',
    iniciadaPorUsuario: true,
    cumplimiento: cumplimientoMock(94),
    estado: 'PENDIENTE',
  },
];

function datosMock(): AprobacionesData {
  return {
    // Copias para que las mutaciones optimistas no contaminen el módulo.
    solicitudes: SOLICITUDES_MOCK.map((s) => ({ ...s })),
    roles: ROLES_MOCK.map((r) => ({ ...r })),
    rolesKpis: { ...ROLES_KPIS_MOCK },
    licencias: LICENCIAS_MOCK.map((l) => ({ ...l })),
    ascensos: ASCENSOS_MOCK.map((a) => ({ ...a })),
    esMock: true,
  };
}

// --- Carga ------------------------------------------------------------------

/**
 * Carga las bandejas de Aprobaciones. Intenta el backend; si el módulo aún no
 * existe (404 / 5xx / shape) cae al mock con `esMock: true`. Errores de red o
 * 401 se propagan para que la UI los muestre.
 */
export async function cargarAprobaciones(token: string): Promise<AprobacionesData> {
  try {
    const data = await api.aprobaciones(token);
    if (data && Array.isArray(data.solicitudes)) {
      return { ...data, esMock: false };
    }
    return datosMock();
  } catch (e) {
    if (e instanceof ApiError && (e.kind === 'network' || e.kind === 'unauthorized')) {
      throw e;
    }
    return datosMock();
  }
}

// --- Acciones (mock) --------------------------------------------------------

/**
 * Resuelve una aprobación (aprobar/rechazar). MOCK: simula latencia y devuelve
 * una referencia. // TODO: conectar al backend de Aprobaciones cuando exista.
 */
export async function resolverAprobacion(input: {
  tab: TabAprob;
  id: string;
  decision: Decision;
  comentario?: string;
}): Promise<{ ref: string }> {
  await new Promise((r) => setTimeout(r, 500));
  const prefijo = input.decision === 'APROBAR' ? 'APR' : 'RCH';
  return { ref: `${prefijo}-${input.tab.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}` };
}
