import { basePath } from '@/helpers'

const PILLS = ['Marcaciones', 'OFIPLAN', 'Multi-empresa', 'Auditoría']

/**
 * Panel de marca (columna izquierda) compartido por login y recuperación.
 * Gradiente azul Nova + anillos concéntricos + líneas decorativas.
 * Se oculta en pantallas < lg (las páginas son overlay self-contained).
 */
const AuthBrandPanel = () => {
  return (
    <div
      className="col-lg-6 d-none d-lg-flex flex-column justify-content-between text-white p-5 position-relative overflow-hidden"
      style={{
        background:
          'radial-gradient(120% 80% at 75% 15%, rgba(59,130,246,.28) 0%, rgba(37,99,235,.05) 40%, transparent 65%), linear-gradient(180deg, #1e2a6e 0%, #16205a 38%, #0d1538 72%, #0a1130 100%)',
      }}
    >
      {/* ── Logo / cabecera ── */}
      <div className="d-flex align-items-center gap-3 position-relative" style={{ zIndex: 2 }}>
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-3 fw-bold fs-4 bg-white bg-opacity-10 border border-white border-opacity-25"
          style={{ width: 56, height: 56 }}
        >
          N
        </span>
        <div>
          <div className="fw-bold fs-5">Nova · Gestión de Equipos</div>
          <div className="opacity-75 small">Sistema de Control · Asistencia y Accesos</div>
        </div>
      </div>

      {/* ── Marketing copy ── */}
      <div className="position-relative" style={{ zIndex: 2 }}>
        <h1 className="fw-bold display-5 mb-3">Gestiona el rol y los descansos de tu equipo desde un solo lugar.</h1>
        <p className="opacity-75 fs-5 mb-4" style={{ maxWidth: 460 }}>
          Una sola plataforma para la <strong className="fw-semibold opacity-100">asistencia</strong>, el{' '}
          <strong className="fw-semibold opacity-100">rol de personal</strong> y el{' '}
          <strong className="fw-semibold opacity-100">control de accesos</strong> de tus tiendas.
        </p>

        <div className="d-flex flex-wrap gap-2">
          {PILLS.map((p) => (
            <span
              key={p}
              className="badge rounded-pill bg-white bg-opacity-10 border border-white border-opacity-25 px-3 py-2 fw-normal"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="opacity-50 small position-relative" style={{ zIndex: 2 }}>
        © {new Date().getFullYear()} Nova — Gestión de Equipos
      </div>

      {/* ── Anillos concéntricos decorativos ── */}
      <div
        className="position-absolute rounded-circle border border-white border-opacity-10"
        style={{ width: 520, height: 520, right: -160, top: 40 }}
      />
      <div
        className="position-absolute rounded-circle border border-white border-opacity-10"
        style={{ width: 380, height: 380, right: -90, top: 110 }}
      />
      <div
        className="position-absolute rounded-circle border border-white border-opacity-10"
        style={{ width: 240, height: 240, right: -20, top: 180 }}
      />
      {/* ── Líneas decorativas diagonales ── */}
      <div
        className="position-absolute"
        style={{ width: 1, height: 360, background: 'rgba(255,255,255,0.08)', left: 80, bottom: -40, transform: 'rotate(18deg)' }}
      />
      <div
        className="position-absolute"
        style={{ width: 1, height: 280, background: 'rgba(255,255,255,0.08)', left: 140, bottom: -20, transform: 'rotate(18deg)' }}
      />
      {/* logo svg sprite anchor para evitar tree-shaking del basePath en builds */}
      <svg className="d-none" aria-hidden="true">
        <use href={`${basePath}/icons/sprite.svg#shield`} />
      </svg>
    </div>
  )
}

export default AuthBrandPanel
