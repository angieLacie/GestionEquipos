// ⚠️ DATOS MOCK — solicitudes de Ascenso a Senior (prototipo).
// No hay módulo Asce en backend; mantener la firma para enchufar la fuente real luego.

export type EstadoAscenso = 'Pendiente' | 'Aprobada' | 'Rechazada'

/** Solicitud de ascenso de un asesor a senior. */
export interface Ascenso {
  id: number
  empleado: string
  tienda: string
  puesto: string
  /** Quién promueve / solicita (ej. "Administración de Ventas (AV)"). */
  promotor: string
  /** true si la originó el mismo aprobador (autosolicitud → exige segregación). */
  autosolicitud: boolean
  zona: string
  estado: EstadoAscenso
}

const MOCK: Ascenso[] = [
  { id: 1, empleado: 'Ramos Martínez, Elmer Jhon', tienda: 'EL TACNA', puesto: 'Asesor', promotor: 'Administración de Ventas (AV)', autosolicitud: false, zona: 'Lima Sur', estado: 'Pendiente' },
  { id: 2, empleado: 'Chira Sotil, Mayra Carla', tienda: 'EL LARCO', puesto: 'Asesor', promotor: 'Administración de Ventas (AV)', autosolicitud: false, zona: 'Lima Centro', estado: 'Pendiente' },
  { id: 3, empleado: 'Huapaya Ruiz, Hugo Sandro', tienda: 'LUKERS MENDIOLA', puesto: 'Asesor', promotor: 'Gerencia General (autosolicitud)', autosolicitud: true, zona: 'Lima Norte', estado: 'Pendiente' },
  { id: 4, empleado: 'Flores Quispe, Ana Lucía', tienda: 'JOCKEY PLAZA', puesto: 'Asesor', promotor: 'Administración de Ventas (AV)', autosolicitud: false, zona: 'Lima Centro', estado: 'Aprobada' },
  { id: 5, empleado: 'Cárdenas Soto, Brando', tienda: 'MEGA PLAZA', puesto: 'Asesor', promotor: 'Administración de Ventas (AV)', autosolicitud: false, zona: 'Lima Norte', estado: 'Rechazada' },
]

/** Carga inicial de solicitudes (MOCK; simula latencia). */
export function listarAscensos(): Promise<Ascenso[]> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(MOCK)), 150))
}

/** Indicadores de cumplimiento de los últimos 6 meses (MOCK). */
export interface Cumplimiento {
  metaVentasPct: number
  asistenciaPct: number
  evaluacionPromedio: number
  mesesEnPuesto: number
}

export function cumplimientoMock(id: number): Cumplimiento {
  const base = 70 + (id * 7) % 28
  return {
    metaVentasPct: base + 5,
    asistenciaPct: 90 + (id * 3) % 10,
    evaluacionPromedio: Math.round((3.5 + (id % 3) * 0.4) * 10) / 10,
    mesesEnPuesto: 8 + (id * 2) % 16,
  }
}

export const zonasMock = [...new Set(MOCK.map((a) => a.zona))].sort()
export const tiendasMock = [...new Set(MOCK.map((a) => a.tienda))].sort()

// ── Registro de ascenso: candidatos + panel de cumplimiento 6 meses ──────────

/** Asesor candidato a ascenso (para el selector del registro). */
export interface CandidatoAscenso {
  id: number
  nombre: string
  tienda: string
  puesto: string
  zona: string
}

export const candidatosMock: CandidatoAscenso[] = [
  { id: 1, nombre: 'Ana Torres', tienda: 'Plaza Norte', puesto: 'Asesor Senior', zona: 'Lima Norte' },
  { id: 2, nombre: 'Luis Pérez', tienda: 'Mega Plaza', puesto: 'Asesor', zona: 'Lima Norte' },
  { id: 3, nombre: 'Diana Rojas', tienda: 'Jockey Plaza', puesto: 'Asesor', zona: 'Lima Centro' },
  { id: 4, nombre: 'Marco Díaz', tienda: 'San Borja', puesto: 'Asesor', zona: 'Lima Sur' },
]

/** Un mes del panel de cumplimiento. `senior` null = sin historial como senior aún. */
export interface MesCumplimiento {
  mes: string
  cuotaAsesor: number
  senior: number | null
}

const MESES_PANEL = ['Dic 2025', 'Ene 2026', 'Feb 2026', 'Mar 2026', 'Abr 2026', 'May 2026']

/** Snapshot de cumplimiento de los últimos 6 meses del candidato (MOCK). */
export function cumplimientoSerie(candidatoId: number): MesCumplimiento[] {
  const baseCuota = [96.5, 101.2, 88.0, 104.8, 110.3, 97.6]
  const baseSenior: (number | null)[] = [null, null, null, 99.1, 102.4, 95.0]
  const shift = (candidatoId - 1) * 1.6
  const r = (n: number) => Math.round(n * 10) / 10
  return MESES_PANEL.map((mes, i) => ({
    mes,
    cuotaAsesor: r(baseCuota[i] + (candidatoId > 1 ? (i - 2.5) * 0.4 + shift * 0.3 : 0)),
    senior: baseSenior[i] == null ? null : r(baseSenior[i] + (candidatoId > 1 ? shift * 0.2 : 0)),
  }))
}
