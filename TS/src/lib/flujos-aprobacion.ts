import { api, ApiError } from './api'
import { useAuth } from './auth'

/** Un nivel (paso) dentro de un flujo de aprobación. */
export interface NivelAprobacion {
  orden: number
  /** Rol aprobador: GZ, GG, GT, AV, GV. */
  rol: string
  /** SLA en horas (24, 48…). */
  slaHoras: number
  /** Obligatorio vs. opcional. */
  obligatorio: boolean
  /** Exige segregación de funciones (aprobador ≠ solicitante/nivel previo). */
  segregacion: boolean
}

/** Flujo de aprobación configurable por módulo / tipo de registro. */
export interface FlujoAprobacion {
  codigo: string
  nombre: string
  /** Módulo o tipo de registro al que aplica (etiqueta). */
  modulo: string
  activo: boolean
  niveles: NivelAprobacion[]
}

/** Roles aprobadores disponibles para los niveles. */
export const ROLES_APROBADOR = ['AV', 'GZ', 'GT', 'GV', 'GG'] as const
/** Módulos/tipos de registro que pueden tener flujo. */
export const MODULOS_FLUJO = ['Vacaciones', 'Rol de Personal', 'Ascenso Senior', 'Encargatura', 'Traslado', 'Descansos'] as const

const CLAVE_FLUJOS = 'APRO_FLUJOS'

/** Valores por defecto (del prototipo de UX). */
export const FLUJOS_DEFAULT: FlujoAprobacion[] = [
  {
    codigo: 'FL_VAC', nombre: 'Aprobación de Vacaciones', modulo: 'Vacaciones', activo: true,
    niveles: [
      { orden: 1, rol: 'GZ', slaHoras: 24, obligatorio: true, segregacion: false },
      { orden: 2, rol: 'GG', slaHoras: 48, obligatorio: true, segregacion: true },
    ],
  },
  {
    codigo: 'FL_ROL', nombre: 'Aprobación del Rol', modulo: 'Rol de Personal', activo: true,
    niveles: [
      { orden: 1, rol: 'GZ', slaHoras: 24, obligatorio: true, segregacion: false },
      { orden: 2, rol: 'GG', slaHoras: 48, obligatorio: true, segregacion: false },
      { orden: 3, rol: 'GT', slaHoras: 24, obligatorio: false, segregacion: false },
    ],
  },
  {
    codigo: 'FL_ASCE', nombre: 'Ascenso a Senior', modulo: 'Ascenso Senior', activo: true,
    niveles: [
      { orden: 1, rol: 'AV', slaHoras: 24, obligatorio: true, segregacion: false },
      { orden: 2, rol: 'GG', slaHoras: 48, obligatorio: true, segregacion: true },
    ],
  },
  {
    codigo: 'FL_ENCA', nombre: 'Encargatura', modulo: 'Encargatura', activo: true,
    niveles: [
      { orden: 1, rol: 'AV', slaHoras: 24, obligatorio: true, segregacion: false },
    ],
  },
]

/** Lee los flujos vigentes. Si aún no existe el parámetro, cae a los defaults. */
export async function obtenerFlujos(): Promise<FlujoAprobacion[]> {
  const hoy = new Date().toISOString().slice(0, 10)
  try {
    const p = await api<{ valor: string }>(
      `/v1/maes/configuracion/parametros/lookup?clave=${CLAVE_FLUJOS}&fecha=${hoy}`,
    )
    return JSON.parse(p.valor) as FlujoAprobacion[]
  } catch (e) {
    // Clon para no exponer (ni mutar) el array de defaults compartido.
    if (e instanceof ApiError && e.status === 404) return structuredClone(FLUJOS_DEFAULT)
    throw e
  }
}

/** Guarda una nueva versión de los flujos de aprobación (CU-MAES-04). */
export async function guardarFlujos(flujos: FlujoAprobacion[]): Promise<void> {
  const idActor = useAuth.getState().usuario?.idUsuario ?? ''
  const hoy = new Date().toISOString().slice(0, 10)
  await api('/v1/maes/configuracion/parametros', {
    method: 'POST',
    body: JSON.stringify({
      modulo: 'Aprobaciones',
      flujo: null,
      nivel: null,
      nombreParametro: 'FLUJOS',
      ambito: 'Global',
      idEmpresa: null,
      idAmbito: null,
      tipoDato: 'Lista',
      unidad: null,
      valor: JSON.stringify(flujos),
      esImpactoNegocio: true,
      criticidadConsumo: 'Bloqueante',
      justificacion: 'Edición de la configuración de flujos de aprobación desde el sistema.',
      vigenciaDesde: hoy,
      esCorreccionRetroactiva: false,
      idActor,
    }),
  })
}
