import { api } from './api'

export type EstadoRol =
  | 'EnEdicion' | 'PendienteEnvio' | 'EnviadoGG' | 'RechazadoGG' | 'AprobadoGG'
  | 'ProgramadoGT' | 'VersionEnRevision' | 'Vigente' | 'Historico'
  | 'Bloqueado' | 'BloqueadoDefinitivo' | 'BloqueadoGT' | 'BloqueadoDefinitivoGT'

export type PuestoRol = 'Seniors' | 'GtAsesores' | 'Secretarias' | 'Auxiliares' | 'Sastres'

export type EstadoCelda =
  | 'Vacio' | 'DescansoLaboral' | 'CoberturaTienda'
  | 'CompensacionFeriadoLaborado' | 'CompensacionDescansoNoGozado' | 'CoberturaTipoVenta'

export interface RolSemanal {
  id: string
  empresa: string
  zonaId: string
  tiendaId: string | null
  anio: number
  numeroSemana: number
  fechaInicio: string
  fechaFin: string
  puesto: PuestoRol
  estado: EstadoRol
  version: number
}

export interface Celda {
  id: string
  colaboradorId: string
  fecha: string
  estado: EstadoCelda
  tiendaCoberturaId: string | null
  tipoVenta: string | null
}

interface Pagina<T> {
  items: T[]
  page: number
  page_size: number
  total: number
}

export const listarRolesSemanales = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString()
  return api<Pagina<RolSemanal>>(`/v1/rol/roles${qs ? `?${qs}` : ''}`)
}

export const obtenerRol = (id: string) =>
  api<{ rol: RolSemanal; dias: Celda[] }>(`/v1/rol/roles/${id}`)

export interface CrearRolBody {
  empresa: string
  zonaId: string
  tiendaId?: string | null
  anio: number
  numeroSemana: number
  fechaInicio: string
  puesto: PuestoRol
  creadoPor: string
}
export const crearRol = (body: CrearRolBody) =>
  api<RolSemanal>('/v1/rol/roles', { method: 'POST', body: JSON.stringify(body) })

export interface ProgramarCeldaBody {
  colaboradorId: string
  fecha: string
  estado: EstadoCelda
  registradoPor: string
  tiendaCoberturaId?: string | null
  tipoVenta?: string | null
  conceptoCompensacionId?: string | null
}
export const programarCelda = (idRol: string, body: ProgramarCeldaBody) =>
  api<Celda>(`/v1/rol/roles/${idRol}/celdas`, { method: 'PUT', body: JSON.stringify(body) })

export const enviarRol = (idRol: string, gzId: string) =>
  api<RolSemanal>(`/v1/rol/roles/${idRol}/enviar`, { method: 'POST', body: JSON.stringify({ gzId }) })
export const aprobarRol = (idRol: string, ggId: string) =>
  api<RolSemanal>(`/v1/rol/roles/${idRol}/aprobar`, { method: 'POST', body: JSON.stringify({ ggId }) })
export const rechazarRol = (idRol: string, ggId: string, comentario: string) =>
  api<RolSemanal>(`/v1/rol/roles/${idRol}/rechazar`, { method: 'POST', body: JSON.stringify({ ggId, comentario }) })
export const programarGt = (idRol: string, gtId: string) =>
  api<RolSemanal>(`/v1/rol/roles/${idRol}/programar-gt`, { method: 'POST', body: JSON.stringify({ gtId }) })
