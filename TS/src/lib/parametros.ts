import { api, ApiError } from './api'
import { useAuth } from './auth'
import type { CategoriaRol } from './roster'

/** Una entrada del mapeo puesto→categoría. */
export interface MapeoPuesto {
  puesto: string
  categoria: CategoriaRol
}

const CLAVE_MAPEO = 'ROL_MAPEO_PUESTO_CATEGORIA'

/** Lee el mapeo vigente como lista ordenable (para la pantalla de edición). */
export async function obtenerMapeoPuestos(): Promise<MapeoPuesto[]> {
  const hoy = new Date().toISOString().slice(0, 10)
  const p = await api<{ valor: string }>(
    `/v1/maes/configuracion/parametros/lookup?clave=${CLAVE_MAPEO}&fecha=${hoy}`,
  )
  return JSON.parse(p.valor) as MapeoPuesto[]
}

/** Guarda una nueva versión del parámetro de mapeo (CU-MAES-04). */
export async function guardarMapeoPuestos(lista: MapeoPuesto[]): Promise<void> {
  const idActor = useAuth.getState().usuario?.idUsuario ?? ''
  const hoy = new Date().toISOString().slice(0, 10)
  await api('/v1/maes/configuracion/parametros', {
    method: 'POST',
    body: JSON.stringify({
      modulo: 'Rol',
      flujo: null,
      nivel: null,
      nombreParametro: 'MAPEO_PUESTO_CATEGORIA',
      ambito: 'Global',
      idEmpresa: null,
      idAmbito: null,
      tipoDato: 'Lista',
      unidad: null,
      valor: JSON.stringify(lista),
      esImpactoNegocio: false,
      criticidadConsumo: 'Degradable',
      justificacion: 'Edición del mapeo puesto→categoría desde el sistema.',
      vigenciaDesde: hoy,
      esCorreccionRetroactiva: false,
      idActor,
    }),
  })
}

// ── Tabla de Puestos: límites operativos por puesto (RN-DESC-02) ──────────────

/** Límites operativos de un puesto: descanso/trabajo por semana y jornada (horas). */
export interface ParametroPuesto {
  puesto: string
  /** Días máx. de descanso por semana (RN-DESC-02/03/04). */
  diasDescansoMax: number
  /** Días máx. de trabajo por semana. */
  diasTrabajoMax: number
  /** Horas de jornada part time por día. */
  horasPartTime: number
  /** Horas de jornada full time por día. */
  horasFullTime: number
  /** Horas de refrigerio por día. */
  horaRefrigerio: number
}

const CLAVE_PARAMS_PUESTO = 'ROL_PARAMETROS_PUESTO'

/** Valores por defecto (Tabla de Puestos de la espec. de Descansos, RN-DESC-02). */
export const PARAMETROS_PUESTO_DEFAULT: ParametroPuesto[] = [
  { puesto: 'Asesor', diasDescansoMax: 2, diasTrabajoMax: 5, horasPartTime: 4, horasFullTime: 9.6, horaRefrigerio: 2.5 },
  { puesto: 'Gerente de Tienda', diasDescansoMax: 2, diasTrabajoMax: 5, horasPartTime: 4, horasFullTime: 9.6, horaRefrigerio: 2.5 },
  { puesto: 'Auxiliar de Tienda', diasDescansoMax: 1, diasTrabajoMax: 6, horasPartTime: 4, horasFullTime: 8, horaRefrigerio: 1.5 },
  { puesto: 'Promotor', diasDescansoMax: 1, diasTrabajoMax: 6, horasPartTime: 4, horasFullTime: 8, horaRefrigerio: 1.5 },
  { puesto: 'Reponedor', diasDescansoMax: 1, diasTrabajoMax: 6, horasPartTime: 4, horasFullTime: 8, horaRefrigerio: 1.5 },
  { puesto: 'Sastre', diasDescansoMax: 1, diasTrabajoMax: 6, horasPartTime: 4, horasFullTime: 8, horaRefrigerio: 1.5 },
  { puesto: 'Secretaria-Cajera', diasDescansoMax: 1, diasTrabajoMax: 6, horasPartTime: 4, horasFullTime: 8, horaRefrigerio: 1.5 },
  { puesto: 'Supervisor de Sección', diasDescansoMax: 1, diasTrabajoMax: 6, horasPartTime: 4, horasFullTime: 8, horaRefrigerio: 1.5 },
  { puesto: 'Prevencionista', diasDescansoMax: 2, diasTrabajoMax: 5, horasPartTime: 4, horasFullTime: 9.6, horaRefrigerio: 1.5 },
]

/** Lee la Tabla de Puestos vigente. Si aún no existe el parámetro, cae a los defaults. */
export async function obtenerParametrosPuesto(): Promise<ParametroPuesto[]> {
  const hoy = new Date().toISOString().slice(0, 10)
  try {
    const p = await api<{ valor: string }>(
      `/v1/maes/configuracion/parametros/lookup?clave=${CLAVE_PARAMS_PUESTO}&fecha=${hoy}`,
    )
    return JSON.parse(p.valor) as ParametroPuesto[]
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return PARAMETROS_PUESTO_DEFAULT
    throw e
  }
}

/** Guarda una nueva versión de la Tabla de Puestos (CU-MAES-04). */
export async function guardarParametrosPuesto(lista: ParametroPuesto[]): Promise<void> {
  const idActor = useAuth.getState().usuario?.idUsuario ?? ''
  const hoy = new Date().toISOString().slice(0, 10)
  await api('/v1/maes/configuracion/parametros', {
    method: 'POST',
    body: JSON.stringify({
      modulo: 'Rol',
      flujo: null,
      nivel: null,
      nombreParametro: 'PARAMETROS_PUESTO',
      ambito: 'Global',
      idEmpresa: null,
      idAmbito: null,
      tipoDato: 'Lista',
      unidad: null,
      valor: JSON.stringify(lista),
      esImpactoNegocio: true,
      criticidadConsumo: 'Bloqueante',
      justificacion: 'Edición de la Tabla de Puestos (límites de descanso/trabajo y jornada) desde el sistema.',
      vigenciaDesde: hoy,
      esCorreccionRetroactiva: false,
      idActor,
    }),
  })
}
