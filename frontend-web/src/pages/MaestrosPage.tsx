import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../lib/auth'
import {
  listarEmpresas,
  listarRoles,
  listarPermisos,
  listarParametros,
} from '../lib/maestros'

type Seccion = 'empresas' | 'roles' | 'permisos' | 'parametros'

const NAV: { id: Seccion; icono: string; label: string }[] = [
  { id: 'empresas', icono: '🏢', label: 'Empresas' },
  { id: 'roles', icono: '🛡️', label: 'Roles' },
  { id: 'permisos', icono: '🔑', label: 'Permisos' },
  { id: 'parametros', icono: '⚙️', label: 'Parámetros' },
]

export function MaestrosPage() {
  const [sec, setSec] = useState<Seccion>('empresas')
  const usuario = useAuth((s) => s.usuario)
  const logout = useAuth((s) => s.logout)
  const titulo = NAV.find((n) => n.id === sec)!.label
  const iniciales = (usuario?.nombreUsuario ?? '?').slice(0, 2).toUpperCase()

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">◆</span>
          <span className="brand-name">Nova · Maestros</span>
        </div>
        <nav className="nav-menu">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={n.id === sec ? 'nav-item active' : 'nav-item'}
              onClick={() => setSec(n.id)}
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
          <span className="page-title">{titulo}</span>
          <div className="topbar-actions">
            <button className="btn-salir" onClick={logout}>
              Salir
            </button>
          </div>
        </header>

        <main className="content">
          {sec === 'empresas' && <Empresas />}
          {sec === 'roles' && <Roles />}
          {sec === 'permisos' && <Permisos />}
          {sec === 'parametros' && <Parametros />}
        </main>
      </div>
    </div>
  )
}

function Estado({ cargando, error }: { cargando: boolean; error: unknown }) {
  if (cargando) return <p className="muted">Cargando…</p>
  if (error) return <p className="error">{(error as Error).message}</p>
  return null
}

function Empresas() {
  const { data, isLoading, error } = useQuery({ queryKey: ['empresas'], queryFn: listarEmpresas })
  return (
    <section className="tarjeta">
      <h2>Empresas / cadenas</h2>
      <Estado cargando={isLoading} error={error} />
      {data && (
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Inicio semana</th>
              <th>Cobertura tipo venta</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.map((e) => (
              <tr key={e.codigo}>
                <td>
                  <strong>{e.codigo}</strong>
                </td>
                <td>{e.nombre}</td>
                <td>{e.diaInicioSemana}</td>
                <td>{e.existeCoberturaTipoVenta ? 'Sí' : 'No'}</td>
                <td>{e.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function Roles() {
  const { data, isLoading, error } = useQuery({ queryKey: ['roles'], queryFn: listarRoles })
  return (
    <section className="tarjeta">
      <h2>Roles funcionales</h2>
      <Estado cargando={isLoading} error={error} />
      {data && (
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Nivel autoridad</th>
              <th>Ámbito</th>
            </tr>
          </thead>
          <tbody>
            {[...data]
              .sort((a, b) => b.nivelAutoridad - a.nivelAutoridad)
              .map((r) => (
                <tr key={r.codigo}>
                  <td>
                    <strong>{r.codigo}</strong>
                  </td>
                  <td>{r.nombre}</td>
                  <td>{r.nivelAutoridad}</td>
                  <td>{r.ambitoPermitido}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function Permisos() {
  const { data, isLoading, error } = useQuery({ queryKey: ['permisos'], queryFn: listarPermisos })
  return (
    <section className="tarjeta">
      <h2>Permisos granulares</h2>
      <Estado cargando={isLoading} error={error} />
      {data && (
        <table>
          <thead>
            <tr>
              <th>Clave</th>
              <th>Módulo</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.clave}>
                <td>
                  <code>{p.clave}</code>
                </td>
                <td>{p.modulo}</td>
                <td>{p.accion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function Parametros() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['parametros'],
    queryFn: listarParametros,
  })
  return (
    <section className="tarjeta">
      <h2>Parámetros de configuración</h2>
      <Estado cargando={isLoading} error={error} />
      {data && data.items.length === 0 && <p className="muted">Sin parámetros configurados.</p>}
      {data && data.items.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Clave</th>
              <th>Módulo</th>
              <th>Valor</th>
              <th>Criticidad</th>
              <th>Vigencia desde</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((p) => (
              <tr key={p.id}>
                <td>
                  <code>{p.clave}</code>
                </td>
                <td>{p.modulo}</td>
                <td>{p.valor}</td>
                <td>
                  <span className={p.criticidadConsumo === 'Bloqueante' ? 'badge bloq' : 'badge degr'}>
                    {p.criticidadConsumo}
                  </span>
                </td>
                <td>{p.vigenciaDesde}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
