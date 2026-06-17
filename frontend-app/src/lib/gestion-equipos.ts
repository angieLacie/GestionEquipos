import { api, ApiError } from './api';
import type {
  AsesorItem,
  GestionKpis,
  RosterEmpleado,
  TiendaResumen,
  ZonaDetalle,
  ZonaResumen,
} from './types';

export interface GestionData {
  kpis: GestionKpis;
  /** Detalle jerárquico zona -> tienda -> asesores. */
  zonas: ZonaDetalle[];
  /** true si los datos provienen del mock (backend no disponible / shape insuficiente). */
  esMock: boolean;
}

// --- Mock seam --------------------------------------------------------------
// TODO: backend de resumen. Idealmente el backend expone
// GET /v1/maes/empleados/resumen con plantilla/activos/cobertura/DM/VAC/LIC
// ya agregados por zona y tienda, además del encargado y la vigencia por
// asesor. Mientras tanto, agregamos desde el roster lo que se pueda y
// completamos DM/VAC/LIC/cobertura/encargado/vigencia con valores de ejemplo.

const NOMBRES_MOCK = [
  'Ana Quispe Rojas', 'Luis Mendoza Paz', 'Carla Ríos Vega', 'José Huamán Soto',
  'María Flores Díaz', 'Pedro Castro Lima', 'Rosa Vargas León', 'Jorge Salas Cruz',
  'Elena Torres Mar', 'Diego Ramos Gil', 'Sofía Núñez Ríos', 'Iván Cáceres Luna',
];
const PUESTOS_MOCK = ['Asesor de ventas', 'Asesor senior', 'Cajero', 'Anfitrión'];

/** PRNG determinista para que el mock sea estable entre renders. */
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 1000;
}

