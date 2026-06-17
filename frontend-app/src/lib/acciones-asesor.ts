/**
 * Acciones por asesor (MOCK).
 *
 * Estas funciones simulan el registro de acciones sobre un asesor:
 * Marcar Senior, Traslado y Convenio de Encargatura. HOY no existe backend
 * para estos módulos, así que devuelven un resultado de éxito tras un delay
 * simulado. El día de mañana se reemplaza el cuerpo por la llamada real.
 *
 * // TODO: conectar a backend (módulos Encargatura/Traslados/Ascenso aún no existen)
 */

export type TipoVenta = 'ASESORIA' | 'TESORO' | 'COBERTURA' | 'OTROS';
export type TipoConvenio = 'ENCARGATURA' | 'SUPLENCIA';

export interface ResultadoAccion {
  ok: boolean;
  /** Identificador ficticio del registro creado (para feedback de demo). */
  ref: string;
}

/** Etiquetas legibles de los tipos de venta para los selects. */
export const TIPOS_VENTA: { value: TipoVenta; label: string }[] = [
  { value: 'ASESORIA', label: 'Asesoría' },
  { value: 'TESORO', label: 'Tesoro' },
  { value: 'COBERTURA', label: 'Cobertura' },
  { value: 'OTROS', label: 'Otros' },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function refDemo(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36).toUpperCase()}`;
}

export interface MarcarSeniorInput {
  idAsesor: string;
  idTienda: string;
  tipoVenta: TipoVenta;
  desde: string; // dd/mm/aaaa
  hasta: string; // dd/mm/aaaa
}

/** MOCK: marca a un asesor como Senior en una tienda y rango de fechas. */
export async function marcarSenior(input: MarcarSeniorInput): Promise<ResultadoAccion> {
  // TODO: conectar a backend (módulo Ascenso/Senior aún no existe)
  await delay(700);
  return { ok: true, ref: refDemo('SR') };
}

export interface TrasladoInput {
  idAsesor: string;
  idTiendaDestino: string;
  desde: string;
  hasta: string;
}

/** MOCK: traslada a un asesor a una tienda destino por un rango de fechas. */
export async function trasladar(input: TrasladoInput): Promise<ResultadoAccion> {
  // TODO: conectar a backend (módulo Traslados aún no existe)
  await delay(700);
  return { ok: true, ref: refDemo('TR') };
}

export interface ConvenioEncargaturaInput {
  idAsesor: string;
  tipoConvenio: TipoConvenio;
  idTienda: string;
  fechaInicio: string;
}

/** MOCK: crea un convenio de encargatura/suplencia para un asesor. */
export async function crearConvenioEncargatura(
  input: ConvenioEncargaturaInput,
): Promise<ResultadoAccion> {
  // TODO: conectar a backend (módulo Encargatura aún no existe)
  await delay(700);
  return { ok: true, ref: refDemo('EN') };
}
