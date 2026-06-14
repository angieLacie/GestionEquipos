// Data de prueba para la vista Rol de Personal (sin backend todavía).
// Alcance basado en prototipo-ux-v2/gestion-equipos.html.

export type TipoKey =
  | 'laboral'
  | 'descanso'
  | 'cobertura-tienda'
  | 'comp-feriado'
  | 'comp-descanso'
  | 'cobertura-venta'
  | 'apoyo'
  | 'descanso-medico'
  | 'vacaciones'
  | 'lic'
  | 'feriado-trab'

export interface TipoDef {
  code: string
  etiqueta: string
  cls: string // sufijo de clase CSS .rol-chip--<cls>
}

export const TIPOS: Record<TipoKey, TipoDef> = {
  laboral: { code: 'B', etiqueta: 'Laboral', cls: 'b' },
  descanso: { code: 'D', etiqueta: 'Descanso laboral', cls: 'd' },
  'cobertura-tienda': { code: 'COB', etiqueta: 'Cobertura de tienda', cls: 'cob' },
  'comp-feriado': { code: 'CF', etiqueta: 'Comp. feriado laborado', cls: 'cf' },
  'comp-descanso': { code: 'CD', etiqueta: 'Comp. desc. no gozado', cls: 'cd' },
  'cobertura-venta': { code: 'CV', etiqueta: 'Cobertura por tipo de venta', cls: 'cv' },
  apoyo: { code: 'APO', etiqueta: 'Apoyo en oficina', cls: 'apo' },
  'descanso-medico': { code: 'DM', etiqueta: 'Descanso médico', cls: 'dm' },
  vacaciones: { code: 'VAC', etiqueta: 'Vacaciones', cls: 'vac' },
  lic: { code: 'LIC', etiqueta: 'Licencia', cls: 'lic' },
  'feriado-trab': { code: 'FT', etiqueta: 'Feriado trabajado', cls: 'ft' },
}

// Filtros de tipo: lista ordenada como en el prototipo.
export const TIPOS_FILTRO: { value: TipoKey | ''; label: string }[] = [
  { value: '', label: 'Todos los tipos' },
  { value: 'descanso', label: 'Descanso laboral' },
  { value: 'comp-feriado', label: 'Comp. feriado laborado' },
  { value: 'comp-descanso', label: 'Comp. desc. no gozado' },
  { value: 'cobertura-tienda', label: 'Cobertura de tienda' },
  { value: 'cobertura-venta', label: 'Cobertura por tipo de venta' },
  { value: 'apoyo', label: 'Apoyo en oficina' },
  { value: 'descanso-medico', label: 'Descanso médico' },
  { value: 'lic', label: 'Licencias' },
  { value: 'vacaciones', label: 'Vacaciones' },
  { value: 'feriado-trab', label: 'Feriado trabajado' },
]

export type Cargo = 'senior' | 'gte-asesor' | 'secretarias' | 'auxiliares' | 'sastres'

export const CARGOS_FILTRO: { value: Cargo | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'senior', label: 'Seniors' },
  { value: 'gte-asesor', label: 'Gt/Ases' },
  { value: 'secretarias', label: 'Secretarias' },
  { value: 'auxiliares', label: 'Auxiliares' },
  { value: 'sastres', label: 'Sastres' },
]

// ─── Columnas de métricas (cuota) agrupadas, como en el prototipo ───
export type MetricKey =
  | 'asesorMay'
  | 'asesorJun'
  | 'seniorMay'
  | 'seniorJun'
  | 'asesoria'
  | 'tesoro'
  | 'sem3'
  | 'sem2'
  | 'ultima'

export type GrupoKey = 'asesor' | 'senior' | 'asesoria' | 'tesoro' | 'sem'

export interface GrupoDef {
  key: GrupoKey
  label: string
  cls: string
  cols: { key: MetricKey; label: string }[]
}

export const GRUPOS: GrupoDef[] = [
  { key: 'asesor', label: 'Cuota Asesor', cls: 'g-asesor', cols: [
    { key: 'asesorMay', label: 'May %' },
    { key: 'asesorJun', label: 'Jun %' },
  ] },
  { key: 'senior', label: 'Senior', cls: 'g-senior', cols: [
    { key: 'seniorMay', label: 'May %' },
    { key: 'seniorJun', label: 'Jun %' },
  ] },
  { key: 'asesoria', label: 'Asesoría', cls: 'g-asesoria', cols: [
    { key: 'asesoria', label: '3 ult. sem %' },
  ] },
  { key: 'tesoro', label: 'Tesoro', cls: 'g-tesoro', cols: [
    { key: 'tesoro', label: '3 ult. sem %' },
  ] },
  { key: 'sem', label: 'Sem. Anteriores', cls: 'g-sem', cols: [
    { key: 'sem3', label: 'Sem -3 %' },
    { key: 'sem2', label: 'Sem -2 %' },
    { key: 'ultima', label: 'Última sem %' },
  ] },
]

