import { api } from './api'
import { useAuth } from './auth'

export type UbicacionTienda = 'Cc' | 'Pc'
export type EstadoTienda = 'Activa' | 'Suspendida' | 'Cerrada'

/** Tienda del maestro (maes.tienda). Base RMS + enriquecimiento Nova (ubicación/zona/estado). */
export interface Tienda {
  id: string
  codigo: string
  nombre: string
  idEmpresa: string
  idZona: string | null
  ubicacion: UbicacionTienda | null
  /** Solo lectura — fuente RMS (RN-MAES-05). */
  dotacionMinimaAsesores: number
  estadoOperativo: EstadoTienda
  origen: string
  rmsSyncAt: string | null
}

interface Pagina<T> {
  items: T[]
  page: number
  page_size: number
  total: number
}

export interface TiendaFiltro {
  idEmpresa?: string
  idZona?: string
  estadoOperativo?: EstadoTienda
  pageSize?: number
}

/** Lista tiendas del maestro (CU-MAES-02). */
export async function listarTiendas(f: TiendaFiltro = {}): Promise<Tienda[]> {
  const qs = new URLSearchParams({ pageSize: String(f.pageSize ?? 500) })
  if (f.idEmpresa) qs.set('idEmpresa', f.idEmpresa)
  if (f.idZona) qs.set('idZona', f.idZona)
  if (f.estadoOperativo) qs.set('estadoOperativo', f.estadoOperativo)
  const p = await api<Pagina<Tienda>>(`/v1/maes/tiendas?${qs.toString()}`)
  return p.items
}

export interface EditarTiendaInput {
  ubicacion: UbicacionTienda
  /** Opcional: si se omite, conserva la zona actual de la tienda. */
  idZona?: string
  estadoOperativo: EstadoTienda
}

/** Edita SOLO atributos operativos Nova (ubicación CC/PC, zona, estado). Dotación es RMS (RN-MAES-05). */
export function editarTienda(id: string, input: EditarTiendaInput): Promise<void> {
  const idActor = useAuth.getState().usuario?.idUsuario ?? ''
  return api<void>(`/v1/maes/tiendas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      ubicacion: input.ubicacion,
      idZona: input.idZona || null,
      estadoOperativo: input.estadoOperativo,
      idActor,
    }),
  })
}
