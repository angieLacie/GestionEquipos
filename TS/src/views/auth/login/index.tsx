import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import PageMeta from '@/components/PageMeta.tsx'
import { basePath } from '@/helpers'
import { login } from '@/lib/seguridad'
import { useAuth } from '@/lib/auth'
import { ApiError } from '@/lib/api'

const PILLS = ['Rol de Personal', 'Marcaciones', 'Vacaciones', 'Reportes']
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
      <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1050, background: '#fff' }}>
        <div className="row g-0 h-100">
          {/* ── Panel de marca (izquierda) ── */}
          <div
            className="col-lg-6 d-none d-lg-flex flex-column justify-content-between text-white p-5 position-relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 45%, #2563eb 100%)' }}
          >
            <div className="d-flex align-items-center gap-3">
              <span className="d-inline-flex align-items-center justify-content-center rounded-3 fw-bold fs-4 bg-white bg-opacity-10 border border-white border-opacity-25" style={{ width: 56, height: 56 }}>N</span>
              <div>
                <div className="fw-bold fs-5">Nova</div>
                <div className="opacity-75 small">Gestión de Equipos</div>
              </div>
            </div>

            <div>
              <h1 className="fw-bold display-5 mb-3">Gestiona el rol y los descansos de tu equipo desde un solo lugar.</h1>
              <p className="opacity-75 fs-5 mb-4" style={{ maxWidth: 460 }}>
                Programación semanal, marcaciones, vacaciones y compensaciones en tiempo real para tus tiendas.
              </p>
              <div className="d-flex flex-wrap gap-2">
                {PILLS.map((p) => (
                  <span key={p} className="badge rounded-pill bg-white bg-opacity-10 border border-white border-opacity-25 px-3 py-2 fw-normal">{p}</span>
                ))}
              </div>
            </div>

            <div className="opacity-50 small">© {new Date().getFullYear()} Nova — Gestión de Equipos</div>

            {/* círculos decorativos */}
            <div className="position-absolute rounded-circle border border-white border-opacity-10" style={{ width: 420, height: 420, right: -120, top: 80 }} />
            <div className="position-absolute rounded-circle border border-white border-opacity-10" style={{ width: 280, height: 280, right: 40, top: 220 }} />
          </div>

          {/* ── Formulario (derecha) ── */}
          <div className="col-lg-6 col-12 d-flex align-items-center justify-content-center p-4" style={{ color: '#1e293b' }}>
            <div className="w-100" style={{ maxWidth: 420 }}>
              <h2 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Iniciar sesión</h2>
              <p className="mb-4" style={{ color: '#64748b' }}>Ingresa con tu cuenta para acceder al panel.</p>

              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="usuario" className="form-label fw-semibold">Usuario</label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light"><svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#user`}></use></svg></span>
                    <input
                      type="text" id="usuario" className="form-control" placeholder="admin"
                      value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} autoFocus required autoComplete="username"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-semibold">Contraseña</label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light"><svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#lock`}></use></svg></span>
                    <input
                      type={verPass ? 'text' : 'password'} id="password" className="form-control" placeholder="••••••••"
                      value={password} onChange={(e) => setPassword(e.target.value)} onKeyUp={onPassKey} onKeyDown={onPassKey} required autoComplete="current-password"
                    />
                    <button type="button" className="input-group-text bg-light border-start-0" onClick={() => setVerPass((v) => !v)} title={verPass ? 'Ocultar' : 'Mostrar'} aria-label={verPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                      <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#${verPass ? 'eye-off' : 'eye'}`}></use></svg>
                    </button>
                  </div>
                  {capsLock && (
                    <div className="form-text text-warning-emphasis d-flex align-items-center gap-1 mt-1">
                      <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#alert-triangle`}></use></svg>
                      Bloq Mayús está activado
                    </div>
                  )}
                </div>

                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="recordarme" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
                    <label className="form-check-label" htmlFor="recordarme">Recordarme</label>
                  </div>
                  <Link to="/auth/forgot-password" className="small text-primary fw-semibold text-decoration-none">¿Olvidaste tu contraseña?</Link>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small" role="alert">
                    <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#alert-circle`}></use></svg>
                    <span>{error}</span>
                  </div>
                )}

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg fw-semibold" disabled={cargando}>
                    {cargando ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Ingresando…</>
                    ) : (
                      <>Ingresar <svg className="sa-icon ms-1"><use href={`${basePath}/icons/sprite.svg#arrow-right`}></use></svg></>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
