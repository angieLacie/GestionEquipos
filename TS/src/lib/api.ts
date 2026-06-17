import { useAuth } from './auth'

/** Cliente HTTP fino contra la API de Nova. Inyecta el JWT Bearer de la sesión. */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuth.getState().token
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(path, { ...options, headers })
  } catch {
    // El fetch falla (red caída, servidor apagado, CORS).
    throw new ApiError('No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.', 0)
  }

  if (res.status === 401) {
    useAuth.getState().logout()
    throw new ApiError('Sesión expirada o credenciales inválidas.', 401)
  }

  if (!res.ok) {
    const detalle = await leerError(res)
    throw new ApiError(detalle, res.status)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

async function leerError(res: Response): Promise<string> {
  try {
    const body = await res.json()
    // RFC 7807 (problem+json) o ValidationProblem.
    if (body.errors?.error?.[0]) return body.errors.error[0]
    if (body.detail ?? body.title) return body.detail ?? body.title
    return mensajePorEstado(res.status)
  } catch {
    return mensajePorEstado(res.status)
  }
}

function mensajePorEstado(status: number): string {
  if (status >= 500) return 'El servidor no está disponible en este momento. Inténtalo más tarde.'
  if (status === 403) return 'No tienes permiso para realizar esta acción.'
  if (status === 404) return 'No se encontró el recurso solicitado.'
  return `No se pudo completar la solicitud (error ${status}).`
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}
