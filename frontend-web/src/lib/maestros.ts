import { api } from './api'

// Tipos alineados a maestros-api.yaml (subconjunto Fase 0).

export interface Empresa {
  codigo: string
  nombre: string
  diaInicioSemana: string
  existeCoberturaTipoVenta: boolean
  estado: string
}

export interface Rol {
  codigo: string
  nombre: string
  nivelAutoridad: number
  ambitoPermitido: string
  estado: string
}

export interface Permiso {
  clave: string
  modulo: string
  accion: string
}

export interface Parametro {
  id: string
  clave: string
  modulo: string
  nombreParametro: string
  valor: string
  criticidadConsumo: string
  vigenciaDesde: string
  vigenciaHasta: string | null
}

interface Pagina<T> {
  items: T[]
  page: number
  page_size: number
  total: number
}

export const listarEmpresas = () => api<Empresa[]>('/v1/maes/empresas')
export const listarRoles = () => api<Rol[]>('/v1/maes/roles')
export const listarPermisos = () => api<Permiso[]>('/v1/maes/permisos')
export const listarPermisosDeRol = (idRol: string) =>
  api<Permiso[]>(`/v1/maes/roles/${idRol}/permisos`)
export const listarParametros = () =>
  api<Pagina<Parametro>>('/v1/maes/configuracion/parametros')

export interface CrearParametroBody {
  modulo: string
  flujo?: string | null
  nivel?: string | null
  nombreParametro: string
  ambito: string
  idEmpresa?: string | null
  idAmbito?: string | null
  tipoDato: string
  unidad?: string | null
  valor: string
  esImpactoNegocio: boolean
  criticidadConsumo: string
  justificacion?: string | null
  vigenciaDesde: string
  esCorreccionRetroactiva: boolean
  idActor: string
}

export const crearParametro = (body: CrearParametroBody) =>
  api<Parametro>('/v1/maes/configuracion/parametros', {
    method: 'POST',
    body: JSON.stringify(body),
  })
