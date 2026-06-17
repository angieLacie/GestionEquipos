import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import PageMeta from '@/components/PageMeta.tsx'
import { basePath } from '@/helpers'
import { login } from '@/lib/seguridad'
import { useAuth } from '@/lib/auth'
import { ApiError } from '@/lib/api'
import AuthShell from '@/views/auth/components/AuthShell.tsx'

const RECORDAR_KEY = 'nova-usuario-recordado'

const Login = () => {
  const navigate = useNavigate()
  const setSesion = useAuth((s) => s.setSesion)
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [verPass, setVerPass] = useState(false)
  const [recordar, setRecordar] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  // Prefill del usuario recordado.
  useEffect(() => {
    const guardado = localStorage.getItem(RECORDAR_KEY)
    if (guardado) {
      setNombreUsuario(guardado)
      setRecordar(true)
    }
  }, [])

  function onPassKey(e: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(e.getModifierState('CapsLock'))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      const sesion = await login({ nombreUsuario, password })
      if (recordar) localStorage.setItem(RECORDAR_KEY, nombreUsuario)
      else localStorage.removeItem(RECORDAR_KEY)
      setSesion(sesion)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <PageMeta title={'Iniciar sesión'} />
      <AuthShell>
        {/* Marca compacta (visible sobre todo en móvil donde el panel izq se oculta) */}
        <div className="d-flex align-items-center gap-2 mb-4">
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-3 fw-bold text-white"
            style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #4f46e5, #2563eb)', boxShadow: '0 6px 16px rgba(79,70,229,.35)' }}
          >
            N
          </span>
          <div className="lh-sm">
            <div className="fw-bold" style={{ color: '#0f172a' }}>Nova</div>
            <div className="small" style={{ color: '#94a3b8' }}>Gestión de Equipos</div>
          </div>
        </div>

        <span className="d-inline-block small fw-semibold mb-2" style={{ color: '#4f46e5', letterSpacing: '.08em' }}>BIENVENIDO DE NUEVO</span>
        <h2 className="fw-bold mb-1" style={{ color: '#0f172a', fontSize: '2rem', letterSpacing: '-.02em' }}>Iniciar sesión</h2>
        <p className="mb-4" style={{ color: '#64748b' }}>Ingresa con tu cuenta corporativa para acceder al sistema.</p>

        <form onSubmit={onSubmit}>
          {/* Correo/usuario — input outlined con label flotante */}
          <div className="form-floating nova-field mb-3">
            <input
              type="text" id="usuario" className="form-control" placeholder="correo@empresa.pe"
              value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} autoFocus required autoComplete="username"
            />
            <label htmlFor="usuario">Correo corporativo</label>
          </div>

          {/* Contraseña — label flotante + toggle a la derecha */}
          <div className="form-floating nova-field nova-field--icon mb-2 position-relative">
            <input
              type={verPass ? 'text' : 'password'} id="password" className="form-control" placeholder="Contraseña"
              value={password} onChange={(e) => setPassword(e.target.value)} onKeyUp={onPassKey} onKeyDown={onPassKey} required autoComplete="current-password"
            />
            <label htmlFor="password">Contraseña</label>
            <button
              type="button"
              className="btn border-0 bg-transparent position-absolute end-0 top-0 h-100 px-3 d-flex align-items-center"
              style={{ color: '#94a3b8', zIndex: 5 }}
              onClick={() => setVerPass((v) => !v)}
              title={verPass ? 'Ocultar' : 'Mostrar'}
              aria-label={verPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#${verPass ? 'eye-off' : 'lock'}`}></use></svg>
            </button>
          </div>
          {capsLock && (
            <div className="form-text text-warning-emphasis d-flex align-items-center gap-1 mb-2">
              <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#alert-triangle`}></use></svg>
              Bloq Mayús está activado
            </div>
          )}

          <div className="d-flex align-items-center justify-content-between my-3">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="recordarme" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
              <label className="form-check-label" htmlFor="recordarme">Recordarme</label>
            </div>
            <Link to="/auth/forgot-password" className="small fw-semibold text-decoration-none" style={{ color: '#4f46e5' }}>¿Olvidaste tu contraseña?</Link>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small" role="alert">
              <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#alert-circle`}></use></svg>
              <span>{error}</span>
            </div>
          )}

          <div className="d-grid">
            <button type="submit" className="btn btn-lg fw-semibold text-white nova-auth-btn" disabled={cargando}>
              {cargando ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Ingresando…</>
              ) : (
                <>Ingresar <svg className="sa-icon ms-1"><use href={`${basePath}/icons/sprite.svg#arrow-right`}></use></svg></>
              )}
            </button>
          </div>
        </form>

        {/* Pie de confianza corporativo */}
        <div className="d-flex align-items-center justify-content-center gap-2 mt-4 small" style={{ color: '#94a3b8' }}>
          <svg className="sa-icon" style={{ width: 14, height: 14 }}><use href={`${basePath}/icons/sprite.svg#lock`}></use></svg>
          <span>Conexión cifrada · Acceso corporativo seguro</span>
        </div>
      </AuthShell>
    </>
  )
}

export default Login
