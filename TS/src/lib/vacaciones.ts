// ⚠️ DATOS MOCK — programación anual de vacaciones (períodos de descanso remunerado).
// No hay módulo Vac en backend; mantener la firma para enchufar la fuente real luego.

export type EstadoVacacion = 'Programada' | 'EnCurso' | 'Pendiente' | 'Aprobada' | 'Anulada'
export type NivelMes = 'normal' | 'warning' | 'urgente'

export interface ProgramacionVac {
  id: number
  fechaInicio: string // YYYY-MM-DD
  fechaFin: string
  dias: number
  anio: number
  estado: EstadoVacacion
  programadoPor: string
  observaciones: string | null
}

export interface MesObligatorio {
  label: string
  nivel: NivelMes
}

export interface EmpleadoVac {
  id: number
  nombre: string
  puesto: string
  zona: string
  tienda: string
  mesObligatorio: MesObligatorio | null
  programaciones: ProgramacionVac[]
}

let SEQ = 100

const MOCK: EmpleadoVac[] = [
  { id: 1, nombre: 'Marco Ríos', puesto: 'Asesor', zona: 'Lima Centro', tienda: 'C.C. El Polo', mesObligatorio: { label: 'Nov 2026', nivel: 'normal' }, programaciones: [
    { id: SEQ++, fechaInicio: '2026-07-14', fechaFin: '2026-07-28', dias: 15, anio: 2026, estado: 'Programada', programadoPor: 'Carlos Mendoza', observaciones: null },
  ] },
  { id: 2, nombre: 'Nadia Rivas', puesto: 'Auxiliar de Almacén', zona: 'Lima Centro', tienda: 'C.C. El Polo', mesObligatorio: null, programaciones: [] },
  { id: 3, nombre: 'Valeria Castillo', puesto: 'Asesor Senior', zona: 'Lima Centro', tienda: 'C.C. El Polo', mesObligatorio: { label: 'May 2026', nivel: 'warning' }, programaciones: [
    { id: SEQ++, fechaInicio: '2026-08-03', fechaFin: '2026-08-17', dias: 15, anio: 2026, estado: 'Programada', programadoPor: 'Carlos Mendoza', observaciones: null },
  ] },
  { id: 4, nombre: 'Carlos Gómez', puesto: 'Asesor', zona: 'Lima Centro', tienda: 'Jockey Plaza', mesObligatorio: { label: 'Jul 2026', nivel: 'urgente' }, programaciones: [
    { id: SEQ++, fechaInicio: '2026-07-20', fechaFin: '2026-08-03', dias: 15, anio: 2026, estado: 'Programada', programadoPor: 'Rosa Ester', observaciones: null },
  ] },
  { id: 5, nombre: 'Carlos Mendoza', puesto: 'Asesor Senior', zona: 'Lima Centro', tienda: 'Jockey Plaza', mesObligatorio: null, programaciones: [] },
  { id: 6, nombre: 'Cristian Monteagudo', puesto: 'Asesor Senior', zona: 'Lima Centro', tienda: 'Jockey Plaza', mesObligatorio: { label: 'Jul 2026', nivel: 'urgente' }, programaciones: [
    { id: SEQ++, fechaInicio: '2026-06-10', fechaFin: '2026-06-24', dias: 15, anio: 2026, estado: 'EnCurso', programadoPor: 'Rosa Ester', observaciones: null },
  ] },
  { id: 7, nombre: 'Fernando Castro', puesto: 'Gerente de Tienda', zona: 'Lima Centro', tienda: 'Jockey Plaza', mesObligatorio: { label: 'Jun 2026', nivel: 'urgente' }, programaciones: [] },
  { id: 8, nombre: 'Karina Bravo', puesto: 'Secretaria Senior', zona: 'Lima Centro', tienda: 'Jockey Plaza', mesObligatorio: null, programaciones: [] },
  { id: 9, nombre: 'Elsa Núñez', puesto: 'Secretaria', zona: 'Lima Norte', tienda: 'Mega Plaza', mesObligatorio: null, programaciones: [] },
  { id: 10, nombre: 'Gabriel Suarez', puesto: 'Encargado', zona: 'Lima Norte', tienda: 'Mega Plaza', mesObligatorio: { label: 'Ago 2026', nivel: 'normal' }, programaciones: [] },
  { id: 11, nombre: 'Luis Quispe', puesto: 'Asesor Senior', zona: 'Lima Norte', tienda: 'Mega Plaza', mesObligatorio: null, programaciones: [] },
  { id: 12, nombre: 'Pedro Sánchez', puesto: 'Encargado', zona: 'Lima Norte', tienda: 'Mega Plaza', mesObligatorio: { label: 'Jun 2026', nivel: 'urgente' }, programaciones: [
    { id: SEQ++, fechaInicio: '2026-06-12', fechaFin: '2026-06-26', dias: 15, anio: 2026, estado: 'EnCurso', programadoPor: 'Luis Quispe', observaciones: null },
  ] },
  { id: 13, nombre: 'Ana García', puesto: 'Asesor Senior', zona: 'Lima Norte', tienda: 'Plaza Norte', mesObligatorio: null, programaciones: [] },
  { id: 14, nombre: 'Ana Torres', puesto: 'Asesor Senior', zona: 'Lima Norte', tienda: 'Plaza Norte', mesObligatorio: { label: 'Jun 2026', nivel: 'urgente' }, programaciones: [
    { id: SEQ++, fechaInicio: '2026-06-22', fechaFin: '2026-07-06', dias: 15, anio: 2026, estado: 'Programada', programadoPor: 'Luis Quispe', observaciones: null },
  ] },
  { id: 15, nombre: 'Jorge Ruiz', puesto: 'Asesor', zona: 'Lima Norte', tienda: 'Plaza Norte', mesObligatorio: { label: 'Ago 2026', nivel: 'normal' }, programaciones: [
    { id: SEQ++, fechaInicio: '2026-08-10', fechaFin: '2026-08-24', dias: 15, anio: 2026, estado: 'Programada', programadoPor: 'Luis Quispe', observaciones: null },
    { id: SEQ++, fechaInicio: '2026-09-01', fechaFin: '2026-09-07', dias: 7, anio: 2026, estado: 'Pendiente', programadoPor: 'Luis Quispe', observaciones: 'Pendiente de aprobación' },
  ] },
]

