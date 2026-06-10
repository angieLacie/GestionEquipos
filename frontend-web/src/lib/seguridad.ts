import { api } from './api'
import type { Sesion } from './auth'

export interface LoginBody {
  nombreUsuario: string
  password: string
}

/** CU-SEGU-02: autenticación, devuelve JWT de sesión. */
export const login = (body: LoginBody) =>
  api<Sesion>('/v1/segu/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
