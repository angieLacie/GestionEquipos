import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

/** Bloquea rutas sin sesión JWT (redirige a login). */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAuth((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}
