import { useToasts } from '../lib/ui'

const ICONO = { ok: '✓', error: '⚠', info: 'ℹ' }

/** Contenedor de toasts (esquina inferior derecha) con animación de entrada. */
export function Toaster() {
  const toasts = useToasts((s) => s.toasts)
  const dismiss = useToasts((s) => s.dismiss)
  return (
    <div className="toaster">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.tipo}`} onClick={() => dismiss(t.id)} role="status">
          <span className="toast-ico">{ICONO[t.tipo]}</span>
          <span className="toast-msg">{t.msg}</span>
        </div>
      ))}
    </div>
  )
}
