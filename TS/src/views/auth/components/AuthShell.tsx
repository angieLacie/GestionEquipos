import type { ReactNode } from 'react'
import AuthBrandPanel from './AuthBrandPanel.tsx'

interface AuthShellProps {
  children: ReactNode
}

/**
 * Layout overlay self-contained para pantallas de auth: split 50/50.
 * Panel de marca fijo a la izquierda + contenido (formulario / pasos) a la derecha.
 * Es `position-fixed` con zIndex 1050 para no depender del fondo del AuthLayout.
 */
const AuthShell = ({ children }: AuthShellProps) => {
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1050, background: '#fff', overflowY: 'auto' }}>
      <div className="row g-0 min-vh-100">
        <AuthBrandPanel />
        <div className="col-lg-6 col-12 d-flex align-items-center justify-content-center p-4" style={{ color: '#1e293b' }}>
          <div className="w-100" style={{ maxWidth: 440 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthShell
