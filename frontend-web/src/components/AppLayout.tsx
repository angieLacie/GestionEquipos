import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

interface NavDef {
  id: string
  icono: string
  label: string
  ruta: string
}

const NAV: NavDef[] = [
  { id: 'maestros', icono: '🗂️', label: 'Maestros', ruta: '/maestros' },
  { id: 'rol', icono: '📅', label: 'Rol de Personal', ruta: '/rol' },
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
              onClick={() => navigate(n.ruta)}
            >
              <span className="nav-icon">{n.icono}</span>
              <span className="nav-label">{n.label}</span>
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
    </div>
  )
}
