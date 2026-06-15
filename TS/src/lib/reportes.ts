// ⚠️ DATOS MOCK — módulo de Reportes (prototipo). Sin backend conectado.

export interface ReporteCard {
  key: string
  titulo: string
  icon: string
  iconColor: string
  badge: { texto: string; color: string }
  descripcion: string
  meta: string
}

export const REPORTES: ReporteCard[] = [
  { key: 'comp_programadas', titulo: 'Compensaciones Programadas', icon: 'refresh-cw', iconColor: '#3b82f6', badge: { texto: 'DATOS REALES', color: '#7c3aed' }, descripcion: 'Descansos de compensación por feriado y semanal programados. Detallado por empleado, zona y estado.', meta: '5 registros' },
  { key: 'comp_pendientes', titulo: 'Compensaciones Pendientes', icon: 'dollar-sign', iconColor: '#f59e0b', badge: { texto: 'NUEVO', color: '#7c3aed' }, descripcion: 'Listado de compensaciones por días/horas pendientes de pago por zona, tienda y personal.', meta: 'Período: Abril 2026' },
  { key: 'indice_cobertura', titulo: 'Índice de Cobertura', icon: 'bar-chart-2', iconColor: '#ec4899', badge: { texto: 'SEMANAL', color: '#7c3aed' }, descripcion: 'Cobertura de asesores vs plantilla por gerencia. Requerimiento, rotación, ingresos/ceses y cumplimiento. 2 partes: Asesores y Total.', meta: 'Partes: Asesores · Total' },
  { key: 'horas_extras', titulo: 'Horas Extras', icon: 'clock', iconColor: '#a855f7', badge: { texto: 'NUEVO', color: '#7c3aed' }, descripcion: 'Control de horas laboradas vs horas ley por zona y tienda. Incluye detalle por colaborador y gráfico resumen.', meta: 'Período: Abril 2026' },
]

// ── Reporte: Compensaciones Programadas ──────────────────────
export const COMP_PROGRAMADAS = {
  periodo: '28/05/2026 — 02/06/2026',
  generado: '15 de junio de 2026',
  kpis: [
    { label: 'Total registros', value: 5, color: '#6366f1' },
    { label: 'Programados', value: 5, color: '#d97706' },
    { label: 'Culminados', value: 0, color: '#16a34a' },
    { label: 'Por feriado', value: 2, color: '#dc2626' },
    { label: 'Por semanal', value: 3, color: '#7c3aed' },
  ],
  filas: [
    { n: 1, empleado: 'Carlos Gómez', zona: 'Lima Centro', tienda: 'Jockey Plaza', tipo: 'Compensación', tipoColor: '#3b82f6', inicio: '28/05/2026', fin: '—', estado: 'Programado', notas: 'Por feriado 01/05' },
    { n: 2, empleado: 'Daniela Ríos', zona: 'Central', tienda: 'Central', tipo: 'Comp. Semanal', tipoColor: '#7c3aed', inicio: '28/05/2026', fin: '29/05/2026', estado: 'Programado', notas: 'Desc. sem. laborado' },
    { n: 3, empleado: 'Arturo Campos', zona: 'Central', tienda: 'Central', tipo: 'Comp. Feriado', tipoColor: '#f59e0b', inicio: '29/05/2026', fin: '—', estado: 'Programado', notas: 'Feriado 01/05' },
    { n: 4, empleado: 'Ana Torres', zona: 'Lima Norte', tienda: 'Plaza Norte', tipo: 'Comp. Feriado', tipoColor: '#f59e0b', inicio: '01/06/2026', fin: '—', estado: 'Programado', notas: '—' },
    { n: 5, empleado: 'Ana Torres', zona: 'Lima Norte', tienda: 'Plaza Norte', tipo: 'Compensación', tipoColor: '#3b82f6', inicio: '02/06/2026', fin: '—', estado: 'Programado', notas: 'Por feriado 28/07' },
  ],
}

