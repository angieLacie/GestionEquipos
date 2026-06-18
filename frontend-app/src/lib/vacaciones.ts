import { api, ApiError } from './api';

/**
 * Dominio del módulo Vacaciones (app móvil — perfil Gestión).
 *
 * Drill-down tienda → empleado, con saldos (indemnizables / pendientes /
 * truncos), estado de vencimiento e historial de periodos. Mock seam idéntico
 * a `gestion-equipos.ts`: `cargarVacaciones()` intenta el backend y, si el
 * módulo aún no existe (404 / shape), cae a datos de ejemplo con `esMock`.
 *
 * NOTA: el módulo backend Vacaciones todavía no está construido — ver
 * docs/software-factory/product/pendientes-y-brechas.md.
 */

export interface SaldoVac {
  indemnizables: number;
  pendientes: number;
  truncos: number;
}

export type EstadoPeriodo = 'PROGRAMADA' | 'TOMADA' | 'PENDIENTE';

export interface PeriodoVac {
  periodo: string; // "2024-2025"
  fInicio: string; // "15/05/2025"
  fFin: string; // "24/05/2025"
  dias: number; // 10
  estado: EstadoPeriodo;
}

export interface EmpleadoVac {
  id: string;
  nombre: string; // "Del Carpio Vargas, Erika"
  puesto: string; // "Asesor Senior"
  saldo: SaldoVac;
  /** true → chip rojo "⚠ Indemnizable". */
  indemnizable: boolean;
  /** Si no es indemnizable, días pendientes para el chip "N días pendientes". */
  diasPendientes?: number;
  limite: string; // "Jun 2026"
  historial: PeriodoVac[];
}

export interface TiendaVac {
  id: string;
  nombre: string; // "EL REAL CUSCO"
  total: number; // 51
  indemnizables: number;
  pendientes: number;
  truncos: number;
  empleados: EmpleadoVac[];
}

export interface VacKpis {
  indemnizables: number;
  pendientes: number;
  truncos: number;
  totales: number;
}

export interface VacacionesData {
  kpis: VacKpis;
  tiendas: TiendaVac[];
  esMock: boolean;
}

// --- Mock seam --------------------------------------------------------------

const PUESTOS = ['Asesor', 'Asesor Senior', 'Secretaria-Cajera', 'Auxiliar', 'Cajero'];
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const APELLIDOS = ['Quispe Rojas', 'Mendoza Paz', 'Ríos Vega', 'Huamán Soto', 'Flores Díaz', 'Castro Lima', 'Vargas León', 'Salas Cruz', 'Torres Mar', 'Ramos Gil'];
const NOMBRES = ['Ana María', 'Luis Alberto', 'Carla Sofía', 'José Manuel', 'Rosa Elena', 'Pedro Pablo', 'Diego Andrés', 'Sofía Lucía'];

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

/** Historial determinista de periodos pasados (todos Tomada salvo el último). */
function historialMock(seed: number, anios = 4): PeriodoVac[] {
  const out: PeriodoVac[] = [];
  for (let i = 0; i < anios; i++) {
    const y = 2025 - i;
    const mes = 3 + ((seed + i) % 7);
    const d = 1 + ((seed * (i + 1)) % 20);
    const fi = `${String(d).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${y}`;
    const ff = `${String(d + 9).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${y}`;
    out.push({
      periodo: `${y - 1}-${y}`,
      fInicio: fi,
      fFin: ff,
      dias: 10,
      estado: i === 0 ? 'PROGRAMADA' : 'TOMADA',
    });
  }
  return out;
}

function empleadosMock(tiendaId: string, n: number): EmpleadoVac[] {
  const out: EmpleadoVac[] = [];
  for (let i = 0; i < n; i++) {
    const seed = hashSeed(`${tiendaId}-${i}`);
    const indemnizable = seed % 3 !== 0;
    const indem = 1 + (seed % 6);
    const pend = 1 + ((seed >> 2) % 6);
    const trunc = 1 + ((seed >> 4) % 6);
    out.push({
      id: `${tiendaId}-E${i}`,
      nombre: `${APELLIDOS[seed % APELLIDOS.length]}, ${NOMBRES[(seed >> 3) % NOMBRES.length]}`,
      puesto: PUESTOS[seed % PUESTOS.length],
      saldo: { indemnizables: indem, pendientes: pend, truncos: trunc },
      indemnizable,
      diasPendientes: indemnizable ? undefined : pend,
      limite: `${MESES[(seed >> 1) % 12]} 2026`,
      historial: historialMock(seed),
    });
  }
  return out;
}

