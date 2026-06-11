import { api } from './api'
import type { Cargo, Cuota, FilaRol, Zona } from '@/views/rol/data'

/** Fila del roster de empleados (maes.vw_EmpleadoRoster, fuente RMS BD_RETAIL). */
export interface EmpleadoRoster {
  codigo: string
  nombreCompleto: string
  puestoCod: string | null
  puestoDesc: string | null
  esSenior: boolean
  tiendaCod: string | null
  tienda: string | null
  zonaCod: number | null
  zona: string | null
  empresaCod: string | null
  empresa: string | null
}

interface Pagina<T> {
  items: T[]
  page: number
  page_size: number
  total: number
}

export interface RosterFiltro {
  empresa?: string
  zona?: string
  tienda?: string
  soloSenior?: boolean
  busqueda?: string
  pageSize?: number
}

export function listarRoster(f: RosterFiltro = {}): Promise<Pagina<EmpleadoRoster>> {
  const qs = new URLSearchParams()
  if (f.empresa) qs.set('empresa', f.empresa)
  if (f.zona) qs.set('zona', f.zona)
  if (f.tienda) qs.set('tienda', f.tienda)
  if (f.soloSenior != null) qs.set('soloSenior', String(f.soloSenior))
  if (f.busqueda) qs.set('busqueda', f.busqueda)
  if (f.pageSize) qs.set('pageSize', String(f.pageSize))
  const s = qs.toString()
  return api<Pagina<EmpleadoRoster>>(`/v1/maes/empleados/roster${s ? `?${s}` : ''}`)
}

// Categoría canónica del rol (vocabulario PuestoRol del backend).
export type CategoriaRol = 'Seniors' | 'GtAsesores' | 'Secretarias' | 'Auxiliares' | 'Sastres'

/** Traduce la categoría canónica del parámetro al Cargo (css) que usa la grilla. */
const CATEGORIA_A_CARGO: Record<CategoriaRol, Cargo> = {
  Seniors: 'senior',
  GtAsesores: 'gte-asesor',
  Secretarias: 'secretarias',
  Auxiliares: 'auxiliares',
  Sastres: 'sastres',
}

/** Mapa puesto→categoría leído del parámetro ROL_MAPEO_PUESTO_CATEGORIA (Maestros). */
export type MapaPuestoCategoria = Map<string, CategoriaRol>

export async function obtenerMapaPuestoCategoria(): Promise<MapaPuestoCategoria> {
  const hoy = new Date().toISOString().slice(0, 10)
  const p = await api<{ valor: string }>(
    `/v1/maes/configuracion/parametros/lookup?clave=ROL_MAPEO_PUESTO_CATEGORIA&fecha=${hoy}`,
  )
  const lista = JSON.parse(p.valor) as { puesto: string; categoria: CategoriaRol }[]
  return new Map(lista.map((x) => [x.puesto.toUpperCase(), x.categoria]))
}

/** Resuelve el Cargo (css) de un puesto vía el mapa de parámetros. Fallback gte-asesor. */
function puestoACargo(desc: string | null, mapa: MapaPuestoCategoria): Cargo {
  const cat = mapa.get((desc ?? '').toUpperCase())
  return cat ? CATEGORIA_A_CARGO[cat] : 'gte-asesor'
}

const cuotaCero: Cuota = {
  asesorMay: 0, asesorJun: 0, seniorMay: 0, seniorJun: 0,
  asesoria: 0, tesoro: 0, sem3: 0, sem2: 0, ultima: 0,
}

/** Agrupa el roster plano en la estructura Zona → Tienda → Fila del calendario. */
export function rosterAZonas(items: EmpleadoRoster[], mapa: MapaPuestoCategoria): Zona[] {
  const zMap = new Map<string, Map<string, FilaRol[]>>()
  for (const e of items) {
    const zona = e.zona ?? 'SIN ZONA'
    const tienda = e.tienda ?? 'SIN TIENDA'
    if (!zMap.has(zona)) zMap.set(zona, new Map())
    const tMap = zMap.get(zona)!
    if (!tMap.has(tienda)) tMap.set(tienda, [])
    tMap.get(tienda)!.push({
      puesto: e.esSenior ? `${e.puestoDesc ?? '—'} SENIOR` : (e.puestoDesc ?? '—'),
      cargo: e.esSenior ? 'senior' : puestoACargo(e.puestoDesc, mapa),
      trabajador: e.nombreCompleto,
      cuota: { ...cuotaCero },
      celdas: Array.from({ length: 7 }, () => null),
    })
  }
  return [...zMap.entries()].map(([nombre, tiendas]) => ({
    nombre,
    personas: [...tiendas.values()].reduce((s, arr) => s + arr.length, 0),
    tiendas: [...tiendas.entries()].map(([nombre, filas]) => ({ nombre, filas })),
  }))
}
