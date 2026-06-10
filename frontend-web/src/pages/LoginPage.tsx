import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/seguridad'
import { useAuth } from '../lib/auth'
import { ApiError } from '../lib/api'

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
    <div className="centro">
      <form className="tarjeta login" onSubmit={onSubmit}>
        <h1>Nova</h1>
        <p className="sub">Acceso al sistema de gestión</p>

        <label>
          Usuario
          <input
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            autoFocus
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}