// ── Reporte: Compensaciones Pendientes ───────────────────────
export const COMP_PENDIENTES = {
  periodo: '01/04/2026 — 30/04/2026',
  filas: [
    { id: '001', zona: 'Lima Sur', tienda: 'C.C. Real Plaza', dni: '72345678', personal: 'Erika Del Carpio', puesto: 'Asesor', dias: 2, horas: 16, ref: 'Apr-26-001' },
    { id: '002', zona: 'Lima Centro', tienda: 'C.C. El Polo', dni: '45678901', personal: 'Marco Ríos Castro', puesto: 'Asesor', dias: 1, horas: 8, ref: 'Apr-26-002' },
    { id: '003', zona: 'Lima Norte', tienda: 'Plaza Norte', dni: '87654321', personal: 'Jesús Delgado Gudiño', puesto: 'Asesor', dias: 3, horas: 24, ref: 'Apr-26-003' },
  ],
  total: { colaboradores: 3, dias: 6, horas: 48 },
}

// ── Reporte: Índice de Cobertura ─────────────────────────────
export const COBERTURA = {
  titulo: 'ÍNDICE DE COBERTURA SEMANA 24 — DEL 14 AL 20 DE JUNIO 2026',
  parte1Headers: ['Gerencia', 'Gerente de venta', 'Plantilla', 'Asesor activos', 'Cobertura', 'Activo ausente', 'Cobertura', 'Plantilla N° asesor mes+1', 'Vacaciones mes+1', 'Ampliación', 'Total', 'Necesidad', 'Asesor sem. anterior', 'Rotación enero', 'Ingresos', 'Re ingresos', 'Cese semanal', 'Cumplimiento'],
  parte1: [
    ['Lima Centro', 'Fernando Castro', '8', '7', '88%', '1', '90%', '10', '1', '2', '13', '5', '70%', '28%', '0', '0', '2', '100%'],
    ['Lima Norte', 'Pedro Sánchez', '10', '8', '80%', '2', '88%', '11', '2', '4', '17', '7', '60%', '31%', '3', '4', '0', '102%'],
    ['Lima Sur', 'Lucia Prado', '11', '9', '82%', '2', '80%', '12', '1', '8', '21', '10', '60%', '34%', '1', '0', '0', '104%'],
    ['Provincia Norte', 'Rosa Mamani', '1', '1', '100%', '0', '105%', '5', '1', '2', '8', '7', '91%', '19%', '0', '1', '0', '94%'],
    ['Provincia Sur', 'Carmen Huanca', '1', '1', '100%', '0', '90%', '5', '1', '4', '10', '9', '88%', '22%', '2', '0', '0', '96%'],
  ],
  parte1Total: ['TOTAL', '', '31', '26', '84%', '5', '91%', '43', '6', '20', '69', '38', '74%', '27%', '5', '5', '5', '99%'],
  parte2Headers: ['Gerencia', 'Gerente de venta', 'Secretaria %', 'Plant N°', 'Sem ant', 'Sastre %', 'Plant N°', 'Sem ant', 'Auxiliar %', 'Plant N°', 'Sem ant', 'Total personal %', 'Plant N°', 'Al semana', 'Rot. enero', 'Cese semanal', 'Cumplimiento'],
  parte2: [
    ['Lima Centro', 'Fernando Castro', '110%', '4', '99%', '168%', '7', '147%', '124%', '8', '125%', '110%', '101', '106%', '15%', '1', '100%'],
    ['Lima Norte', 'Pedro Sánchez', '115%', '5', '103%', '176%', '8', '154%', '128%', '9', '130%', '113%', '107', '109%', '16%', '0', '102%'],
    ['Lima Sur', 'Lucia Prado', '120%', '6', '107%', '184%', '5', '161%', '132%', '6', '135%', '116%', '113', '112%', '17%', '1', '104%'],
    ['Provincia Norte', 'Rosa Mamani', '95%', '4', '87%', '144%', '5', '126%', '112%', '9', '110%', '101%', '83', '97%', '12%', '1', '94%'],
    ['Provincia Sur', 'Carmen Huanca', '100%', '5', '91%', '152%', '5', '133%', '116%', '6', '115%', '104%', '89', '100%', '13%', '0', '96%'],
  ],
  parte2Total: ['TOTAL', '', '108%', '24', '97%', '165%', '33', '144%', '122%', '38', '123%', '109%', '493', '105%', '15%', '3', '99%'],
}