/** Empleados exactos de EL REAL CUSCO (calcan el mockup). */
const REAL_CUSCO_EMP: EmpleadoVac[] = [
  {
    id: 'cusco-1',
    nombre: 'Del Carpio Vargas, Erika',
    puesto: 'Asesor Senior',
    saldo: { indemnizables: 5, pendientes: 3, truncos: 5 },
    indemnizable: true,
    limite: 'Jun 2026',
    historial: [
      { periodo: '2024-2025', fInicio: '15/05/2025', fFin: '24/05/2025', dias: 10, estado: 'PROGRAMADA' },
      { periodo: '2023-2024', fInicio: '10/09/2024', fFin: '19/09/2024', dias: 10, estado: 'TOMADA' },
      { periodo: '2022-2023', fInicio: '12/06/2023', fFin: '21/06/2023', dias: 10, estado: 'TOMADA' },
      { periodo: '2021-2022', fInicio: '05/07/2022', fFin: '14/07/2022', dias: 10, estado: 'TOMADA' },
      { periodo: '2020-2021', fInicio: '08/03/2021', fFin: '17/03/2021', dias: 10, estado: 'TOMADA' },
    ],
  },
  {
    id: 'cusco-2',
    nombre: 'Delgado Gudiño, Jesús Alejandro',
    puesto: 'Asesor',
    saldo: { indemnizables: 2, pendientes: 6, truncos: 6 },
    indemnizable: true,
    limite: 'Ago 2026',
    historial: historialMock(12),
  },
  {
    id: 'cusco-3',
    nombre: 'Monteagudo Cruz, Cristian Omar',
    puesto: 'Asesor Senior',
    saldo: { indemnizables: 4, pendientes: 4, truncos: 2 },
    indemnizable: true,
    limite: 'Jul 2026',
    historial: historialMock(7),
  },
  {
    id: 'cusco-4',
    nombre: 'Suarez Palomino, Gabriel Antonio',
    puesto: 'Asesor',
    saldo: { indemnizables: 3, pendientes: 4, truncos: 3 },
    indemnizable: false,
    diasPendientes: 4,
    limite: 'Sep 2026',
    historial: historialMock(21),
  },
  {
    id: 'cusco-5',
    nombre: 'Rodríguez Maliqui, Susy Stephanie',
    puesto: 'Secretaria-Cajera',
    saldo: { indemnizables: 2, pendientes: 3, truncos: 2 },
    indemnizable: true,
    limite: 'May 2026',
    historial: historialMock(33),
  },
  {
    id: 'cusco-6',
    nombre: 'Hurtado Huaman, Mauricio Antonio',
    puesto: 'Auxiliar',
    saldo: { indemnizables: 3, pendientes: 2, truncos: 3 },
    indemnizable: true,
    limite: 'Jun 2026',
    historial: historialMock(44),
  },
];

interface TiendaSeed {
  id: string;
  nombre: string;
  total: number;
  indemnizables: number;
  pendientes: number;
  truncos: number;
  nEmpleados: number;
  empleados?: EmpleadoVac[];
}

const TIENDAS_SEED: TiendaSeed[] = [
  { id: 'cusco', nombre: 'EL REAL CUSCO', total: 51, indemnizables: 19, pendientes: 13, truncos: 19, nEmpleados: 6, empleados: REAL_CUSCO_EMP },
  { id: 'polo', nombre: 'EL C.C. EL POLO', total: 46, indemnizables: 10, pendientes: 17, truncos: 19, nEmpleados: 7 },
  { id: 'comas', nombre: 'EL MALL COMAS', total: 44, indemnizables: 20, pendientes: 17, truncos: 7, nEmpleados: 7 },
  { id: 'ica', nombre: 'EL ICA CENTRO', total: 42, indemnizables: 17, pendientes: 17, truncos: 8, nEmpleados: 6 },
  { id: 'huanuco', nombre: 'EL HUANUCO', total: 35, indemnizables: 5, pendientes: 15, truncos: 15, nEmpleados: 5 },
  { id: 'union', nombre: 'EL JR. DE LA UNION', total: 22, indemnizables: 11, pendientes: 5, truncos: 6, nEmpleados: 4 },
];

function tiendasMock(): TiendaVac[] {
  return TIENDAS_SEED.map((t) => ({
    id: t.id,
    nombre: t.nombre,
    total: t.total,
    indemnizables: t.indemnizables,
    pendientes: t.pendientes,
    truncos: t.truncos,
    empleados: t.empleados ?? empleadosMock(t.id, t.nEmpleados),
  }));
}

function kpisDesdeTiendas(tiendas: TiendaVac[]): VacKpis {
  return {
    indemnizables: tiendas.reduce((s, t) => s + t.indemnizables, 0),
    pendientes: tiendas.reduce((s, t) => s + t.pendientes, 0),
    truncos: tiendas.reduce((s, t) => s + t.truncos, 0),
    totales: tiendas.reduce((s, t) => s + t.total, 0),
  };
}

function datosMock(): VacacionesData {
  const tiendas = tiendasMock();
  return { kpis: kpisDesdeTiendas(tiendas), tiendas, esMock: true };
}

// --- Carga ------------------------------------------------------------------

/**
 * Carga el módulo de Vacaciones. Intenta el backend; si no existe (404 / 5xx /
 * shape) cae al mock. Errores de red o 401 se propagan a la UI.
 */
export async function cargarVacaciones(token: string): Promise<VacacionesData> {
  try {
    const data = await api.vacaciones(token);
    if (data && Array.isArray(data.tiendas) && data.tiendas.length > 0) {
      return { ...data, esMock: false };
    }
    return datosMock();
  } catch (e) {
    if (e instanceof ApiError && (e.kind === 'network' || e.kind === 'unauthorized')) {
      throw e;
    }
    return datosMock();
  }
}

// --- Acción (mock) ----------------------------------------------------------

/**
 * Programa vacaciones para un empleado. MOCK: simula latencia y devuelve una
 * referencia. // TODO: conectar al backend de Vacaciones cuando exista.
 */
export async function programarVacaciones(input: {
  idEmpleado: string;
  desde: string;
  hasta: string;
  dias: number;
}): Promise<{ ref: string }> {
  await new Promise((r) => setTimeout(r, 600));
  return { ref: `VAC-${Date.now().toString(36).toUpperCase()}` };
}

/** Cuenta días inclusivos entre dos fechas dd/mm/aaaa; 0 si inválido. */
export function diasEntre(desde: string, hasta: string): number {
  const p = (s: string) => {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s.trim());
    return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : null;
  };
  const a = p(desde);
  const b = p(hasta);
  if (!a || !b) return 0;
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
  return diff > 0 ? diff : 0;
}
