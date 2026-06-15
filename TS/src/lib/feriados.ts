import { api } from './api'
import { useAuth } from './auth'

/** Empresa del grupo (maes.empresa). Clave natural = código (CADENA, LUKERS). */
export interface Empresa {
  codigo: string
  nombre: string
  diaInicioSemana: string
  existeCoberturaTipoVenta: boolean
  estado: string
}

/** Zona comercial de una empresa (maes.zona). */
export interface Zona {
  id: string
  nombre: string
  idEmpresa: string
  estado: string
}

/** Tienda del maestro (maes.tienda). */
export interface Tienda {
  id: string
  codigo: string
  nombre: string
  idEmpresa: string
  idZona: string | null
  estadoOperativo: string
}

interface Pagina<T> {
  items: T[]
  page: number
  page_size: number
  total: number
}

export type AlcanceFeriado = 'Nacional' | 'Local'
export type OrigenFeriado = 'RegionalOficial' | 'ManualAdm'
export type TipoAmbitoFeriado = 'Zona' | 'Tienda'

/** Ámbito local de un feriado (zona o tienda). */
export interface AmbitoFeriado {
  tipoAmbito: TipoAmbitoFeriado
  idAmbito: string
}

/** Feriado del calendario maestro (maes.feriado). */
export interface Feriado {
  id: string
  fecha: string
  descripcion: string
  alcance: AlcanceFeriado
  origen: OrigenFeriado
  /** CSV de códigos de empresa (CADENA,LUKERS). */
  empresasAplicables: string
  compensable: boolean
  vigenciaDesde: string
  vigenciaHasta: string | null
  ambitos: AmbitoFeriado[]
}

export interface FeriadoFiltro {
  idEmpresa?: string
  anio?: number
  alcance?: AlcanceFeriado
}

/** Lista feriados del calendario maestro (CU-MAES-01). */
export function listarFeriados(f: FeriadoFiltro = {}): Promise<Feriado[]> {
  const qs = new URLSearchParams()
  if (f.idEmpresa) qs.set('idEmpresa', f.idEmpresa)
  if (f.anio) qs.set('anio', String(f.anio))
  if (f.alcance) qs.set('alcance', f.alcance)
  const s = qs.toString()
  return api<Feriado[]>(`/v1/maes/feriados${s ? `?${s}` : ''}`)
}

export interface CrearFeriadoInput {
  fecha: string
  descripcion: string
  alcance: AlcanceFeriado
  empresasAplicables: string[]
  compensable: boolean
  vigenciaDesde: string
  ambitos?: AmbitoFeriado[]
}

/** Alta manual de un feriado (CU-MAES-01, origen MANUAL_ADM). */
export function crearFeriado(input: CrearFeriadoInput): Promise<Feriado> {
  const idActor = useAuth.getState().usuario?.idUsuario ?? ''
  return api<Feriado>('/v1/maes/feriados', {
    method: 'POST',
    body: JSON.stringify({
      fecha: input.fecha,
      descripcion: input.descripcion,
      alcance: input.alcance,
      empresasAplicables: input.empresasAplicables,
      compensable: input.compensable,
      vigenciaDesde: input.vigenciaDesde,
      ambitos: input.alcance === 'Local' ? (input.ambitos ?? []) : null,
      idActor,
    }),
  })
}

/** Corrige un feriado de carga manual (CU-MAES-01). */
export function editarFeriado(id: string, input: CrearFeriadoInput): Promise<Feriado> {
  const idActor = useAuth.getState().usuario?.idUsuario ?? ''
  return api<Feriado>(`/v1/maes/feriados/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      fecha: input.fecha,
      descripcion: input.descripcion,
      alcance: input.alcance,
      empresasAplicables: input.empresasAplicables,
      compensable: input.compensable,
      vigenciaDesde: input.vigenciaDesde,
      ambitos: input.alcance === 'Local' ? (input.ambitos ?? []) : null,
      idActor,
    }),
  })
}

/** Elimina un feriado cargado por error (CU-MAES-01). Solo feriados manuales. */
export function eliminarFeriado(id: string): Promise<void> {
  const idActor = useAuth.getState().usuario?.idUsuario ?? ''
  return api<void>(`/v1/maes/feriados/${id}?idActor=${idActor}`, { method: 'DELETE' })
}

/** Catálogo de empresas del grupo. */
export function listarEmpresas(): Promise<Empresa[]> {
  return api<Empresa[]>('/v1/maes/empresas')
}

/** Zonas de una empresa (para ámbito local). */
export function listarZonas(idEmpresa?: string): Promise<Zona[]> {
  const s = idEmpresa ? `?idEmpresa=${idEmpresa}` : ''
  return api<Zona[]>(`/v1/maes/zonas${s}`)
}

/** Tiendas de una empresa (para ámbito local). */
export async function listarTiendas(idEmpresa?: string): Promise<Tienda[]> {
  const qs = new URLSearchParams({ pageSize: '500' })
  if (idEmpresa) qs.set('idEmpresa', idEmpresa)
  const p = await api<Pagina<Tienda>>(`/v1/maes/tiendas?${qs.toString()}`)
  return p.items
}
