import { api } from './api'

export type AccionConfig =
  | 'Alta' | 'Modificacion' | 'Desactivacion' | 'CambioVigencia' | 'CorreccionRetroactiva'

export const ACCIONES: AccionConfig[] = [
  'Alta', 'Modificacion', 'Desactivacion', 'CambioVigencia', 'CorreccionRetroactiva',
]

/** Etiqueta legible de cada acción. */
export const ACCION_LABEL: Record<AccionConfig, string> = {
  Alta: 'Alta',
  Modificacion: 'Modificación',
  Desactivacion: 'Baja',
  CambioVigencia: 'Cambio vigencia',
  CorreccionRetroactiva: 'Corrección',
}

/** Registro del log append-only de cambios de configuración (CU-MAES-07). */
export interface Auditoria {
  id: string
  accion: AccionConfig
  elemento: string
  valorAnterior: string | null
  valorNuevo: string | null
  vigenciaDesde: string | null
  usuario: string | null
  justificacion: string | null
  fechaHora: string
}

interface Pagina<T> {
  items: T[]
  page: number
  page_size: number
  total: number
}

export interface AuditoriaFiltro {
  elemento?: string
  accion?: AccionConfig
  desde?: string
  hasta?: string
  pageSize?: number
}

/** Lista el historial de cambios de configuración (CU-MAES-07). */
export async function listarAuditoria(f: AuditoriaFiltro = {}): Promise<Auditoria[]> {
  const qs = new URLSearchParams({ pageSize: String(f.pageSize ?? 500) })
  if (f.elemento) qs.set('elemento', f.elemento)
  if (f.accion) qs.set('accion', f.accion)
  if (f.desde) qs.set('desde', f.desde)
  if (f.hasta) qs.set('hasta', f.hasta)
  const p = await api<Pagina<Auditoria>>(`/v1/maes/configuracion/auditoria?${qs.toString()}`)
  return p.items
}
