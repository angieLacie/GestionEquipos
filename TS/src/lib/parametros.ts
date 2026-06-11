import { api } from './api'
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
