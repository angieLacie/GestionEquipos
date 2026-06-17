import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'react-bootstrap'
import { useToggle } from 'usehooks-ts'
import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import { useConfirm } from '@/components/ConfirmDialog.tsx'
import { basePath } from '@/helpers'
import {
  listarAscensos,
  cumplimientoSerie,
  candidatosMock,
  zonasMock,
  tiendasMock,
  type Ascenso,
  type EstadoAscenso,
  type MesCumplimiento,
} from '@/lib/ascensos'
import '@/views/rol/rol.scss'

type Filtro = 'Todas' | EstadoAscenso

// ── Estado del flujo de ascenso (chip + drawer historial, molde Rol) ──
type EstadoAscensoFlujo =
  | 'En evaluación' | 'Enviado a GG' | 'Aprobado' | 'Rechazado' | 'Promovido'

const ESTADO_ASCENSO_COLOR: Record<EstadoAscensoFlujo, string> = {
  'En evaluación': '#64748b',
  'Enviado a GG':  '#6366f1',
  'Aprobado':      '#16a34a',
  'Rechazado':     '#ef4444',
  'Promovido':     '#0d9488',
}

// Estado actual del flujo (mock — se conectará al backend del módulo Ascensos).
const ESTADO_ACTUAL_ASCENSO: EstadoAscensoFlujo = 'En evaluación'

type HistItem = {
  fecha: string; hora: string; usuario: string; rol: string
  accion: string; detalle?: string; antes?: string; despues?: string
  tipo: 'documento' | 'celda'
}

// Historial mock del flujo de ascenso (timeline, forma = backend futuro).
const HISTORIAL_ASCENSO: HistItem[] = [
  { fecha: '13/06', hora: '08:45', usuario: 'L. Paredes', rol: 'GT', accion: 'Creó solicitud de ascenso', detalle: 'Mendoza Pérez, Carla · Asesor', tipo: 'documento' },
  { fecha: '13/06', hora: '09:20', usuario: 'L. Paredes', rol: 'GT', accion: 'Adjuntó cumplimiento (6 meses)', detalle: 'Promedio Senior 103.5%', tipo: 'documento' },
  { fecha: '13/06', hora: '11:10', usuario: 'M. Rojas', rol: 'GZ', accion: 'Actualizó evaluación', detalle: 'Carla Mendoza · % Senior', antes: '98.0%', despues: '103.5%', tipo: 'celda' },
  { fecha: '14/06', hora: '10:05', usuario: 'M. Rojas', rol: 'GZ', accion: 'Envió a aprobación', detalle: 'Enviado a Gerencia General', tipo: 'documento' },
  { fecha: '14/06', hora: '15:30', usuario: 'A. Campos', rol: 'GG', accion: 'Cambió decisión', detalle: 'Carla Mendoza', antes: 'Enviado a GG', despues: 'En evaluación', tipo: 'celda' },
]

const ESTADO_META: Record<EstadoAscenso, { label: string; color: string }> = {
  Pendiente: { label: 'Pendiente', color: 'warning' },
  Aprobada: { label: 'Aprobada', color: 'success' },
  Rechazada: { label: 'Rechazada', color: 'danger' },
}

const COLORES = ['#4f46e5', '#0ea5e9', '#db2777', '#f59e0b', '#0d9488', '#16a34a', '#8b5cf6']

/** Iniciales a partir de los apellidos (parte previa a la coma). */
const iniciales = (nombre: string) => {
  const apellidos = nombre.split(',')[0].trim().split(/\s+/)
  return (apellidos[0]?.[0] ?? '') + (apellidos[1]?.[0] ?? '')
}
const colorDe = (nombre: string) => COLORES[nombre.length % COLORES.length]

const Aviso = ({ tipo, texto }: { tipo: 'ok' | 'err'; texto: string }) => (
  <div className={`alert ${tipo === 'ok' ? 'alert-success' : 'alert-danger'} py-2 px-3 mb-3`}>{texto}</div>
)

/** Celda de % con color: ≥100 azul, <100 rojo. */
const Pct = ({ v }: { v: number | null }) =>
  v == null
    ? <span className="text-muted fst-italic small">Sin hist. Senior</span>
    : <span className={`fw-bold ${v >= 100 ? 'text-primary' : 'text-danger'}`}>{v.toFixed(1)}%</span>

