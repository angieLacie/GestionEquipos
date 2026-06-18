import { API_URL, REQUEST_TIMEOUT } from './config';
import type { LoginResponse, RosterEmpleado } from './types';
import type { AprobacionesData } from './aprobaciones';
import type { VacacionesData } from './vacaciones';
import type { AmpliacionesData } from './ampliaciones';

/** Error de API con clasificación para que la UI muestre el mensaje correcto. */
export class ApiError extends Error {
  readonly kind: 'network' | 'unauthorized' | 'server' | 'client' | 'parse';
  readonly status?: number;

  constructor(
    kind: ApiError['kind'],
    message: string,
    status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = opts;
  const url = `${API_URL}${path}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: opts.signal ?? controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    const aborted = err instanceof Error && err.name === 'AbortError';
    throw new ApiError(
      'network',
      aborted
        ? 'La conexión tardó demasiado. Verifica tu red e inténtalo de nuevo.'
        : 'No se pudo conectar con el servidor. Revisa tu conexión a internet.',
    );
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 401) {
    throw new ApiError('unauthorized', 'Sesión no válida o credenciales incorrectas.', 401);
  }
  if (res.status >= 500) {
    throw new ApiError('server', 'El servidor presentó un error. Inténtalo más tarde.', res.status);
  }
  if (!res.ok) {
    let detail = `Error ${res.status}.`;
    try {
      const data = (await res.json()) as { message?: string; title?: string };
      detail = data.message ?? data.title ?? detail;
    } catch {
      // sin cuerpo legible
    }
    throw new ApiError('client', detail, res.status);
  }

  // 204 sin cuerpo
  if (res.status === 204) return undefined as T;

  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError('parse', 'La respuesta del servidor no es válida.');
  }
}

export const api = {
  /** POST /v1/segu/auth/login */
  login(nombreUsuario: string, password: string, signal?: AbortSignal): Promise<LoginResponse> {
    return request<LoginResponse>('/v1/segu/auth/login', {
      method: 'POST',
      body: { nombreUsuario, password },
      signal,
    });
  },

  /**
   * GET /v1/maes/empleados/roster
   * Endpoint tentativo. Si el backend aún no lo expone, el repositorio de
   * Gestión de Equipos captura el ApiError y cae al mock.
   */
  rosterEmpleados(token: string, signal?: AbortSignal): Promise<RosterEmpleado[]> {
    return request<RosterEmpleado[]>('/v1/maes/empleados/roster', { token, signal });
  },

  /**
   * GET /v1/apro/bandejas
   * Endpoint tentativo del módulo Aprobaciones (motor de flujos F0, aún no
   * construido). Si el backend no lo expone, `cargarAprobaciones` cae al mock.
   */
  aprobaciones(token: string, signal?: AbortSignal): Promise<AprobacionesData> {
    return request<AprobacionesData>('/v1/apro/bandejas', { token, signal });
  },

  /**
   * GET /v1/vaca/tiendas
   * Endpoint tentativo del módulo Vacaciones (aún no construido). Si el backend
   * no lo expone, `cargarVacaciones` cae al mock.
   */
  vacaciones(token: string, signal?: AbortSignal): Promise<VacacionesData> {
    return request<VacacionesData>('/v1/vaca/tiendas', { token, signal });
  },

  /**
   * GET /v1/ampl/historial
   * Endpoint tentativo del módulo Ampliaciones (aún no construido). Si el
   * backend no lo expone, `cargarAmpliaciones` cae al mock.
   */
  ampliaciones(token: string, signal?: AbortSignal): Promise<AmpliacionesData> {
    return request<AmpliacionesData>('/v1/ampl/historial', { token, signal });
  },
};
