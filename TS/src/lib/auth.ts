import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Sesion {
  idUsuario: string
  nombreUsuario: string
  requiereCambioPassword: boolean
  token: string
  roles: string[]
}

interface AuthState {
  token: string | null
  usuario: Pick<Sesion, 'idUsuario' | 'nombreUsuario'> | null
  roles: string[]
  setSesion: (s: Sesion) => void
  logout: () => void
  tieneRol: (idRol: string) => boolean
}

/** Estado de sesión persistido (JWT de /v1/segu/auth/login). */
export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      usuario: null,
      roles: [],
      setSesion: (s) =>
        set({
          token: s.token,
          usuario: { idUsuario: s.idUsuario, nombreUsuario: s.nombreUsuario },
          roles: s.roles ?? [],
        }),
      logout: () => set({ token: null, usuario: null, roles: [] }),
      tieneRol: (idRol) => get().roles.includes(idRol),
    }),
    { name: 'nova-auth' },
  ),
)