export interface VacacionFiltro {
  busqueda?: string
  anio?: number
  zona?: string
  tienda?: string
}

/** Lista empleados con sus programaciones de vacaciones (MOCK; simula latencia). */
export function listarVacaciones(f: VacacionFiltro = {}): Promise<EmpleadoVac[]> {
  const q = (f.busqueda ?? '').trim().toLowerCase()
  const items = MOCK.filter((e) =>
    (!q || e.nombre.toLowerCase().includes(q) || e.puesto.toLowerCase().includes(q)) &&
    (!f.zona || e.zona === f.zona) &&
    (!f.tienda || e.tienda === f.tienda) &&
    (!f.anio || e.programaciones.some((p) => p.anio === f.anio)),
  )
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(items)), 150))
}

/** Días calculados (inclusive) de un rango. */
export function diasEntre(desde: string, hasta: string): number {
  if (!desde || !hasta) return 0
  const d = (new Date(hasta).getTime() - new Date(desde).getTime()) / 86400000
  return d < 0 ? 0 : Math.round(d) + 1
}

export const zonasMock = [...new Set(MOCK.map((e) => e.zona))].sort()
export const tiendasMock = [...new Set(MOCK.map((e) => e.tienda))].sort()
export const empleadosMock = MOCK.map((e) => ({ id: e.id, nombre: e.nombre, tienda: e.tienda }))
export const aniosMock = [2025, 2026, 2027]
