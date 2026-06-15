import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '@/lib/auth'

/** Bloquea rutas sin sesión JWT (redirige a login). */
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const token = useAuth((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/auth/login" replace />
}

export default ProtectedRoute
