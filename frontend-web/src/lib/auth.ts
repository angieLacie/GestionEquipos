import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Sesion {
  idUsuario: string
  nombreUsuario: string
  requiereCambioPassword: boolean
  token: string
}

interface AuthState {
  token: string | null
  usuario: Pick<Sesion, 'idUsuario' | 'nombreUsuario'> | null
  setSesion: (s: Sesion) => void
  logout: () => void
}

/** Estado de sesión persistido (JWT de /v1/segu/auth/login). */
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      setSesion: (s) =>
        set({ token: s.token, usuario: { idUsuario: s.idUsuario, nombreUsuario: s.nombreUsuario } }),
      logout: () => set({ token: null, usuario: null }),
    }),
    { name: 'nova-auth' },
  ),
)
