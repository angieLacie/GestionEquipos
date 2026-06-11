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

/** Mapea la descripción de puesto RMS a la categoría de cargo del rol. */
export function puestoACargo(desc: string | null): Cargo {
  const d = (desc ?? '').toUpperCase()
  if (d.includes('SENIOR')) return 'senior'
  if (d.includes('SECRETARIA') || d.includes('CAJER')) return 'secretarias'
  if (d.includes('SASTRE')) return 'sastres'
  if (d.includes('AUXILIAR')) return 'auxiliares'
  // ASESOR, GERENTE y resto → asesores/gerentes
  return 'gte-asesor'
}

const cuotaCero: Cuota = {
  asesorMay: 0, asesorJun: 0, seniorMay: 0, seniorJun: 0,
  asesoria: 0, tesoro: 0, sem3: 0, sem2: 0, ultima: 0,
}

/** Agrupa el roster plano en la estructura Zona → Tienda → Fila del calendario. */
export function rosterAZonas(items: EmpleadoRoster[]): Zona[] {
  const zMap = new Map<string, Map<string, FilaRol[]>>()
  for (const e of items) {
    const zona = e.zona ?? 'SIN ZONA'
    const tienda = e.tienda ?? 'SIN TIENDA'
    if (!zMap.has(zona)) zMap.set(zona, new Map())
    const tMap = zMap.get(zona)!
    if (!tMap.has(tienda)) tMap.set(tienda, [])
    tMap.get(tienda)!.push({
      puesto: e.puestoDesc ?? '—',
      cargo: puestoACargo(e.puestoDesc),
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