export type Cuota = Record<MetricKey, number>

export interface Celda {
  tipo: TipoKey
  detalle?: string // p.ej. horario "09:00–18:00"
  estado?: string // p.ej. "PROGRAMADO"
}

export interface FilaRol {
  puesto: string
  cargo: Cargo
  trabajador: string
  cuota: Cuota
  celdas: (Celda | null)[] // 7 días Dom..Sáb
}

export interface Tienda {
  nombre: string
  filas: FilaRol[]
}

export interface Zona {
  nombre: string
  personas: number
  tiendas: Tienda[]
}

// Helpers de construcción
const c = (tipo: TipoKey, estado = 'PROGRAMADO', detalle?: string): Celda => ({ tipo, estado, detalle })
const lab = (h: string): Celda => ({ tipo: 'laboral', estado: 'PROGRAMADO', detalle: h })
const sem = (cel: Celda | null) => Array.from({ length: 7 }, () => cel)
const q = (asesorMay: number, asesorJun: number, seniorMay: number, seniorJun: number, asesoria: number, tesoro: number, sem3: number, sem2: number, ultima: number): Cuota =>
  ({ asesorMay, asesorJun, seniorMay, seniorJun, asesoria, tesoro, sem3, sem2, ultima })

export const kpis = [
  { label: 'ASESORES ACTIVOS', valor: '30', sub: 'Personal registrado', color: '#6366f1', icon: 'users' },
  { label: 'DESCANSOS PROG.', valor: '11', sub: 'Esta semana', color: '#f59e0b', icon: 'calendar' },
  { label: 'DESC. MÁX / DÍA', valor: '6', sub: 'Límite configurado', color: '#14b8a6', icon: 'sliders' },
  { label: 'COBERTURAS ACTIVAS', valor: '3', sub: 'CV + COB', color: '#10b981', icon: 'shopping-bag' },
  { label: 'CUOTA APROX./ASESOR', valor: 'S/ 38,450', sub: 'Meta: S/ 40,000', color: '#8b5cf6', icon: 'dollar-sign' },
  { label: 'ALERTAS', valor: '5', sub: 'Requieren atención', color: '#ef4444', icon: 'alert-triangle' },
]

