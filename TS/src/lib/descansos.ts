// ⚠️ DATOS MOCK — Descansos, compensaciones y licencias (módulo Desc).
// No hay backend; mantener las firmas para enchufar la fuente real luego.

export interface TipoDescanso {
  key: string
  label: string
  desc: string
  color: string
}

/** Catálogo de tipos de programación (motivos), RN-DESC-01. */
export const TIPOS: TipoDescanso[] = [
  { key: 'descanso_laboral', label: 'Descanso laboral', desc: 'Descanso semanal programado', color: '#10b981' },
  { key: 'cobertura_tienda', label: 'Cobertura de tienda', desc: 'Cobertura operativa de tienda', color: '#3b82f6' },
  { key: 'comp_feriado', label: 'Comp. por feriado laborado', desc: 'Por feriado trabajado', color: '#f59e0b' },
  { key: 'comp_no_gozado', label: 'Comp. por descanso lab. no gozado', desc: 'Por descanso lab. no gozado', color: '#f59e0b' },
  { key: 'cobertura_venta', label: 'Cobertura por tipo de venta', desc: 'Solo tiendas Lukers', color: '#eab308' },
  { key: 'apoyo_oficina', label: 'Apoyo en oficina', desc: 'Asignación a oficina central', color: '#14b8a6' },
  { key: 'descanso_medico', label: 'Descanso médico', desc: 'Reposo médico certificado', color: '#ef4444' },
  { key: 'vacaciones', label: 'Vacaciones', desc: 'Vacaciones anuales', color: '#22c55e' },
  { key: 'lsgh', label: 'Licencia sin goce de haber', desc: 'Licencia sin remuneración', color: '#f97316' },
  { key: 'lcgh', label: 'Licencia con goce de haber', desc: 'Licencia con remuneración', color: '#3b82f6' },
  { key: 'permiso', label: 'Permiso personal', desc: 'Permiso por horas o día', color: '#a855f7' },
  { key: 'lic_paternidad', label: 'Licencia por paternidad', desc: 'Hasta 10 días hábiles', color: '#06b6d4' },
  { key: 'lic_maternidad', label: 'Licencia por maternidad', desc: '98 días (pre y post natal)', color: '#ec4899' },
  { key: 'lic_fallecimiento', label: 'Licencia por fallecimiento', desc: 'Por fallecimiento de familiar', color: '#ef4444' },
]
export const tipoDe = (key: string) => TIPOS.find((t) => t.key === key)

export type EstadoDesc = 'Programado' | 'EnEjecucion' | 'Culminado' | 'Anulado'
export const ESTADO_LABEL: Record<EstadoDesc, string> = {
  Programado: 'PROGRAMADO', EnEjecucion: 'EN EJECUCIÓN', Culminado: 'CULMINADO', Anulado: 'ANULADO',
}
export const ESTADO_COLOR: Record<EstadoDesc, string> = {
  Programado: 'success', EnEjecucion: 'info', Culminado: 'secondary', Anulado: 'danger',
}

// ── KPIs (cabecera) ──────────────────────────────────────────
export const KPIS = {
  activos: 30, enDescansoHoy: 2, deVacaciones: 2, conLicencia: 1, progMes: 11,
}

// ── Calendario: trabajadores agrupados zona → tienda ─────────
export interface CalTrabajador {
  id: number
  puesto: string
  trabajador: string
  zona: string
  tienda: string
  /** Asignaciones por fecha ISO → tipoKey. */
  celdas: Record<string, string>
}