/** Panel obligatorio de cumplimiento de los últimos 6 meses (mock). */
const TablaCumplimiento = ({ serie }: { serie: MesCumplimiento[] }) => (
  <table className="table table-sm align-middle mb-2">
    <thead>
      <tr className="text-muted small text-uppercase">
        <th>Mes</th>
        <th className="text-center">% Cuota Asesor</th>
        <th className="text-center">% Senior</th>
      </tr>
    </thead>
    <tbody>
      {serie.map((m) => (
        <tr key={m.mes}>
          <td className="fw-semibold">{m.mes}</td>
          <td className="text-center"><Pct v={m.cuotaAsesor} /></td>
          <td className="text-center"><Pct v={m.senior} /></td>
        </tr>
      ))}
    </tbody>
  </table>
)

const Ascensos = () => {
  const [filas, setFilas] = useState<Ascenso[]>([])
  const [cargando, setCargando] = useState(true)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)

  // Filtros
  const [filtro, setFiltro] = useState<Filtro>('Todas')
  const [fZona, setFZona] = useState('')
  const [fTienda, setFTienda] = useState('')

  // Modal cumplimiento
  const [showCump, toggleCump] = useToggle()
  const [cumpAscenso, setCumpAscenso] = useState<Ascenso | null>(null)

  // Modal registrar
  const [showReg, toggleReg] = useToggle()
  const [regCandidatoId, setRegCandidatoId] = useState<number>(candidatosMock[0]?.id ?? 0)

  // Drawer historial (molde Rol)
  const [histOpen, setHistOpen] = useState(false)

  const { confirm, dialog: confirmDialog } = useConfirm()

  useEffect(() => {
    listarAscensos()
      .then(setFilas)
      .catch((e) => setMsg({ tipo: 'err', texto: e?.message ?? 'No se pudo cargar.' }))
      .finally(() => setCargando(false))
  }, [])

  const visibles = useMemo(
    () => filas.filter((a) =>
      (filtro === 'Todas' || a.estado === filtro) &&
      (!fZona || a.zona === fZona) &&
      (!fTienda || a.tienda === fTienda),
    ),
    [filas, filtro, fZona, fTienda],
  )

  const cuenta = (e: Filtro) => e === 'Todas' ? filas.length : filas.filter((a) => a.estado === e).length

  const aprobar = (a: Ascenso) => {
    // Segregación: una autosolicitud no la resuelve quien la originó (RN-ASCE / R-GG-SUP).
    if (a.autosolicitud) return
    setFilas((prev) => prev.map((x) => x.id === a.id ? { ...x, estado: 'Aprobada' } : x))
    setMsg({ tipo: 'ok', texto: `Ascenso de ${a.empleado} aprobado.` })
  }

  const rechazar = async (a: Ascenso) => {
    const ok = await confirm({
      title: 'Rechazar ascenso',
      message: <>¿Rechazar la solicitud de <strong>{a.empleado}</strong>?</>,
      confirmText: 'Rechazar', variant: 'danger',
    })
    if (!ok) return
    setFilas((prev) => prev.map((x) => x.id === a.id ? { ...x, estado: 'Rechazada' } : x))
    setMsg({ tipo: 'ok', texto: `Ascenso de ${a.empleado} rechazado.` })
  }

  const verCumplimiento = (a: Ascenso) => {
    setCumpAscenso(a)
    toggleCump()
  }

  const abrirRegistrar = () => {
    setRegCandidatoId(candidatosMock[0]?.id ?? 0)
    toggleReg()
  }
  const registrar = () => {
    const cand = candidatosMock.find((c) => c.id === regCandidatoId)
    if (!cand) return
    const id = Math.max(0, ...filas.map((a) => a.id)) + 1
    setFilas((prev) => [
      { id, empleado: cand.nombre, tienda: cand.tienda, puesto: cand.puesto, promotor: 'Administración de Ventas (AV)', autosolicitud: false, zona: cand.zona, estado: 'Pendiente' },
      ...prev,
    ])
    toggleReg()
    setMsg({ tipo: 'ok', texto: `Solicitud de ascenso de ${cand.nombre} enviada a GG.` })
  }

  const candReg = candidatosMock.find((c) => c.id === regCandidatoId)

  return (
    <div className="content-wrapper">
      <div className="d-flex align-items-end flex-wrap gap-2 mb-4">
        <PageBreadcrumb
          title={'Ascenso Senior'}
          subTitle1={'Gestión'}
          subText={'Solicitudes de ascenso de asesores a senior con flujo de aprobación'}
        />
        <button className="ms-auto btn btn-primary align-self-start" onClick={abrirRegistrar}>
          <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#plus`}></use></svg>Registrar ascenso
        </button>
      </div>

      {msg && <Aviso tipo={msg.tipo} texto={msg.texto} />}

      {/* Tabs estado */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        {(['Todas', 'Pendiente', 'Aprobada', 'Rechazada'] as Filtro[]).map((f) => (
          <button
            key={f}
            className={`btn btn-sm rounded-pill ${filtro === f ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFiltro(f)}
          >
            {f === 'Todas' ? 'Todas' : ESTADO_META[f].label + 's'} <span className="opacity-75">({cuenta(f)})</span>
          </button>
        ))}
        <div className="ms-auto d-flex align-items-center gap-2">
          <span className="rol-estado-chip" style={{ ['--est' as string]: ESTADO_ASCENSO_COLOR[ESTADO_ACTUAL_ASCENSO] }}>
            <span className="rol-estado-dot" />{ESTADO_ACTUAL_ASCENSO}
          </span>
          <button className="btn btn-sm btn-light rol-btn-ghost" onClick={() => setHistOpen(true)}>
            <svg className="rol-bico me-1"><use href={`${basePath}/icons/sprite.svg#clock`}></use></svg>Historial
          </button>
          <select className="form-select" style={{ maxWidth: 180 }} value={fZona} onChange={(e) => setFZona(e.target.value)}>
            <option value="">Todas las zonas</option>
            {zonasMock.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
          <select className="form-select" style={{ maxWidth: 180 }} value={fTienda} onChange={(e) => setFTienda(e.target.value)}>
            <option value="">Todas las tiendas</option>
            {tiendasMock.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="alert alert-light border py-2 px-3 mb-3 small text-muted">
        ⚠️ Datos de ejemplo — el módulo de Ascensos aún no tiene backend. Las acciones Aprobar/Rechazar son locales.
      </div>

      {cargando ? (
        <div className="text-muted py-4 text-center">Cargando…</div>
      ) : visibles.length === 0 ? (
        <Card><Card.Body className="text-center text-muted py-4">Sin solicitudes para el filtro.</Card.Body></Card>
      ) : (
        <Row className="g-3">
          {visibles.map((a) => {
            const m = ESTADO_META[a.estado]
            return (
              <Col key={a.id} md={6} xl={4}>
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex align-items-start gap-2 mb-2">
                      <span className="d-inline-flex align-items-center justify-content-center rounded-circle fw-semibold text-white flex-shrink-0"
                        style={{ width: 40, height: 40, background: colorDe(a.empleado) }}>
                        {iniciales(a.empleado)}
                      </span>
                      <div className="flex-grow-1">
                        <div className="fw-bold">{a.empleado}</div>
                        <div className="small text-muted">{a.tienda} · {a.puesto}</div>
                      </div>
                      <span className={`badge bg-${m.color}-subtle text-${m.color}`}>{m.label}</span>
                    </div>

                    <div className="small mb-2">
                      Promotor / solicitante: <span className="fw-semibold text-primary">{a.promotor}</span>
                    </div>

                    <button className="btn btn-sm btn-light border w-100 mb-3" onClick={() => verCumplimiento(a)}>
                      <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#bar-chart-2`}></use></svg>
                      Ver cumplimiento (últimos 6 meses)
                    </button>

                    {a.estado === 'Pendiente' ? (
                      <>
                        <div className="d-flex gap-2">
                          <Button variant="success" className="flex-grow-1" disabled={a.autosolicitud} onClick={() => aprobar(a)}>Aprobar</Button>
                          <Button variant="outline-danger" className="flex-grow-1" onClick={() => rechazar(a)}>Rechazar</Button>
                        </div>
                        {a.autosolicitud && (
                          <div className="alert alert-warning py-2 px-3 mt-2 mb-0 small d-flex gap-2">
                            <svg className="sa-icon flex-shrink-0"><use href={`${basePath}/icons/sprite.svg#alert-triangle`}></use></svg>
                            <span>Por segregación, esta solicitud debe resolverla un <strong>Gerente General Suplente (R-GG-SUP)</strong>; no puede aprobarla quien la originó.</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className={`text-center small fw-semibold text-${m.color}`}>Solicitud {m.label.toLowerCase()}</div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}

      {/* Modal cumplimiento (6 meses) */}
      <Modal show={showCump} onHide={toggleCump} centered size="lg" className="fade" tabIndex={-1}>
        <ModalHeader>
          <div>
            <h5 className="modal-title mb-0">
              <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#bar-chart-2`}></use></svg>
              Cumplimiento (6 meses)
            </h5>
            {cumpAscenso && <div className="text-muted small">Candidato: {cumpAscenso.empleado}</div>}
          </div>
          <button type="button" className="btn-close" onClick={toggleCump}></button>
        </ModalHeader>
        <ModalBody>
          {cumpAscenso && (
            <>
              <div className="alert alert-warning py-2 px-3 mb-3 small">
                <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#info`}></use></svg>
                Historial obligatorio de los <strong>últimos 6 meses</strong> para la decisión del GG.
              </div>
              <TablaCumplimiento serie={cumplimientoSerie(cumpAscenso.id)} />
              <div className="form-text">Valores ≥ 100% en azul, &lt; 100% en rojo. Datos de ejemplo.</div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-default" onClick={toggleCump}>Cerrar</button>
        </ModalFooter>
      </Modal>

      {/* Modal registrar ascenso */}
      <Modal show={showReg} onHide={toggleReg} centered size="lg" className="fade" tabIndex={-1}>
        <ModalHeader>
          <div>
            <h5 className="modal-title mb-0">
              <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#trending-up`}></use></svg>
              Registrar ascenso a Senior
            </h5>
            <div className="text-muted small">Solicitante: <span className="text-primary fw-semibold">Administración de Ventas (AV)</span></div>
          </div>
          <button type="button" className="btn-close" onClick={toggleReg}></button>
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <label className="form-label">Asesor candidato <span className="text-danger">*</span></label>
            <select className="form-select" value={regCandidatoId} onChange={(e) => setRegCandidatoId(Number(e.target.value))}>
              {candidatosMock.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} · {c.tienda} · {c.puesto}</option>
              ))}
            </select>
          </div>
          <div className="alert alert-warning py-2 px-3 mb-3 small">
            <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#info`}></use></svg>
            Panel obligatorio de cumplimiento de los <strong>últimos 6 meses</strong> (snapshot al momento de la solicitud).
            El GG decide de forma informada; no hay bloqueo automático por bajo cumplimiento.
          </div>
          {candReg && <TablaCumplimiento serie={cumplimientoSerie(candReg.id)} />}
          <div className="form-text">Valores ≥ 100% en azul, &lt; 100% en rojo. Datos de ejemplo. Sin tienda destino ni rango de fechas.</div>
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-default" onClick={toggleReg}>Cancelar</button>
          <Button variant="primary" onClick={registrar} disabled={!candReg}>Enviar solicitud a GG</Button>
        </ModalFooter>
      </Modal>

      {/* ── Drawer: Historial de ascensos ── */}
      {histOpen && (
        <div className="rol-hist-ov" onClick={() => setHistOpen(false)}>
          <aside className="rol-hist-panel" onClick={(e) => e.stopPropagation()}>
            <div className="rol-hist-hd">
              <div>
                <div className="rol-hist-ttl">Historial de ascensos</div>
                <div className="rol-hist-sub">Flujo de evaluación a Senior</div>
              </div>
              <button className="rpm-close" onClick={() => setHistOpen(false)}>
                <svg className="rol-bico"><use href={`${basePath}/icons/sprite.svg#x`}></use></svg>
              </button>
            </div>

            <div className="rol-hist-estado">
              <span className="rol-estado-chip" style={{ ['--est' as string]: ESTADO_ASCENSO_COLOR[ESTADO_ACTUAL_ASCENSO] }}>
                <span className="rol-estado-dot" />{ESTADO_ACTUAL_ASCENSO}
              </span>
              <span className="rol-hist-estado-txt">Estado actual del documento</span>
            </div>

            <div className="rol-hist-body">
              <ul className="rol-hist-tl">
                {HISTORIAL_ASCENSO.map((h, i) => (
                  <li key={i} className={`rol-hist-it rol-hist-it--${h.tipo}`}>
                    <span className="rol-hist-dot" />
                    <div className="rol-hist-card">
                      <div className="rol-hist-top">
                        <span className="rol-hist-accion">{h.accion}</span>
                        <span className="rol-hist-time">{h.fecha} · {h.hora}</span>
                      </div>
                      {h.detalle && <div className="rol-hist-det">{h.detalle}</div>}
                      {h.tipo === 'celda' && (
                        <div className="rol-hist-cambio">
                          <span className="rol-hist-antes">{h.antes}</span>
                          <svg className="rol-bico"><use href={`${basePath}/icons/sprite.svg#arrow-right`}></use></svg>
                          <span className="rol-hist-despues">{h.despues}</span>
                        </div>
                      )}
                      <div className="rol-hist-user">{h.usuario} · {h.rol}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      )}

      {confirmDialog}
    </div>
  )
}

export default Ascensos
