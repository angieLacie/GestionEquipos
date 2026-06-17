import { api } from './api'
import { useAuth } from './auth'

export type ModuloNova =
  | 'Rol' | 'Marc' | 'Desc' | 'Enca' | 'Tras' | 'Vac' | 'Asce'
  | 'Aprobaciones' | 'Seguridad' | 'Maestros' | 'Transversal'
export type TipoDato = 'Entero' | 'Decimal' | 'Boolean' | 'Fecha' | 'Hora' | 'Texto' | 'Lista' | 'Rango'
export type Criticidad = 'Bloqueante' | 'Degradable'
export type AmbitoParam = 'Global' | 'Empresa' | 'Zona' | 'Tienda' | 'Puesto'

export const MODULOS: ModuloNova[] = [
  'Rol', 'Marc', 'Desc', 'Enca', 'Tras', 'Vac', 'Asce', 'Aprobaciones', 'Seguridad', 'Maestros', 'Transversal',
]
export const TIPOS_DATO: TipoDato[] = ['Entero', 'Decimal', 'Boolean', 'Fecha', 'Hora', 'Texto', 'Lista', 'Rango']
export const CRITICIDADES: Criticidad[] = ['Bloqueante', 'Degradable']
export const AMBITOS: AmbitoParam[] = ['Global', 'Empresa', 'Zona', 'Tienda', 'Puesto']

/** Fila del listado de parámetros versionados (maes.parametro). */
export interface Parametro {
  id: string
  clave: string
  modulo: ModuloNova
  nombreParametro: string
  valor: string
  criticidadConsumo: Criticidad
  estado: 'Activo' | 'Inactivo'
  vigenciaDesde: string
  vigenciaHasta: string | null
}

interface Pagina<T> {
  items: T[]
  page: number
  page_size: number
  total: number
}

export interface ParametroFiltro {
  modulo?: ModuloNova
  criticidad?: Criticidad
  clave?: string
  pageSize?: number
}

/** Lista parámetros con filtros (CU-MAES-03/04). */
export async function listarParametros(f: ParametroFiltro = {}): Promise<Parametro[]> {
  const qs = new URLSearchParams({ pageSize: String(f.pageSize ?? 500) })
  if (f.modulo) qs.set('modulo', f.modulo)
  if (f.criticidad) qs.set('criticidad', f.criticidad)
  if (f.clave) qs.set('clave', f.clave)
  const p = await api<Pagina<Parametro>>(`/v1/maes/configuracion/parametros?${qs.toString()}`)
  return p.items
}

export interface CrearParametroInput {
  modulo: ModuloNova
  flujo?: string | null
  nivel?: string | null
  nombreParametro: string
  ambito: AmbitoParam
  idEmpresa?: string | null
  idAmbito?: string | null
  tipoDato: TipoDato
  unidad?: string | null
  valor: string
  esImpactoNegocio: boolean
  criticidadConsumo: Criticidad
  justificacion?: string | null
  vigenciaDesde: string
  esCorreccionRetroactiva: boolean
}

/** Crea una nueva versión vigente de un parámetro (CU-MAES-03/04, RN-MAES-09/17). */
export function crearParametro(input: CrearParametroInput): Promise<Parametro> {
  const idActor = useAuth.getState().usuario?.idUsuario ?? ''
  return api<Parametro>('/v1/maes/configuracion/parametros', {
    method: 'POST',
    body: JSON.stringify({
      modulo: input.modulo,
      flujo: input.flujo || null,
      nivel: input.nivel || null,
      nombreParametro: input.nombreParametro,
      ambito: input.ambito,
      idEmpresa: input.idEmpresa || null,
      idAmbito: input.idAmbito || null,
      tipoDato: input.tipoDato,
      unidad: input.unidad || null,
      valor: input.valor,
      esImpactoNegocio: input.esImpactoNegocio,
      criticidadConsumo: input.criticidadConsumo,
      justificacion: input.justificacion || null,
      vigenciaDesde: input.vigenciaDesde,
      esCorreccionRetroactiva: input.esCorreccionRetroactiva,
      idActor,
    }),
  })
}

/** Activa/desactiva una versión de parámetro (no destructivo, RN-MAES). */
export function cambiarEstadoParametro(id: string, estado: 'Activo' | 'Inactivo'): Promise<Parametro> {
  const idActor = useAuth.getState().usuario?.idUsuario ?? ''
  return api<Parametro>(`/v1/maes/configuracion/parametros/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado, idActor }),
  })
}

/**
 * Elimina una versión futura no consumida de un parámetro.
 * El backend responde 204 (ok) o 400 si vigenciaDesde <= hoy (ya vigente/pasada);
 * en ese caso `api` propaga el problem.detail como Error.message.
 */
export async function eliminarParametro(id: string): Promise<void> {
  const idActor = useAuth.getState().usuario?.idUsuario ?? ''
  await api<void>(`/v1/maes/configuracion/parametros/${id}?idActor=${encodeURIComponent(idActor)}`, {
    method: 'DELETE',
  })
}