export const CAL_TRABAJADORES: CalTrabajador[] = [
  { id: 1, puesto: 'Asesor Senior', trabajador: 'Valeria Castillo', zona: 'Lima Centro', tienda: 'C.C. El Polo', celdas: {} },
  { id: 2, puesto: 'Auxiliar de Almacén', trabajador: 'Nadia Rivas', zona: 'Lima Centro', tienda: 'C.C. El Polo', celdas: {} },
  { id: 3, puesto: 'Asesor', trabajador: 'Carlos Gómez', zona: 'Lima Centro', tienda: 'Jockey Plaza', celdas: {} },
  { id: 4, puesto: 'Asesor Senior', trabajador: 'Cristian Monteagudo', zona: 'Lima Centro', tienda: 'Jockey Plaza', celdas: { '2026-06-17': 'apoyo_oficina' } },
  { id: 5, puesto: 'Asesor Senior', trabajador: 'Carlos Mendoza', zona: 'Lima Centro', tienda: 'Jockey Plaza', celdas: {} },
  { id: 6, puesto: 'Encargado', trabajador: 'Pedro Sánchez', zona: 'Lima Norte', tienda: 'Mega Plaza', celdas: {} },
  { id: 7, puesto: 'Asesor Senior', trabajador: 'Luis Quispe', zona: 'Lima Norte', tienda: 'Mega Plaza', celdas: {} },
  { id: 8, puesto: 'Encargado', trabajador: 'Gabriel Suarez', zona: 'Lima Norte', tienda: 'Mega Plaza', celdas: {} },
  { id: 9, puesto: 'Asesor Senior', trabajador: 'Ana Torres', zona: 'Lima Norte', tienda: 'Plaza Norte', celdas: {} },
  { id: 10, puesto: 'Asesor', trabajador: 'Jorge Ruiz', zona: 'Lima Norte', tienda: 'Plaza Norte', celdas: {} },
  { id: 11, puesto: 'Asesor', trabajador: 'Susy Rodríguez', zona: 'Lima Norte', tienda: 'Plaza Norte', celdas: {} },
  { id: 12, puesto: 'Asesor Senior', trabajador: 'Ana García', zona: 'Lima Norte', tienda: 'Plaza Norte', celdas: {} },
]

/** Días de la semana en curso (domingo-sábado), 14–20 jun 2026. */
export const SEMANA = [
  { iso: '2026-06-14', dia: 'Dom', label: '14/jun' },
  { iso: '2026-06-15', dia: 'Lun', label: '15/jun' },
  { iso: '2026-06-16', dia: 'Mar', label: '16/jun' },
  { iso: '2026-06-17', dia: 'Mié', label: '17/jun' },
  { iso: '2026-06-18', dia: 'Jue', label: '18/jun' },
  { iso: '2026-06-19', dia: 'Vie', label: '19/jun' },
  { iso: '2026-06-20', dia: 'Sáb', label: '20/jun' },
]

/** Descansos sugeridos por la sugerencia automática (trabajadorId → fechas ISO). */
export const SUGERENCIAS: Record<number, string[]> = {
  3: ['2026-06-14', '2026-06-16'],  // Carlos Gómez
  6: ['2026-06-14', '2026-06-16'],  // Pedro Sánchez
  9: ['2026-06-14', '2026-06-16'],  // Ana Torres
}

// ── Tabla: registros de descansos/compensaciones ─────────────
export interface RegistroDesc {
  id: number
  puesto: string
  trabajador: string
  zona: string
  tienda: string
  tipoKey: string
  /** Etiqueta del motivo (puede diferir del tipo, ej. "Compensación"). */
  motivo: string
  fechaInicio: string
  fechaFin: string | null
  estado: EstadoDesc
  compensa: string | null
}

