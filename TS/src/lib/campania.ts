import { api } from './api'
import { useAuth } from './auth'

/** Semana de campaña / alta demanda (maes.semana_campania). */
export interface SemanaCampania {
  id: string
  idEmpresa: string
  desde: string
  hasta: string
}

export interface CampaniaFiltro {
  idEmpresa?: string
  anio?: number
}

/** Lista semanas de campaña (CU-MAES-08). */
export function listarCampania(f: CampaniaFiltro = {}): Promise<SemanaCampania[]> {
  const qs = new URLSearchParams()
  if (f.idEmpresa) qs.set('idEmpresa', f.idEmpresa)
  if (f.anio) qs.set('anio', String(f.anio))
  const s = qs.toString()
  return api<SemanaCampania[]>(`/v1/maes/campania/semanas${s ? `?${s}` : ''}`)
}

export interface RangoFechas {
  desde: string
  hasta: string
}

/** Carga manual anticipada de rangos de campaña para una empresa (CU-MAES-08). */
export function cargarCampania(idEmpresa: string, rangos: RangoFechas[]): Promise<void> {
  const idActor = useAuth.getState().usuario?.idUsuario ?? ''
  return api<void>('/v1/maes/campania/semanas', {
    method: 'POST',
    body: JSON.stringify({ idEmpresa, rangos, idActor }),
  })
}

/** Elimina una semana de campaña cargada por error (CU-MAES-08). */
export function eliminarCampania(id: string): Promise<void> {
  const idActor = useAuth.getState().usuario?.idUsuario ?? ''
  return api<void>(`/v1/maes/campania/semanas/${id}?idActor=${idActor}`, { method: 'DELETE' })
}
