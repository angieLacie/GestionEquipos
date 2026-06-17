import { api, ApiError } from './api';
import type { GestionKpis, RosterEmpleado, ZonaResumen } from './types';

export interface GestionData {
  kpis: GestionKpis;
  zonas: ZonaResumen[];
  /** true si los datos provienen del mock (backend no disponible / shape insuficiente). */
  esMock: boolean;
}

// --- Mock seam --------------------------------------------------------------
// TODO: backend de resumen por zona. Idealmente el backend expone
// GET /v1/maes/empleados/resumen-zonas con plantilla/activos/cobertura ya
// agregados. Mientras tanto, agregamos desde el roster lo que se pueda y
// completamos con estos valores de ejemplo.
const ZONAS_MOCK: ZonaResumen[] = [
  { zona: 'LIMA SUR', plantilla: 120, activos: 112, tiendas: 8, descansoMedico: 3, vacaciones: 4, licencias: 1, coberturaPct: 96 },
  { zona: 'LIMA NORTE', plantilla: 98, activos: 86, tiendas: 7, descansoMedico: 5, vacaciones: 6, licencias: 1, coberturaPct: 88 },
  { zona: 'LIMA ESTE', plantilla: 76, activos: 70, tiendas: 5, descansoMedico: 2, vacaciones: 3, licencias: 1, coberturaPct: 92 },
  { zona: 'CALLAO', plantilla: 54, activos: 48, tiendas: 4, descansoMedico: 2, vacaciones: 3, licencias: 1, coberturaPct: 89 },
  { zona: 'PROVINCIAS', plantilla: 140, activos: 134, tiendas: 11, descansoMedico: 2, vacaciones: 3, licencias: 1, coberturaPct: 96 },
];

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

/** Agrega el roster por zona. Devuelve null si el shape no permite agrupar. */
function agregarRoster(roster: RosterEmpleado[]): ZonaResumen[] | null {
  if (!Array.isArray(roster) || roster.length === 0) return null;
  const tieneZona = roster.some((r) => r.zona != null && String(r.zona).trim() !== '');
  if (!tieneZona) return null;

  const acc = new Map<
    string,
    { plantilla: number; activos: number; tiendas: Set<string>; dm: number; vac: number; lic: number }
  >();

  for (const r of roster) {
    const zona = String(r.zona ?? 'SIN ZONA').trim().toUpperCase();
    const e = estadoNormalizado(r.estado);
    const cur =
      acc.get(zona) ?? { plantilla: 0, activos: 0, tiendas: new Set<string>(), dm: 0, vac: 0, lic: 0 };
    cur.plantilla += 1;
    if (r.tienda != null && String(r.tienda).trim() !== '') {
      cur.tiendas.add(String(r.tienda).trim());
    }
    if (esDescansoMedico(e)) cur.dm += 1;
    else if (esVacaciones(e)) cur.vac += 1;
    else if (esLicencia(e)) cur.lic += 1;
    else if (esActivo(e)) cur.activos += 1;
    acc.set(zona, cur);
  }

  return Array.from(acc.entries()).map(([zona, v]) => {
    const coberturaPct = v.plantilla > 0 ? Math.round((v.activos / v.plantilla) * 100) : 0;
    return {
      zona,
      plantilla: v.plantilla,
      activos: v.activos,
      tiendas: v.tiendas.size,
      descansoMedico: v.dm,
      vacaciones: v.vac,
      licencias: v.lic,
      coberturaPct,
    };
  });
}

function kpisDesdeZonas(zonas: ZonaResumen[]): GestionKpis {
  const plantilla = zonas.reduce((s, z) => s + z.plantilla, 0);
  const activos = zonas.reduce((s, z) => s + z.activos, 0);
  return {
    plantilla,
    activos,
    coberturaPct: plantilla > 0 ? Math.round((activos / plantilla) * 100) : 0,
    descansoMedico: zonas.reduce((s, z) => s + z.descansoMedico, 0),
    vacaciones: zonas.reduce((s, z) => s + z.vacaciones, 0),
    licencias: zonas.reduce((s, z) => s + z.licencias, 0),
  };
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