export const REGISTROS: RegistroDesc[] = [
  { id: 1, puesto: 'Coordinador', trabajador: 'Rodrigo Villar', zona: 'Central', tienda: 'Central', tipoKey: 'descanso_laboral', motivo: 'Descanso laboral', fechaInicio: '2026-05-26', fechaFin: null, estado: 'Programado', compensa: null },
  { id: 2, puesto: 'Supervisor', trabajador: 'Sandra Méndez', zona: 'Central', tienda: 'Central', tipoKey: 'cobertura_tienda', motivo: 'Cobertura de tienda', fechaInicio: '2026-05-27', fechaFin: '2026-05-28', estado: 'EnEjecucion', compensa: null },
  { id: 3, puesto: 'Jefe de Área', trabajador: 'Arturo Campos', zona: 'Central', tienda: 'Central', tipoKey: 'comp_feriado', motivo: 'Comp. feriado laborado', fechaInicio: '2026-05-29', fechaFin: null, estado: 'Programado', compensa: '2026-05-01' },
  { id: 4, puesto: 'Coordinador', trabajador: 'Daniela Ríos', zona: 'Central', tienda: 'Central', tipoKey: 'comp_no_gozado', motivo: 'Comp. desc. lab. no gozado', fechaInicio: '2026-05-28', fechaFin: '2026-05-29', estado: 'Programado', compensa: '2026-05-01' },
  { id: 5, puesto: 'Coordinador', trabajador: 'Rodrigo Villar', zona: 'Central', tienda: 'Central', tipoKey: 'cobertura_venta', motivo: 'Cobertura por tipo de venta', fechaInicio: '2026-05-30', fechaFin: null, estado: 'Programado', compensa: null },
  { id: 6, puesto: 'Asesor', trabajador: 'Marco Ríos', zona: 'Lima Centro', tienda: 'C.C. El Polo', tipoKey: 'descanso_laboral', motivo: 'Descanso laboral', fechaInicio: '2026-06-05', fechaFin: null, estado: 'Programado', compensa: null },
  { id: 7, puesto: 'Asesor Senior', trabajador: 'Valeria Castillo', zona: 'Lima Centro', tienda: 'C.C. El Polo', tipoKey: 'descanso_laboral', motivo: 'Descanso laboral', fechaInicio: '2026-06-06', fechaFin: null, estado: 'Programado', compensa: null },
  { id: 8, puesto: 'Asesor', trabajador: 'Carlos Gómez', zona: 'Lima Centro', tienda: 'Jockey Plaza', tipoKey: 'comp_feriado', motivo: 'Compensación', fechaInicio: '2026-05-28', fechaFin: null, estado: 'Programado', compensa: '2026-05-01' },
  { id: 9, puesto: 'Asesor Senior', trabajador: 'Cristian Monteagudo', zona: 'Lima Centro', tienda: 'Jockey Plaza', tipoKey: 'apoyo_oficina', motivo: 'Apoyo en oficina', fechaInicio: '2026-05-28', fechaFin: '2026-05-29', estado: 'Programado', compensa: null },
]

// ── Resumen por tienda ───────────────────────────────────────
export interface ResumenTienda {
  codigo: string
  nombre: string
  zona: string
  trab: number
  pend: number
  comp: number
  lic: number
  cobertura: number
  riesgo: 'CRÍTICO' | 'NORMAL'
}

export const RESUMEN: ResumenTienda[] = [
  { codigo: 'CEL', nombre: 'C.C. El Polo', zona: 'Lima Centro', trab: 3, pend: 2, comp: 0, lic: 1, cobertura: 67, riesgo: 'CRÍTICO' },
  { codigo: 'CRE', nombre: 'C.C. Real Plaza', zona: 'Lima Sur', trab: 3, pend: 3, comp: 1, lic: 2, cobertura: 67, riesgo: 'CRÍTICO' },
  { codigo: 'JPL', nombre: 'Jockey Plaza', zona: 'Lima Centro', trab: 5, pend: 3, comp: 0, lic: 0, cobertura: 100, riesgo: 'NORMAL' },
  { codigo: 'MAV', nombre: 'Mall Aventura Arequipa', zona: 'Provincia Sur', trab: 1, pend: 0, comp: 0, lic: 0, cobertura: 100, riesgo: 'NORMAL' },
  { codigo: 'MDE', nombre: 'Mall del Sur', zona: 'Lima Sur', trab: 5, pend: 3, comp: 0, lic: 0, cobertura: 100, riesgo: 'NORMAL' },
  { codigo: 'MPL', nombre: 'Mega Plaza', zona: 'Lima Norte', trab: 4, pend: 3, comp: 0, lic: 0, cobertura: 100, riesgo: 'NORMAL' },
  { codigo: 'OPL', nombre: 'Open Plaza Angamos', zona: 'Lima Sur', trab: 3, pend: 0, comp: 0, lic: 1, cobertura: 67, riesgo: 'CRÍTICO' },
  { codigo: 'PNO', nombre: 'Plaza Norte', zona: 'Lima Norte', trab: 6, pend: 3, comp: 2, lic: 0, cobertura: 67, riesgo: 'CRÍTICO' },
  { codigo: 'RPL', nombre: 'Real Plaza Trujillo', zona: 'Provincia Norte', trab: 1, pend: 0, comp: 0, lic: 0, cobertura: 100, riesgo: 'NORMAL' },
]

export const zonasMock = [...new Set(CAL_TRABAJADORES.map((t) => t.zona))].sort()
export const tiendasMock = [...new Set(CAL_TRABAJADORES.map((t) => t.tienda))].sort()
