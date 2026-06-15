import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '@/lib/auth'
import { puedeAcceder } from '@/lib/acl'

/**
 * Control de acceso por rol a nivel ruta (no solo menú). Si la sesión no cubre
 * los roles requeridos, redirige al dashboard. `roles` vacío/ausente = libre.
 */
const RequireRoles = ({ roles, children }: { roles?: string[]; children: ReactNode }) => {
  const rolesSesion = useAuth((s) => s.roles)
  return puedeAcceder(rolesSesion, roles) ? <>{children}</> : <Navigate to="/dashboards/control-center" replace />
}

export default RequireRoles
