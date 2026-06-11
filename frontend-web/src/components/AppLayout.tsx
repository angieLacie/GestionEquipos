import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Toaster } from './Toaster'
import { toast } from '../lib/ui'

interface NavDef {
  id: string
  icono: string
  label: string
  ruta?: string // sin ruta => módulo aún no construido
}

// Menú alineado a prototipo-ux-v2/gestion-equipos.html. Sin ruta => "en construcción".
const NAV: NavDef[] = [
  { id: 'inicio', icono: '🏠', label: 'Inicio' },
  { id: 'equipos', icono: '👥', label: 'Gestión de Equipos' },
  { id: 'rol', icono: '📅', label: 'Rol de Personal', ruta: '/rol' },
  { id: 'vacaciones', icono: '🏖️', label: 'Vacaciones' },
  { id: 'descansos', icono: '🛏️', label: 'Descansos y Comp.' },
  { id: 'encargatura', icono: '🔄', label: 'Encargatura' },
  { id: 'ascenso', icono: '⬆️', label: 'Ascenso Senior' },
  { id: 'reportes', icono: '📊', label: 'Reportes' },
  { id: 'marcaciones', icono: '🕐', label: 'Marcaciones' },
  { id: 'aprobaciones', icono: '🔀', label: 'Flujos de Aprobación' },
  { id: 'maestros', icono: '⚙️', label: 'Configuración', ruta: '/maestros' },
]

/** Shell de la app (sidebar + topbar) alineado a prototipo-ux-v2/gestion-equipos.html. */
export function AppLayout({
  active,
  title,
  actions,
  children,
}: {
  active: string
  title: string
  actions?: ReactNode
  children: ReactNode
}) {
  const navigate = useNavigate()
  const usuario = useAuth((s) => s.usuario)
  const logout = useAuth((s) => s.logout)
  const iniciales = (usuario?.nombreUsuario ?? '?').slice(0, 2).toUpperCase()

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">◆</span>
          <span className="brand-name">Nova</span>
        </div>
        <nav className="nav-menu">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={n.id === active ? 'nav-item active' : 'nav-item'}
              onClick={() => (n.ruta ? navigate(n.ruta) : toast.info(`${n.label}: módulo en construcción.`))}
            >
              <span className="nav-icon">{n.icono}</span>
              <span className="nav-label">{n.label}</span>
              {!n.ruta && <span className="nav-soon">pronto</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-avatar-sm">{iniciales}</div>
          <div className="user-info-sm">
            <div className="name">{usuario?.nombreUsuario}</div>
            <div className="role">Administrador</div>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <span className="page-title">{title}</span>
          <div className="topbar-actions">
            {actions}
            <button className="btn-salir" onClick={logout}>
              Salir
            </button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
