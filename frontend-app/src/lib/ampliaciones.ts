import { api, ApiError } from './api';

/**
 * Dominio del módulo Ampliaciones (app móvil — perfil Gestión).
 *
 * Dos vistas: Historial de ampliaciones enviadas (lista + edición inline de
 * pendientes) y Nueva Ampliación (acordeón de tiendas con necesidad de
 * cobertura). Mock seam idéntico a `gestion-equipos.ts`.
 *
 * NOTA: el módulo backend Ampliaciones todavía no está construido — ver
 * docs/software-factory/product/pendientes-y-brechas.md.
 */

/** Tipos de puesto solicitables en una ampliación. */
export const TIPOS_PUESTO = ['ASESOR', 'SEC/PT', 'SAS/FT', 'SAS/PT'] as const;
export type TipoPuesto = (typeof TIPOS_PUESTO)[number];

/** Abreviatura para los chips ("ASESOR" → "ASES"). */
export function abreviaturaTipo(tipo: string): string {
  return tipo === 'ASESOR' ? 'ASES' : tipo;
}

export type EstadoAmp = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface LineaAmpliacion {
  /** id local para edición estable. */
  uid: string;
  tipo: string;
  cantidad: number;
}

export interface Ampliacion {
  id: string;
  tienda: string; // "El Bellavista"
  lineas: LineaAmpliacion[];
  fecha: string; // "17/04/2026"
  estado: EstadoAmp;
}

export interface AmpliacionesData {
  ampliaciones: Ampliacion[];
  esMock: boolean;
}

/** Tienda con necesidad de cobertura para la pantalla Nueva Ampliación. */
export interface TiendaNecesidad {
  id: string;
  nombre: string;
  /** Total de personas sugeridas (badge). */
  necesidad: number;
  lineas: LineaAmpliacion[];
}

let uidSeq = 0;
/** Genera un uid local para líneas nuevas. */
export function nuevoUid(): string {
  uidSeq += 1;
  return `ln-${Date.now().toString(36)}-${uidSeq}`;
}

function linea(tipo: string, cantidad: number): LineaAmpliacion {
  return { uid: nuevoUid(), tipo, cantidad };
}

// --- Mock seam --------------------------------------------------------------

const AMPLIACIONES_MOCK: Ampliacion[] = [
  {
    id: 'amp-1',
    tienda: 'El Bellavista',
    lineas: [linea('ASESOR', 1), linea('SEC/PT', 1), linea('ASESOR', 2), linea('SAS/FT', 1)],
    fecha: '17/04/2026',
    estado: 'PENDIENTE',
  },
  {
    id: 'amp-2',
    tienda: 'El Gran Chimu',
    lineas: [linea('ASESOR', 1), linea('SAS/FT', 2)],
    fecha: '18/04/2026',
    estado: 'PENDIENTE',
  },
  {
    id: 'amp-3',
    tienda: 'El Plaza Norte',
    lineas: [linea('ASESOR', 1), linea('SEC/PT', 1), linea('ASESOR', 2), linea('SAS/FT', 1)],
    fecha: '21/04/2026',
    estado: 'APROBADA',
  },
  {
    id: 'amp-4',
    tienda: 'El Huancayo Centro',
    lineas: [linea('ASESOR', 2), linea('SAS/PT', 1)],
    fecha: '19/04/2026',
    estado: 'APROBADA',
  },
  {
    id: 'amp-5',
    tienda: 'El Trujillo Real',
    lineas: [linea('ASESOR', 1)],
    fecha: '15/04/2026',
    estado: 'RECHAZADA',
  },
];

const TIENDAS_NECESIDAD_MOCK: TiendaNecesidad[] = [
  { id: 'abancay', nombre: 'EL ABANCAY', necesidad: 2, lineas: [linea('ASESOR', 2)] },
  { id: 'emancipacion', nombre: 'EL EMANCIPACION', necesidad: 0, lineas: [] },
  { id: 'granchimu', nombre: 'EL GRAN CHIMU', necesidad: 0, lineas: [] },
  { id: 'huancayo', nombre: 'EL HUANCAYO CENTRO', necesidad: 3, lineas: [linea('ASESOR', 2), linea('SAS/PT', 1)] },
  { id: 'icacentro', nombre: 'EL ICA CENTRO', necesidad: 1, lineas: [linea('SEC/PT', 1)] },
  { id: 'minka', nombre: 'EL MINKA', necesidad: 0, lineas: [] },
];

function datosMock(): AmpliacionesData {
  return {
    ampliaciones: AMPLIACIONES_MOCK.map((a) => ({ ...a, lineas: a.lineas.map((l) => ({ ...l })) })),
    esMock: true,
  };
}

/** Tiendas con necesidad (copias profundas) para la pantalla Nueva Ampliación. */
export function tiendasNecesidadMock(): TiendaNecesidad[] {
  return TIENDAS_NECESIDAD_MOCK.map((t) => ({ ...t, lineas: t.lineas.map((l) => ({ ...l })) }));
}

// --- Carga ------------------------------------------------------------------

/**
 * Carga el historial de ampliaciones. Intenta el backend; si no existe (404 /
 * 5xx / shape) cae al mock. Errores de red o 401 se propagan a la UI.
 */
export async function cargarAmpliaciones(token: string): Promise<AmpliacionesData> {
  try {
    const data = await api.ampliaciones(token);
    if (data && Array.isArray(data.ampliaciones)) {
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

/** Guarda los cambios de edición de una ampliación pendiente. MOCK. */
export async function guardarAmpliacion(input: {
  id: string;
  lineas: LineaAmpliacion[];
}): Promise<{ ref: string }> {
  await new Promise((r) => setTimeout(r, 500));
  return { ref: `AMP-${Date.now().toString(36).toUpperCase()}` };
}

/** Crea solicitudes de ampliación para varias tiendas. MOCK. */
export async function solicitarAmpliaciones(input: {
  tiendas: { idTienda: string; lineas: LineaAmpliacion[] }[];
}): Promise<{ ref: string; total: number }> {
  await new Promise((r) => setTimeout(r, 600));
  const total = input.tiendas.reduce((s, t) => s + t.lineas.reduce((a, l) => a + l.cantidad, 0), 0);
  return { ref: `SOL-${Date.now().toString(36).toUpperCase()}`, total };
}

/** Suma total de personas en un conjunto de líneas. */
export function totalLineas(lineas: LineaAmpliacion[]): number {
  return lineas.reduce((s, l) => s + l.cantidad, 0);
}