export const zonas: Zona[] = [
  {
    nombre: 'CENTRAL',
    personas: 4,
    tiendas: [
      {
        nombre: 'Central',
        filas: [
          { puesto: 'Coordinador', cargo: 'gte-asesor', trabajador: 'Rodrigo Villar', cuota: q(98, 102, 94, 88, 96, 91, 90, 93, 95), celdas: sem(c('descanso')) },
          { puesto: 'Supervisor', cargo: 'gte-asesor', trabajador: 'Sandra Méndez', cuota: q(91, 88, 90, 76, 84, 80, 78, 82, 85), celdas: sem(null) },
          { puesto: 'Jefe de Área', cargo: 'gte-asesor', trabajador: 'Arturo Campos', cuota: q(105, 110, 99, 95, 108, 101, 97, 103, 106), celdas: sem(c('comp-feriado')) },
          { puesto: 'Secretaria', cargo: 'secretarias', trabajador: 'Daniela Ríos', cuota: q(0, 0, 0, 0, 0, 0, 0, 0, 0), celdas: sem(null) },
        ],
      },
    ],
  },
  {
    nombre: 'LIMA CENTRO',
    personas: 8,
    tiendas: [
      {
        nombre: 'C.C. El Polo',
        filas: [
          { puesto: 'Asesor Senior', cargo: 'senior', trabajador: 'Valeria Castillo', cuota: q(118, 107, 112, 98, 120, 109, 115, 89, 109), celdas: sem(c('descanso')) },
          { puesto: 'Asesor', cargo: 'gte-asesor', trabajador: 'Marco Ríos', cuota: q(84, 79, 80, 71, 86, 78, 74, 81, 83), celdas: sem(c('descanso')) },
          {
            puesto: 'Asesor',
            cargo: 'gte-asesor',
            trabajador: 'Lucía Fernández',
            cuota: q(96, 101, 92, 90, 98, 94, 90, 95, 97),
            celdas: [lab('09:00–18:00'), lab('09:00–18:00'), c('descanso'), lab('09:00–18:00'), c('cobertura-tienda'), lab('12:00–21:00'), c('descanso')],
          },
          {
            puesto: 'Cajero',
            cargo: 'auxiliares',
            trabajador: 'Pedro Salas',
            cuota: q(0, 0, 0, 0, 0, 0, 0, 0, 0),
            celdas: [lab('08:00–17:00'), c('descanso'), lab('08:00–17:00'), lab('08:00–17:00'), c('feriado-trab', 'COMPENSADO'), lab('08:00–17:00'), c('comp-descanso')],
          },
        ],
      },
      {
        nombre: 'Jockey Plaza',
        filas: [
          { puesto: 'Asesor Senior', cargo: 'senior', trabajador: 'Cristian Monteagudo', cuota: q(95, 100, 93, 98, 102, 97, 90, 96, 101), celdas: sem(c('vacaciones')) },
          { puesto: 'Secretaria Senior', cargo: 'secretarias', trabajador: 'Karina Bravo', cuota: q(90, 96, 109, 97, 105, 92, 89, 94, 98), celdas: sem(c('descanso')) },
          {
            puesto: 'Asesor',
            cargo: 'gte-asesor',
            trabajador: 'Diego Paredes',
            cuota: q(77, 82, 78, 69, 80, 76, 70, 79, 81),
            celdas: [c('descanso'), lab('11:00–20:00'), lab('11:00–20:00'), c('descanso-medico'), lab('11:00–20:00'), c('descanso'), lab('11:00–20:00')],
          },
          {
            puesto: 'Cajero',
            cargo: 'auxiliares',
            trabajador: 'Jorge Mendoza',
            cuota: q(0, 0, 0, 0, 0, 0, 0, 0, 0),
            celdas: [lab('09:00–18:00'), lab('09:00–18:00'), c('descanso'), lab('09:00–18:00'), c('apoyo'), lab('09:00–18:00'), c('descanso')],
          },
        ],
      },
    ],
  },
  {
    nombre: 'LIMA NORTE',
    personas: 5,
    tiendas: [
      {
        nombre: 'Mega Plaza',
        filas: [
          {
            puesto: 'Coordinador',
            cargo: 'gte-asesor',
            trabajador: 'Rosa Quispe',
            cuota: q(100, 96, 95, 88, 98, 92, 88, 94, 96),
            celdas: [lab('08:00–17:00'), lab('08:00–17:00'), lab('08:00–17:00'), c('lic', 'APROBADA'), c('descanso'), c('descanso'), lab('08:00–17:00')],
          },
          { puesto: 'Asesor', cargo: 'gte-asesor', trabajador: 'Luis Tapia', cuota: q(81, 85, 82, 74, 86, 80, 76, 83, 85), celdas: sem(c('descanso')) },
          {
            puesto: 'Sastre',
            cargo: 'sastres',
            trabajador: 'Miriam Cordova',
            cuota: q(0, 0, 0, 0, 0, 0, 0, 0, 0),
            celdas: [lab('12:00–21:00'), lab('12:00–21:00'), c('descanso'), lab('12:00–21:00'), c('cobertura-tienda'), lab('12:00–21:00'), c('descanso')],
          },
        ],
      },
    ],
  },
]

// Tab Pendientes: Feriados Pendientes / Descansos no Gozados
export interface PendienteFila {
  trabajador: string
  cargo: string
  sub: string
  feriados: number
  descansos: number
  detFeriados: string[]   // "01/05/2026 — Día del Trabajo"
  detDescansos: string[]  // "Semana del 20-26/04/2026"
}

export const pendientes: PendienteFila[] = [
  {
    trabajador: 'Ana García', cargo: 'Asesor Senior', sub: 'Lima Centro · Asesor Senior',
    feriados: 2, descansos: 1,
    detFeriados: ['01/05/2026 — Día del Trabajo', '27/05/2026 — Feriado regional'],
    detDescansos: ['Semana del 20-26/04/2026'],
  },
  {
    trabajador: 'Carlos Mendoza', cargo: 'Asesor Senior', sub: 'Lima Centro · Asesor Senior',
    feriados: 0, descansos: 2,
    detFeriados: [],
    detDescansos: ['Semana del 06-12/04/2026', 'Semana del 13-19/04/2026'],
  },
  {
    trabajador: 'María López', cargo: 'Asesor Senior', sub: 'Lima Norte · Asesor Senior',
    feriados: 3, descansos: 0,
    detFeriados: ['01/01/2026 — Año Nuevo', '01/05/2026 — Día del Trabajo', '29/06/2026 — San Pedro y San Pablo'],
    detDescansos: [],
  },
  {
    trabajador: 'Pedro Quispe', cargo: 'Asesor', sub: 'Lima Norte · Asesor',
    feriados: 1, descansos: 1,
    detFeriados: ['27/05/2026 — Feriado regional'],
    detDescansos: ['Semana del 27/04-03/05/2026'],
  },
  {
    trabajador: 'Rosa Chávez', cargo: 'Secretaria', sub: 'Lima Sur · Secretaria',
    feriados: 0, descansos: 0,
    detFeriados: [],
    detDescansos: [],
  },
]

// Lista plana de zonas/tiendas para los selects de filtro
export const listaZonas = zonas.map((z) => z.nombre)
export const listaTiendas = zonas.flatMap((z) => z.tiendas.map((t) => t.nombre))