function fechaMock(seed: number, offsetDias: number): string {
  const base = new Date(2026, 0, 1);
  base.setDate(base.getDate() + (seed % 90) + offsetDias);
  const dd = String(base.getDate()).padStart(2, '0');
  const mm = String(base.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${base.getFullYear()}`;
}

function tiendasMock(zona: string, n: number): TiendaResumen[] {
  const tiendas: TiendaResumen[] = [];
  for (let t = 0; t < n; t++) {
    const seed = hashSeed(`${zona}-${t}`);
    const nAsesores = 6 + (seed % 8);
    const asesores: AsesorItem[] = [];
    let activos = 0;
    let dm = 0;
    let vac = 0;
    let lic = 0;
    for (let a = 0; a < nAsesores; a++) {
      const s2 = hashSeed(`${zona}-${t}-${a}`);
      const esSenior = s2 % 5 === 0;
      const tipo = s2 % 11;
      let estado = 'ACTIVO';
      let activo = true;
      if (tipo === 0) { estado = 'DESCANSO_MEDICO'; activo = false; dm += 1; }
      else if (tipo === 1) { estado = 'VACACIONES'; activo = false; vac += 1; }
      else if (tipo === 2) { estado = 'LICENCIA'; activo = false; lic += 1; }
      else { activos += 1; }
      asesores.push({
        id: `${zona}-${t}-${a}`,
        nombreCompleto: NOMBRES_MOCK[s2 % NOMBRES_MOCK.length],
        puesto: esSenior ? 'Asesor senior' : PUESTOS_MOCK[s2 % PUESTOS_MOCK.length],
        esSenior,
        estado,
        activo,
        vigenciaDesde: fechaMock(s2, 0),
        vigenciaHasta: fechaMock(s2, 120),
      });
    }
    const plantilla = asesores.length;
    tiendas.push({
      id: `${zona}-T${t + 1}`,
      nombre: `Tienda ${zona} ${String.fromCharCode(65 + t)}`,
      encargado: NOMBRES_MOCK[seed % NOMBRES_MOCK.length],
      kpis: {
        plantilla,
        activos,
        coberturaPct: plantilla > 0 ? Math.round((activos / plantilla) * 100) : 0,
        descansoMedico: dm,
        vacaciones: vac,
        licencias: lic,
      },
      asesores,
    });
  }
  return tiendas;
}

const ZONAS_MOCK: ZonaDetalle[] = [
  { zona: 'LIMA SUR', tiendas: tiendasMock('LIMA SUR', 8) },
  { zona: 'LIMA NORTE', tiendas: tiendasMock('LIMA NORTE', 7) },
  { zona: 'LIMA ESTE', tiendas: tiendasMock('LIMA ESTE', 5) },
  { zona: 'CALLAO', tiendas: tiendasMock('CALLAO', 4) },
  { zona: 'PROVINCIAS', tiendas: tiendasMock('PROVINCIAS', 11) },
].map((z) => ({ ...z, kpis: kpisDesdeTiendas(z.tiendas) }));

// --- Roster real ------------------------------------------------------------

function estadoNormalizado(estado: unknown): string {
  return String(estado ?? '').trim().toUpperCase();
}

function esDescansoMedico(e: string): boolean {
  return e.includes('DESCANSO') || e === 'DM';
}
function esVacaciones(e: string): boolean {
  return e.includes('VACAC') || e === 'VAC';
}
function esLicencia(e: string): boolean {
  return e.includes('LICEN') || e === 'LIC';
}
function esActivo(e: string): boolean {
  return e === 'ACTIVO' || e === 'A' || e === '';
}

function normalizarFecha(raw: unknown): string | undefined {
  const s = String(raw ?? '').trim();
  if (!s) return undefined;
  // ISO -> dd/mm/aaaa
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  return s;
}

function kpisDesdeAsesores(asesores: AsesorItem[]): GestionKpis {
  let activos = 0;
  let dm = 0;
  let vac = 0;
  let lic = 0;
  for (const a of asesores) {
    const e = estadoNormalizado(a.estado);
    if (esDescansoMedico(e)) dm += 1;
    else if (esVacaciones(e)) vac += 1;
    else if (esLicencia(e)) lic += 1;
    else if (a.activo) activos += 1;
  }
  const plantilla = asesores.length;
  return {
    plantilla,
    activos,
    coberturaPct: plantilla > 0 ? Math.round((activos / plantilla) * 100) : 0,
    descansoMedico: dm,
    vacaciones: vac,
    licencias: lic,
  };
}

function kpisDesdeTiendas(tiendas: TiendaResumen[]): GestionKpis {
  const plantilla = tiendas.reduce((s, t) => s + t.kpis.plantilla, 0);
  const activos = tiendas.reduce((s, t) => s + t.kpis.activos, 0);
  return {
    plantilla,
    activos,
    coberturaPct: plantilla > 0 ? Math.round((activos / plantilla) * 100) : 0,
    descansoMedico: tiendas.reduce((s, t) => s + t.kpis.descansoMedico, 0),
    vacaciones: tiendas.reduce((s, t) => s + t.kpis.vacaciones, 0),
    licencias: tiendas.reduce((s, t) => s + t.kpis.licencias, 0),
  };
}

function kpisDesdeZonas(zonas: ZonaDetalle[]): GestionKpis {
  const plantilla = zonas.reduce((s, z) => s + z.kpis.plantilla, 0);
  const activos = zonas.reduce((s, z) => s + z.kpis.activos, 0);
  return {
    plantilla,
    activos,
    coberturaPct: plantilla > 0 ? Math.round((activos / plantilla) * 100) : 0,
    descansoMedico: zonas.reduce((s, z) => s + z.kpis.descansoMedico, 0),
    vacaciones: zonas.reduce((s, z) => s + z.kpis.vacaciones, 0),
    licencias: zonas.reduce((s, z) => s + z.kpis.licencias, 0),
  };
}

/**
 * Agrega el roster en jerarquía zona -> tienda -> asesores.
 * Devuelve null si el shape no permite agrupar (sin zona).
 */
function agregarRoster(roster: RosterEmpleado[]): ZonaDetalle[] | null {
  if (!Array.isArray(roster) || roster.length === 0) return null;
  const tieneZona = roster.some((r) => r.zona != null && String(r.zona).trim() !== '');
  if (!tieneZona) return null;

  // zona -> (tienda -> asesores)
  const zonasMap = new Map<string, Map<string, AsesorItem[]>>();
  // encargado por tienda (mock seam: el roster podría traerlo en un campo dedicado)
  const encargados = new Map<string, string>();

  roster.forEach((r, idx) => {
    const zona = String(r.zona ?? 'SIN ZONA').trim().toUpperCase();
    const tienda = String(r.tienda ?? 'SIN TIENDA').trim() || 'SIN TIENDA';
    const e = estadoNormalizado(r.estado);
    const nombre = String(r.nombreCompleto ?? `Empleado ${idx + 1}`).trim();
    const esSenior = r.esSenior === true || /SENIOR/i.test(String(r.puesto ?? ''));

    const asesor: AsesorItem = {
      id: String(r.idEmpleado ?? `${zona}-${tienda}-${idx}`),
      nombreCompleto: nombre,
      puesto: String(r.puesto ?? 'Asesor de ventas').trim() || 'Asesor de ventas',
      esSenior,
      estado: e || 'ACTIVO',
      activo: esActivo(e),
      vigenciaDesde: normalizarFecha(r.vigenciaDesde),
      vigenciaHasta: normalizarFecha(r.vigenciaHasta),
    };

    if (!zonasMap.has(zona)) zonasMap.set(zona, new Map());
    const tiendasMap = zonasMap.get(zona)!;
    if (!tiendasMap.has(tienda)) tiendasMap.set(tienda, []);
    tiendasMap.get(tienda)!.push(asesor);

    // TODO: backend resumen — encargado de tienda. Si el roster lo trae en un
    // campo dedicado úsalo; aquí tomamos el primer senior o el primer asesor.
    if (!encargados.has(`${zona}|${tienda}`) || esSenior) {
      encargados.set(`${zona}|${tienda}`, nombre);
    }
  });

  return Array.from(zonasMap.entries()).map(([zona, tiendasMap]) => {
    const tiendas: TiendaResumen[] = Array.from(tiendasMap.entries()).map(([nombre, asesores]) => ({
      id: `${zona}|${nombre}`,
      nombre,
      encargado: encargados.get(`${zona}|${nombre}`) ?? '—',
      kpis: kpisDesdeAsesores(asesores),
      asesores,
    }));
    return { zona, kpis: kpisDesdeTiendas(tiendas), tiendas };
  });
}

/** Aplana las zonas a la forma agregada `ZonaResumen` (compat / buscador). */
export function aResumenZonas(zonas: ZonaDetalle[]): ZonaResumen[] {
  return zonas.map((z) => ({
    zona: z.zona,
    plantilla: z.kpis.plantilla,
    activos: z.kpis.activos,
    tiendas: z.tiendas.length,
    descansoMedico: z.kpis.descansoMedico,
    vacaciones: z.kpis.vacaciones,
    licencias: z.kpis.licencias,
    coberturaPct: z.kpis.coberturaPct,
  }));
}

/** Opción de tienda para selects (id + nombre + zona). */
export interface OpcionTienda {
  id: string;
  nombre: string;
  zona: string;
}

/** Aplana la jerarquía zona->tienda a una lista plana para los selects de acciones. */
export function listarTiendas(zonas: ZonaDetalle[]): OpcionTienda[] {
  const out: OpcionTienda[] = [];
  for (const z of zonas) {
    for (const t of z.tiendas) {
      out.push({ id: t.id, nombre: t.nombre, zona: z.zona });
    }
  }
  return out;
}

/** Busca una tienda por id en toda la jerarquía. */
export function buscarTienda(zonas: ZonaDetalle[], id: string): TiendaResumen | undefined {
  for (const z of zonas) {
    const t = z.tiendas.find((tt) => tt.id === id);
    if (t) return t;
  }
  return undefined;
}

/**
 * Carga los datos de Gestión de Equipos. Intenta el roster real;
 * si el endpoint no existe (404/ApiError) o el shape no permite agrupar,
 * cae al mock con un flag claro.
 */
export async function cargarGestionEquipos(token: string): Promise<GestionData> {
  try {
    const roster = await api.rosterEmpleados(token);
    const zonas = agregarRoster(roster);
    if (zonas && zonas.length > 0) {
      return { kpis: kpisDesdeZonas(zonas), zonas, esMock: false };
    }
    // Shape insuficiente -> mock.
    return { kpis: kpisDesdeZonas(ZONAS_MOCK), zonas: ZONAS_MOCK, esMock: true };
  } catch (e) {
    // Errores de red/401 se propagan para que la UI los muestre.
    if (e instanceof ApiError && (e.kind === 'network' || e.kind === 'unauthorized')) {
      throw e;
    }
    // 404 / 5xx / shape: usamos el mock.
    return { kpis: kpisDesdeZonas(ZONAS_MOCK), zonas: ZONAS_MOCK, esMock: true };
  }
}