// ── Reporte: Horas Extras ────────────────────────────────────
export const HORAS_EXTRAS = {
  periodo: '01/04/2026 — 30/04/2026',
  resumenZona: [
    { zona: 'Lima Sur', lab: 1248, ley: 1200, dif: 48 },
    { zona: 'Lima Centro', lab: 992, ley: 960, dif: 32 },
    { zona: 'Lima Norte', lab: 880, ley: 840, dif: 40 },
    { zona: 'Lima Este', lab: 736, ley: 720, dif: 16 },
    { zona: 'Lima Oeste', lab: 624, ley: 600, dif: 24 },
    { zona: 'Lima Moderna', lab: 560, ley: 540, dif: 20 },
    { zona: 'Lima Histórico', lab: 480, ley: 480, dif: 0 },
    { zona: 'Callao', lab: 416, ley: 400, dif: 16 },
  ],
  detalle: [
    { personal: 'Erika Del Carpio', zona: 'Lima Sur', d: ['—', '9', '9', '8', '9', '8', '9'], lab: 52, ley: 48, dif: 4 },
    { personal: 'Marco Ríos Castro', zona: 'Lima Centro', d: ['—', '8', '10', '8', '8', '8', '8'], lab: 51, ley: 48, dif: 3 },
    { personal: 'Jesús Delgado', zona: 'Lima Norte', d: ['—', '9', '8', '9', '9', '8', '10'], lab: 53, ley: 48, dif: 5 },
    { personal: 'Lucía Paredes', zona: 'Lima Sur', d: ['—', '8', '8', '8', '8', '8', '—'], lab: 40, ley: 40, dif: 0 },
    { personal: 'Rosa Gutiérrez', zona: 'Lima Centro', d: ['—', '9', '8', '9', '8', '9', '9'], lab: 52, ley: 48, dif: 4 },
    { personal: 'Pedro Salcedo', zona: 'Lima Norte', d: ['—', '8', '9', '8', '9', '9', '—'], lab: 43, ley: 40, dif: 3 },
    { personal: 'Carmen Huanca', zona: 'Lima Este', d: ['—', '8', '8', '8', '8', '8', '—'], lab: 40, ley: 40, dif: 0 },
    { personal: 'Luis Vargas', zona: 'Lima Oeste', d: ['—', '9', '9', '9', '9', '8', '8'], lab: 52, ley: 48, dif: 4 },
    { personal: 'Ana Torres', zona: 'Lima Moderna', d: ['—', '8', '9', '8', '9', '8', '—'], lab: 42, ley: 40, dif: 2 },
    { personal: 'Jorge Mamani', zona: 'Lima Sur', d: ['—', '10', '8', '9', '9', '8', '10'], lab: 54, ley: 48, dif: 6 },
    { personal: 'Sofía Ccahua', zona: 'Lima Centro', d: ['—', '8', '8', '8', '8', '8', '—'], lab: 40, ley: 40, dif: 0 },
    { personal: 'Raúl Quispe', zona: 'Callao', d: ['—', '9', '9', '8', '9', '9', '8'], lab: 52, ley: 48, dif: 4 },
    { personal: 'Yolanda Ríos', zona: 'Lima Norte', d: ['—', '8', '8', '8', '8', '8', '—'], lab: 40, ley: 40, dif: 0 },
    { personal: 'Víctor Condori', zona: 'Lima Este', d: ['—', '9', '8', '9', '8', '9', '9'], lab: 52, ley: 48, dif: 4 },
  ],
}
