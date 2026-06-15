// ⚠️ DATOS MOCK — programaciones de encargatura (cobertura en tienda).
// No hay módulo Enca en backend; mantener la firma para enchufar la fuente real luego.

export type TipoCobertura = 'Tienda' | 'Asesoria' | 'Tesoro'
export type EstadoEncargatura = 'Programado' | 'Ejecucion' | 'Culminado' | 'Anulado'

export interface Encargatura {
  id: number
  empresa: string
  tienda: string
  codigo: string
  personal: string
  tipoCobertura: TipoCobertura
  fechaInicio: string // YYYY-MM-DD
  fechaFin: string
  estado: EstadoEncargatura
  observaciones: string | null
  fechaCreacion: string // YYYY-MM-DD HH:mm:ss
  creadoPor: string
  fechaModificacion: string
  modificadoPor: string
}

const MOCK: Encargatura[] = [
  { id: 1, empresa: 'EL', tienda: 'EL TACNA', codigo: '74750419', personal: 'RAMOS MARTINEZ, ELMER JHON', tipoCobertura: 'Tienda', fechaInicio: '2026-05-07', fechaFin: '2026-05-10', estado: 'Programado', observaciones: null, fechaCreacion: '2026-05-06 08:30:00', creadoPor: '10643071', fechaModificacion: '2026-05-06 08:30:00', modificadoPor: '10643071' },
  { id: 2, empresa: 'ADAMS', tienda: 'ADAMS MEGAPLAZA', codigo: '09757494', personal: 'GOMEZ LOPEZ, ROSA ESTER', tipoCobertura: 'Tienda', fechaInicio: '2026-05-08', fechaFin: '2026-05-08', estado: 'Programado', observaciones: null, fechaCreacion: '2026-05-07 13:23:02', creadoPor: '72645532', fechaModificacion: '2026-05-07 13:23:02', modificadoPor: '72645532' },
  { id: 3, empresa: 'EL', tienda: 'EL LARCO', codigo: '46435174', personal: 'CHIRA SOTIL, MAYRA CARLA', tipoCobertura: 'Tienda', fechaInicio: '2026-05-05', fechaFin: '2026-05-05', estado: 'Culminado', observaciones: 'Aprobado por GV', fechaCreacion: '2026-05-04 12:48:43', creadoPor: '72645532', fechaModificacion: '2026-05-04 12:48:43', modificadoPor: '72645532' },
  { id: 4, empresa: 'LUKERS', tienda: 'LUKERS EL SOL', codigo: '08082949', personal: 'MENDEZ PEÑA, CARLOS LENIN', tipoCobertura: 'Asesoria', fechaInicio: '2026-05-07', fechaFin: '2026-05-07', estado: 'Anulado', observaciones: null, fechaCreacion: '2026-05-06 16:50:20', creadoPor: '10643071', fechaModificacion: '2026-05-06 17:40:39', modificadoPor: '10643071' },
  { id: 5, empresa: 'EL', tienda: 'LUKERS MENDIOLA', codigo: '10066342', personal: 'HUAPAYA RUIZ, HUGO SANDRO', tipoCobertura: 'Tesoro', fechaInicio: '2026-05-06', fechaFin: '2026-05-08', estado: 'Ejecucion', observaciones: null, fechaCreacion: '2026-05-03 09:50:54', creadoPor: '10643071', fechaModificacion: '2026-05-03 09:50:54', modificadoPor: '10643071' },
]

export interface EncargaturaFiltro {
  empresa?: string
  tienda?: string
  tipo?: TipoCobertura
  estado?: EstadoEncargatura
}

/** Lista programaciones de encargatura (MOCK; simula latencia). */
export function listarEncargaturas(f: EncargaturaFiltro = {}): Promise<Encargatura[]> {
  const items = MOCK.filter((e) =>
    (!f.empresa || e.empresa === f.empresa) &&
    (!f.tienda || e.tienda === f.tienda) &&
    (!f.tipo || e.tipoCobertura === f.tipo) &&
    (!f.estado || e.estado === f.estado),
  )
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(items)), 150))
}

export const empresasMock = [...new Set(MOCK.map((e) => e.empresa))].sort()
export const tiendasMock = [...new Set(MOCK.map((e) => e.tienda))].sort()

// ── Semanas (domingo-sábado) para el selector de Nueva Programación ──────────

export interface Semana {
  num: number
  desde: string // YYYY-MM-DD
  hasta: string
  label: string
}

const MESES_ABR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const iso = (d: Date) => d.toISOString().slice(0, 10)
const fmtDia = (d: Date) => `${d.getUTCDate()} ${MESES_ABR[d.getUTCMonth()]}`

/** Genera semanas domingo-sábado alrededor de hoy. Ancla: Sem 24 = domingo 14 Jun 2026. */
export function generarSemanas(): Semana[] {
  const anclaDomingo = Date.UTC(2026, 5, 14) // 14 Jun 2026 (domingo) = Sem 24
  const anclaNum = 24
  const out: Semana[] = []
  for (let k = -4; k <= 8; k++) {
    const desde = new Date(anclaDomingo + k * 7 * 86400000)
    const hasta = new Date(desde.getTime() + 6 * 86400000)
    const num = anclaNum + k
    out.push({
      num,
      desde: iso(desde),
      hasta: iso(hasta),
      label: `Sem ${num} — ${fmtDia(desde)} al ${fmtDia(hasta)} ${hasta.getUTCFullYear()}`,
    })
  }
  return out
}
