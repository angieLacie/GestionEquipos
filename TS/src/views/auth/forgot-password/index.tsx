import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import PageMeta from '@/components/PageMeta.tsx'
import { basePath } from '@/helpers'
import AuthShell from '@/views/auth/components/AuthShell.tsx'
import OtpInput from '@/views/auth/components/OtpInput.tsx'
import { evaluarPassword } from '@/lib/password-rules'
import { enviarCodigo, validarCodigo, resetPassword } from '@/lib/auth-recovery'

type Paso = 1 | 2 | 3 | 4

const REENVIO_SEGUNDOS = 60

const VolverLink = ({ onClick }: { onClick?: () => void }) =>
  onClick ? (
    <button type="button" onClick={onClick} className="btn btn-link p-0 text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1 mb-4" style={{ color: '#64748b' }}>
      <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#chevron-left`}></use></svg> Volver
    </button>
  ) : (
    <Link to="/auth/login" className="text-decoration-none small fw-semibold d-inline-flex align-items-center gap-1 mb-4" style={{ color: '#64748b' }}>
      <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#chevron-left`}></use></svg> Volver
    </Link>
  )

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [paso, setPaso] = useState<Paso>(1)
  const [correo, setCorreo] = useState('')
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  // contador de reenvío (paso 2)
  const [restante, setRestante] = useState(REENVIO_SEGUNDOS)

  // contraseñas (paso 3)
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [verNueva, setVerNueva] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)

  const pwd = evaluarPassword(nueva, confirmar)

  // Countdown del reenvío mientras estamos en el paso 2.
  useEffect(() => {
    if (paso !== 2 || restante <= 0) return
    const t = setInterval(() => setRestante((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [paso, restante])

  async function onEnviarCodigo(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    const r = await enviarCodigo(correo)
    setCargando(false)
    if (!r.ok) {
      setError(r.mensaje ?? 'No se pudo enviar el código.')
      return
    }
    setCodigo('')
    setRestante(REENVIO_SEGUNDOS)
    setPaso(2)
  }

  async function onReenviar() {
    if (restante > 0 || cargando) return
    setError(null)
    setCargando(true)
    await enviarCodigo(correo)
    setCargando(false)
    setRestante(REENVIO_SEGUNDOS)
  }

  async function onValidarCodigo(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    const r = await validarCodigo(correo, codigo)
    setCargando(false)
    if (!r.ok) {
      setError(r.mensaje ?? 'Código inválido.')
      return
    }
    setPaso(3)
  }

  async function onResetPassword(e: FormEvent) {
    e.preventDefault()
    if (!pwd.ok) return
    setError(null)
    setCargando(true)
    const r = await resetPassword(correo, nueva)
    setCargando(false)
    if (!r.ok) {
      setError(r.mensaje ?? 'No se pudo restablecer la contraseña.')
      return
    }
    setPaso(4)
  }

  const tituloMeta = ['', 'Restablecer contraseña', 'Verifica tu identidad', 'Nueva contraseña', 'Listo'][paso]

  return (
    <>
      <PageMeta title={tituloMeta} />
      <AuthShell>
        {/* ─────────── Paso 1: Restablecer contraseña ─────────── */}
        {paso === 1 && (
          <>
            <VolverLink />
            <h2 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Restablecer contraseña</h2>
            <p className="mb-4" style={{ color: '#64748b' }}>
              Ingresa tu correo corporativo y te enviaremos un código de verificación de 6 dígitos.
            </p>
            <form onSubmit={onEnviarCodigo}>
              <div className="form-floating nova-field mb-3">
                <input
                  type="email" id="correo" className="form-control" placeholder="nombre@empresa.com"
                  value={correo} onChange={(e) => setCorreo(e.target.value)} autoFocus required autoComplete="email"
                />
                <label htmlFor="correo">Correo corporativo</label>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small" role="alert">
                  <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#alert-circle`}></use></svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-lg fw-semibold text-white nova-auth-btn" disabled={cargando}>
                  {cargando ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Enviando…</>
                  ) : (
                    <>Enviar código de verificación</>
                  )}
                </button>
              </div>
            </form>

            <div className="d-flex gap-2 p-3 rounded-3 small" style={{ background: '#f1f5f9', color: '#475569' }} role="note">
              <svg className="sa-icon flex-shrink-0 mt-1"><use href={`${basePath}/icons/sprite.svg#info`}></use></svg>
              <span>Solo cuentas corporativas. Si no recuerdas tu correo contacta a Sistemas.</span>
            </div>
          </>
        )}

        {/* ─────────── Paso 2: Verifica tu identidad ─────────── */}
        {paso === 2 && (
          <>
            <VolverLink onClick={() => { setError(null); setPaso(1) }} />
            <h2 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Verifica tu identidad</h2>
            <p className="mb-4" style={{ color: '#64748b' }}>
              Enviamos un código de 6 dígitos a <strong style={{ color: '#0f172a' }}>{correo}</strong>. Ingrésalo a continuación.
            </p>
            <form onSubmit={onValidarCodigo}>
              <div className="mb-3">
                <OtpInput value={codigo} onChange={setCodigo} disabled={cargando} />
              </div>

              <div className="mb-3 small" style={{ color: '#64748b' }}>
                ¿No recibiste el código?{' '}
                {restante > 0 ? (
                  <span>Reenviar en <strong style={{ color: '#0f172a' }}>{restante}s</strong></span>
                ) : (
                  <button type="button" onClick={onReenviar} className="btn btn-link p-0 text-decoration-none small fw-semibold align-baseline" disabled={cargando}>
                    Reenviar código
                  </button>
                )}
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small" role="alert">
                  <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#alert-circle`}></use></svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="d-grid">
                <button type="submit" className="btn btn-lg fw-semibold text-white nova-auth-btn" disabled={cargando || codigo.length !== 6}>
                  {cargando ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Validando…</>
                  ) : (
                    <>Validar código</>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ─────────── Paso 3: Nueva contraseña ─────────── */}
        {paso === 3 && (
          <>
            <h2 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Nueva contraseña</h2>
            <p className="mb-4" style={{ color: '#64748b' }}>
              Crea una contraseña segura para tu cuenta. Debe cumplir todos los requisitos.
            </p>
            <form onSubmit={onResetPassword}>
              <div className="form-floating nova-field nova-field--icon mb-3 position-relative">
                <input
                  type={verNueva ? 'text' : 'password'} id="nueva" className="form-control" placeholder="Nueva contraseña"
                  value={nueva} onChange={(e) => setNueva(e.target.value)} autoFocus required autoComplete="new-password"
                />
                <label htmlFor="nueva">Nueva contraseña</label>
                <button type="button" className="btn border-0 bg-transparent position-absolute end-0 top-0 h-100 px-3 d-flex align-items-center" style={{ color: '#94a3b8', zIndex: 5 }} onClick={() => setVerNueva((v) => !v)} aria-label={verNueva ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#${verNueva ? 'eye-off' : 'eye'}`}></use></svg>
                </button>
              </div>

              <div className="form-floating nova-field nova-field--icon mb-3 position-relative">
                <input
                  type={verConfirmar ? 'text' : 'password'} id="confirmar" className="form-control" placeholder="Confirmar contraseña"
                  value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required autoComplete="new-password"
                />
                <label htmlFor="confirmar">Confirmar contraseña</label>
                <button type="button" className="btn border-0 bg-transparent position-absolute end-0 top-0 h-100 px-3 d-flex align-items-center" style={{ color: '#94a3b8', zIndex: 5 }} onClick={() => setVerConfirmar((v) => !v)} aria-label={verConfirmar ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#${verConfirmar ? 'eye-off' : 'eye'}`}></use></svg>
                </button>
              </div>

              <div className="p-3 rounded-3 mb-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div className="small fw-semibold mb-2" style={{ color: '#94a3b8', letterSpacing: '.05em' }}>REQUISITOS</div>
                <ul className="list-unstyled mb-0 small">
                  {pwd.reglas.map((r) => (
                    <li key={r.label} className="d-flex align-items-center gap-2 mb-1">
                      <svg
                        className="sa-icon flex-shrink-0"
                        style={{ stroke: r.cumple ? '#22c55e' : '#cbd5e1', fill: 'none' }}
                        aria-hidden="true"
                      >
                        <use href={`${basePath}/icons/sprite.svg#${r.cumple ? 'check-circle' : 'circle'}`}></use>
                      </svg>
                      <span style={{ color: r.cumple ? '#16a34a' : '#94a3b8', fontWeight: r.cumple ? 600 : 400 }}>{r.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small" role="alert">
                  <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#alert-circle`}></use></svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="d-grid">
                <button type="submit" className="btn btn-lg fw-semibold text-white nova-auth-btn" disabled={cargando || !pwd.ok}>
                  {cargando ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Restableciendo…</>
                  ) : (
                    <>Restablecer contraseña</>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ─────────── Paso 4: Listo ─────────── */}
        {paso === 4 && (
          <div className="text-center">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
              style={{ width: 80, height: 80, background: '#dcfce7', color: '#16a34a' }}
              aria-hidden="true"
            >
              <svg className="sa-icon" style={{ width: 40, height: 40 }}><use href={`${basePath}/icons/sprite.svg#check-circle`}></use></svg>
            </span>
            <h2 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Listo</h2>
            <p className="mb-4" style={{ color: '#64748b' }}>
              Tu contraseña se ha restablecido correctamente. Ya puedes iniciar sesión.
            </p>
            <div className="d-grid">
              <button type="button" className="btn btn-lg fw-semibold text-white nova-auth-btn" onClick={() => navigate('/auth/login')}>
                Volver al inicio de sesión
              </button>
            </div>
          </div>
        )}
      </AuthShell>
    </>
  )
}

export default ForgotPassword
