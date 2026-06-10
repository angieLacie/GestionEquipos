import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../lib/auth'
import {
  listarEmpresas,
  listarRoles,
  listarPermisos,
  listarParametros,
} from '../lib/maestros'

type Tab = 'empresas' | 'roles' | 'permisos' | 'parametros'

const TABS: { id: Tab; label: string }[] = [
  { id: 'empresas', label: 'Empresas' },
  { id: 'roles', label: 'Roles' },
  { id: 'permisos', label: 'Permisos' },
  { id: 'parametros', label: 'Parámetros' },
]

export function MaestrosPage() {
  const [tab, setTab] = useState<Tab>('empresas')
  const usuario = useAuth((s) => s.usuario)
  const logout = useAuth((s) => s.logout)

  return (
    <div className="app">
      <header className="barra">
        <strong>Nova · Maestros</strong>
        <div className="barra-der">
          <span className="usuario">{usuario?.nombreUsuario}</span>
          <button className="link" onClick={logout}>
            Salir
          </button>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={t.id === tab ? 'tab activa' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="contenido">
        {tab === 'empresas' && <Empresas />}
        {tab === 'roles' && <Roles />}
        {tab === 'permisos' && <Permisos />}
        {tab === 'parametros' && <Parametros />}
      </main>
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
                <td>{e.codigo}</td>
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
                  <td>{r.codigo}</td>
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
                <td>{p.clave}</td>
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
                <td>{p.clave}</td>
                <td>{p.modulo}</td>
                <td>{p.valor}</td>
                <td>{p.criticidadConsumo}</td>
                <td>{p.vigenciaDesde}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
