import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/seguridad'
import { useAuth } from '../lib/auth'
import { ApiError } from '../lib/api'

/** Login split-screen alineado a prototipo-ux-v2 (panel marca + formulario). */
export function LoginPage() {
  const navigate = useNavigate()
  const setSesion = useAuth((s) => s.setSesion)
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      const sesion = await login({ nombreUsuario, password })
      setSesion(sesion)
      navigate('/maestros', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="lsc">
      <div className="lsc-left">
        <div className="lsc-grid" />
        <div className="lsc-deco lsc-deco1" />
        <div className="lsc-deco lsc-deco2" />
        <div className="lsc-left-content">
          <div className="lsc-brand-row">
            <span style={{ fontSize: 26 }}>🏪</span>
            <span className="lsc-brand-tag">GESTIÓN DE EQUIPOS</span>
          </div>
          <h2 className="lsc-headline">
            Administra tu equipo
            <br />
            <span>con inteligencia</span>
          </h2>
          <p className="lsc-tagline">
            Sistema integrado de control de personal, asistencia y reportes para cadenas de tiendas
            retail.
          </p>
          <div className="lsc-features">
            <Feature ico="👥" titulo="Rol de Personal" sub="Programación y turnos semanales" />
            <Feature ico="✅" titulo="Control de Asistencia" sub="Marcaciones y alertas en tiempo real" />
            <Feature ico="📊" titulo="Reportes Analíticos" sub="KPIs, horas extras y compensaciones" />
          </div>
          <div className="lsc-metrics">
            <Metric num="248" lbl="EMPLEADOS" />
            <div className="lsc-mdiv" />
            <Metric num="32" lbl="TIENDAS" />
            <div className="lsc-mdiv" />
            <Metric num="8" lbl="ZONAS" />
          </div>
        </div>
      </div>

      <div className="lsc-right">
        <div className="lsc-right-inner">
          <form onSubmit={onSubmit}>
            <div className="lsc-welcome">Bienvenido de vuelta 👋</div>
            <h3 className="lsc-form-h">Inicia sesión en tu cuenta</h3>

            <div className="lsc-field">
              <label>Usuario</label>
              <input
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                placeholder="usuario"
                autoFocus
                required
              />
            </div>
            <div className="lsc-field">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="lsc-error">{error}</p>}

            <button className="lsc-btn" type="submit" disabled={cargando}>
              {cargando ? 'Ingresando…' : 'Ingresar al sistema'}
            </button>
            <div className="lsc-version">Nova · Gestión de Equipos</div>
          </form>
        </div>
      </div>
    </div>
  )
}

function Feature({ ico, titulo, sub }: { ico: string; titulo: string; sub: string }) {
  return (
    <div className="lsc-feat">
      <div className="lsc-feat-ico">{ico}</div>
      <div className="lsc-feat-body">
        <b>{titulo}</b>
        <span>{sub}</span>
      </div>
    </div>
  )
}

function Metric({ num, lbl }: { num: string; lbl: string }) {
  return (
    <div className="lsc-metric">
      <div className="lsc-mnum">{num}</div>
      <div className="lsc-mlbl">{lbl}</div>
    </div>
  )
}
