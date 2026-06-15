// ⚠️ DATOS MOCK — bitácora de marcaciones biométricas (prototipo).
// La fuente real (vista RMS / dispositivo biométrico) aún no está conectada.
// Mantener la firma de `listarMarcaciones` para enchufar el backend sin tocar la vista.

export type EstadoMarcacion = 'Completo' | 'EnTienda' | 'SinMarcacion' | 'Descanso' | 'Vacaciones'

/** Una fila de la bitácora de marcaciones del día. */
export interface Marcacion {
  id: number
  empleado: string
  dni: string
  puesto: string
  zona: string
  tienda: string
  /** Hora de ingreso 24h "HH:mm:ss" o null si no marcó. */
  horaIngreso: string | null
  /** Hora de salida 24h "HH:mm:ss" o null. */
  horaSalida: string | null
  estado: EstadoMarcacion
}

const MOCK: Marcacion[] = [
  { id: 1, empleado: 'Huapaya Ruiz, Hugo Sandro', dni: '10066342', puesto: 'Gerente de Tienda', zona: 'Lima Sur', tienda: 'San Borja', horaIngreso: null, horaSalida: null, estado: 'SinMarcacion' },
  { id: 2, empleado: 'García López, María Elena', dni: '47234561', puesto: 'Jefe de Piso', zona: 'Lima Sur', tienda: 'San Borja', horaIngreso: '08:01:12', horaSalida: '17:05:48', estado: 'Completo' },
  { id: 3, empleado: 'Torres Sánchez, Elena', dni: '48234567', puesto: 'Supervisora de Sección', zona: 'Lima Sur', tienda: 'San Borja', horaIngreso: '07:58:33', horaSalida: null, estado: 'EnTienda' },
  { id: 4, empleado: 'Mendoza Flores, Carlos Raúl', dni: '48765432', puesto: 'Asesor Senior', zona: 'Lima Sur', tienda: 'San Borja', horaIngreso: '08:10:05', horaSalida: '16:58:21', estado: 'Completo' },
  { id: 5, empleado: 'Quispe Mamani, Ana Rosa', dni: '45678901', puesto: 'Asesor de Ventas', zona: 'Lima Sur', tienda: 'San Borja', horaIngreso: '08:03:50', horaSalida: null, estado: 'EnTienda' },
  { id: 6, empleado: 'Ramos Condori, Luis Miguel', dni: '49123456', puesto: 'Asesor de Ventas', zona: 'Lima Centro', tienda: 'Jockey Plaza', horaIngreso: '08:22:09', horaSalida: null, estado: 'EnTienda' },
  { id: 7, empleado: 'Vargas Cruz, Rosa María', dni: '46543210', puesto: 'Secretaria-Cajera', zona: 'Lima Centro', tienda: 'Jockey Plaza', horaIngreso: '09:00:41', horaSalida: '18:12:30', estado: 'Completo' },
  { id: 8, empleado: 'Ccopa Huanca, Pedro Jesús', dni: '47890123', puesto: 'Reponedor', zona: 'Lima Centro', tienda: 'Jockey Plaza', horaIngreso: null, horaSalida: null, estado: 'Descanso' },
  { id: 9, empleado: 'Lozano Ríos, Carla Beatriz', dni: '48012345', puesto: 'Promotora', zona: 'Lima Norte', tienda: 'Mega Plaza', horaIngreso: '08:15:17', horaSalida: null, estado: 'EnTienda' },
  { id: 10, empleado: 'Herrera Tello, Marco Antonio', dni: '47654321', puesto: 'Prevención', zona: 'Lima Norte', tienda: 'Mega Plaza', horaIngreso: null, horaSalida: null, estado: 'Vacaciones' },
  { id: 11, empleado: 'Salazar Quispe, Diego', dni: '45901234', puesto: 'Asesor de Ventas', zona: 'Lima Norte', tienda: 'Plaza Norte', horaIngreso: '08:05:00', horaSalida: '17:30:10', estado: 'Completo' },
  { id: 12, empleado: 'Prado Ríos, Lucía', dni: '46012398', puesto: 'Asesor Senior', zona: 'Lima Centro', tienda: 'Jesús María', horaIngreso: '08:12:44', horaSalida: null, estado: 'EnTienda' },
]

export interface MarcacionFiltro {
  fecha?: string
  zona?: string
  tienda?: string
  estado?: EstadoMarcacion
  busqueda?: string
}

/** Lista las marcaciones del día aplicando filtros (MOCK; simula latencia de red). */
export function listarMarcaciones(f: MarcacionFiltro = {}): Promise<Marcacion[]> {
  const q = (f.busqueda ?? '').trim().toLowerCase()
  const items = MOCK.filter((m) =>
    (!f.zona || m.zona === f.zona) &&
    (!f.tienda || m.tienda === f.tienda) &&
    (!f.estado || m.estado === f.estado) &&
    (!q || m.empleado.toLowerCase().includes(q) || m.dni.includes(q)),
  )
  return new Promise((resolve) => setTimeout(() => resolve(items), 150))
}

/** Catálogos derivados (mientras no haya backend). */
export const zonasMock = [...new Set(MOCK.map((m) => m.zona))].sort()
export const tiendasMock = [...new Set(MOCK.map((m) => m.tienda))].sort()
