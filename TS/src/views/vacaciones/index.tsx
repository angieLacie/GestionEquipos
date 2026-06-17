import { Fragment, useEffect, useState } from 'react'
import { Button, Card, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'react-bootstrap'
import { useToggle } from 'usehooks-ts'
import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import KpiCard from '@/components/KpiCard.tsx'
import { useConfirm } from '@/components/ConfirmDialog.tsx'
import { basePath } from '@/helpers'
import {
  listarVacaciones,
  diasEntre,
  zonasMock,
  tiendasMock,
  empleadosMock,
  aniosMock,
  type EmpleadoVac,
  type ProgramacionVac,
  type EstadoVacacion,
  type MesObligatorio,
} from '@/lib/vacaciones'
import '@/views/rol/rol.scss'

// ── Estado del flujo de vacaciones (chip + drawer historial, molde Rol) ──
type EstadoVacFlujo =
  | 'Solicitada' | 'Aprobada por GT' | 'Aprobada por GG' | 'Rechazada'
  | 'Programada' | 'En goce' | 'Concluida'

const ESTADO_VAC_COLOR: Record<EstadoVacFlujo, string> = {
  'Solicitada':      '#0ea5e9',
  'Aprobada por GT': '#6366f1',
  'Aprobada por GG': '#16a34a',
  'Rechazada':       '#ef4444',
  'Programada':      '#0d9488',
  'En goce':         '#f59e0b',
  'Concluida':       '#94a3b8',
}

// Estado actual del flujo (mock — se conectará al backend del módulo Vacaciones).
const ESTADO_ACTUAL_VAC: EstadoVacFlujo = 'Solicitada'

type HistItem = {
  fecha: string; hora: string; usuario: string; rol: string
  accion: string; detalle?: string; antes?: string; despues?: string
  tipo: 'documento' | 'celda'
}

// Historial mock del flujo de vacaciones (timeline, forma = backend futuro).
const HISTORIAL_VAC: HistItem[] = [
  { fecha: '12/06', hora: '09:15', usuario: 'C. Salas', rol: 'GT', accion: 'Creó solicitud', detalle: 'Ramírez Soto, Lucía · 12/07 – 26/07', tipo: 'documento' },
  { fecha: '12/06', hora: '09:50', usuario: 'C. Salas', rol: 'GT', accion: 'Editó fechas', detalle: 'Lucía Ramírez · Fecha inicio', antes: '12/07', despues: '15/07', tipo: 'celda' },
  { fecha: '13/06', hora: '08:40', usuario: 'M. Rojas', rol: 'GZ', accion: 'Envió a aprobación', detalle: 'Remitido a Gerencia de Tienda', tipo: 'documento' },
  { fecha: '13/06', hora: '14:20', usuario: 'C. Salas', rol: 'GT', accion: 'Cambió estado', detalle: 'Lucía Ramírez', antes: 'Solicitada', despues: 'Aprobada por GT', tipo: 'celda' },
  { fecha: '14/06', hora: '11:05', usuario: 'A. Campos', rol: 'GG', accion: 'Revirtió decisión', detalle: 'Lucía Ramírez', antes: 'Aprobada por GT', despues: 'Solicitada', tipo: 'celda' },
]

const ESTADOS: EstadoVacacion[] = ['Programada', 'EnCurso', 'Pendiente', 'Aprobada', 'Anulada']
const ESTADO_STYLE: Record<EstadoVacacion, { label: string; color: string }> = {
  Programada: { label: 'Programada', color: 'success' },
  EnCurso: { label: 'En curso', color: 'info' },
  Pendiente: { label: 'Pendiente', color: 'warning' },
  Aprobada: { label: 'Aprobada', color: 'primary' },
  Anulada: { label: 'Anulada', color: 'danger' },
}

const fmtFecha = (iso: string) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }

const MesBadge = ({ m }: { m: MesObligatorio | null }) => {
  if (!m) return <span className="text-muted">—</span>
  if (m.nivel === 'warning') return <span className="badge bg-danger-subtle text-danger">⚠ {m.label}</span>
  if (m.nivel === 'urgente') return <span className="badge bg-warning-subtle text-warning">⏰ {m.label}</span>
  return <span className="badge bg-light text-dark border">{m.label}</span>
}

const Aviso = ({ tipo, texto }: { tipo: 'ok' | 'err'; texto: string }) => (
  <div className={`alert ${tipo === 'ok' ? 'alert-success' : 'alert-danger'} py-2 px-3 mb-3`}>{texto}</div>
)

const formInicial = () => ({
  empleadoId: 0, programadoPor: '', fechaInicio: '', fechaFin: '', anio: 2026,
  estado: 'Programado' as string, observaciones: '',
})

const Vacaciones = () => {
  const [empleados, setEmpleados] = useState<EmpleadoVac[]>([])
  const [cargando, setCargando] = useState(true)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)
  const [expandido, setExpandido] = useState<Set<number>>(new Set())

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [fAnio, setFAnio] = useState<'' | number>('')
  const [fZona, setFZona] = useState('')
  const [fTienda, setFTienda] = useState('')

  // Modal nueva/editar
  const [showForm, toggleForm] = useToggle()
  const [editRef, setEditRef] = useState<{ empId: number; progId: number } | null>(null)
  const [form, setForm] = useState(formInicial)

  // Drawer historial (molde Rol)
  const [histOpen, setHistOpen] = useState(false)

  const { confirm, dialog: confirmDialog } = useConfirm()

  const cargar = () => {
    setCargando(true)
    listarVacaciones({ busqueda: busqueda || undefined, anio: fAnio || undefined, zona: fZona || undefined, tienda: fTienda || undefined })
      .then(setEmpleados)
      .finally(() => setCargando(false))
  }
  useEffect(cargar, [busqueda, fAnio, fZona, fTienda])

  const toggleFila = (id: number) =>
    setExpandido((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  // ── KPIs ─────────────────────────────────────────────
  const todasProg = empleados.flatMap((e) => e.programaciones.filter((p) => p.estado !== 'Anulada'))
  const totalProg = todasProg.length
  const enCurso = todasProg.filter((p) => p.estado === 'EnCurso').length
  const proximas = todasProg.filter((p) => p.estado === 'Programada').length
  const conProg = empleados.filter((e) => e.programaciones.some((p) => p.estado !== 'Anulada'))
  const diasProm = conProg.length
    ? Math.round(conProg.reduce((s, e) => s + e.programaciones.reduce((a, p) => a + p.dias, 0), 0) / conProg.length)
    : 0

  // ── Acciones ─────────────────────────────────────────
  const anular = async (e: EmpleadoVac, p: ProgramacionVac) => {
    const ok = await confirm({
      title: '¿Anular esta programación de vacaciones?',
      message: <>{e.nombre} · {fmtFecha(p.fechaInicio)} – {fmtFecha(p.fechaFin)} ({p.dias} días)</>,
      confirmText: 'Anular', variant: 'danger',
    })
    if (!ok) return
    setEmpleados((prev) => prev.map((x) => x.id === e.id
      ? { ...x, programaciones: x.programaciones.map((q) => q.id === p.id ? { ...q, estado: 'Anulada' } : q) }
      : x))
    setMsg({ tipo: 'ok', texto: 'Programación anulada.' })
  }

  const abrirNueva = () => {
    setEditRef(null)
    setForm(formInicial())
    toggleForm()
  }
  const abrirEditar = (e: EmpleadoVac, p: ProgramacionVac) => {
    setEditRef({ empId: e.id, progId: p.id })
    setForm({
      empleadoId: e.id, programadoPor: p.programadoPor, fechaInicio: p.fechaInicio, fechaFin: p.fechaFin,
      anio: p.anio, estado: p.estado === 'EnCurso' ? 'EnCurso' : p.estado, observaciones: p.observaciones ?? '',
    })
    toggleForm()
  }

  const diasForm = diasEntre(form.fechaInicio, form.fechaFin)
  const formValido = form.empleadoId > 0 && !!form.fechaInicio && !!form.fechaFin && diasForm > 0

  const guardar = () => {
    if (!formValido) return
    const estado = (form.estado === 'Programado' ? 'Programada' : form.estado) as EstadoVacacion
    if (editRef) {
      setEmpleados((prev) => prev.map((e) => e.id === editRef.empId
        ? { ...e, programaciones: e.programaciones.map((p) => p.id === editRef.progId
          ? { ...p, fechaInicio: form.fechaInicio, fechaFin: form.fechaFin, dias: diasForm, anio: form.anio, estado, programadoPor: form.programadoPor, observaciones: form.observaciones || null }
          : p) }
        : e))
      toggleForm()
      setMsg({ tipo: 'ok', texto: 'Programación actualizada.' })
      return
    }
    const nueva: ProgramacionVac = {
      id: Date.now(), fechaInicio: form.fechaInicio, fechaFin: form.fechaFin, dias: diasForm,
      anio: form.anio, estado, programadoPor: form.programadoPor, observaciones: form.observaciones || null,
    }
    setEmpleados((prev) => prev.map((e) => e.id === form.empleadoId
      ? { ...e, programaciones: [...e.programaciones, nueva] } : e))
    setExpandido((prev) => new Set(prev).add(form.empleadoId))
    toggleForm()
    setMsg({ tipo: 'ok', texto: 'Programación registrada.' })
  }

  const empleadoNombre = (id: number) => {
    const e = empleadosMock.find((x) => x.id === id)
    return e ? `${e.nombre} — ${e.tienda}` : ''
  }

  return (
    <div className="content-wrapper">
      <div className="d-flex align-items-end flex-wrap gap-2 mb-4">
        <PageBreadcrumb title={'Vacaciones'} subTitle1={'Gestión'} subText={'Programación anual de períodos de descanso remunerado'} />
        <div className="ms-auto d-flex gap-2 align-self-start">
          <Button variant="outline-secondary" onClick={() => setMsg({ tipo: 'ok', texto: 'Exportación no disponible en el prototipo.' })}>
            <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#download`}></use></svg>Exportar
          </Button>
          <Button variant="primary" onClick={abrirNueva}>
            <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#plus`}></use></svg>Nueva Programación
          </Button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}><KpiCard label="Total programadas" value={totalProg} accent="var(--primary-600, #4f46e5)" icon="sun" sub="registros activos" /></Col>
        <Col sm={6} xl={3}><KpiCard label="En curso" value={enCurso} accent="#10b981" icon="play" sub="activas ahora" /></Col>
        <Col sm={6} xl={3}><KpiCard label="Programadas" value={proximas} accent="#0ea5e9" icon="calendar" sub="próximas" /></Col>
        <Col sm={6} xl={3}><KpiCard label="Días promedio" value={diasProm} accent="#f59e0b" icon="clock" sub="por empleado" /></Col>
      </Row>

      <Card className="mb-3">
        <Card.Body className="py-3">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="input-group flex-nowrap" style={{ maxWidth: 280 }}>
              <span className="input-group-text px-2"><svg className="sa-icon sa-bold"><use href={`${basePath}/icons/sprite.svg#search`}></use></svg></span>
              <input type="text" className="form-control" placeholder="Buscar empleado o puesto…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} autoComplete="off" />
            </div>
            <select className="form-select" style={{ maxWidth: 150 }} value={fAnio} onChange={(e) => setFAnio(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Todos los años</option>
              {aniosMock.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <select className="form-select" style={{ maxWidth: 170 }} disabled><option>Todas las semanas</option></select>
            <select className="form-select" style={{ maxWidth: 170 }} value={fZona} onChange={(e) => setFZona(e.target.value)}>
              <option value="">Todas las zonas</option>
              {zonasMock.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
            <select className="form-select" style={{ maxWidth: 180 }} value={fTienda} onChange={(e) => setFTienda(e.target.value)}>
              <option value="">Todas las tiendas</option>
              {tiendasMock.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="ms-auto d-flex align-items-center gap-2">
              <span className="rol-estado-chip" style={{ ['--est' as string]: ESTADO_VAC_COLOR[ESTADO_ACTUAL_VAC] }}>
                <span className="rol-estado-dot" />{ESTADO_ACTUAL_VAC}
              </span>
              <button className="btn btn-sm btn-light rol-btn-ghost" onClick={() => setHistOpen(true)}>
                <svg className="rol-bico me-1"><use href={`${basePath}/icons/sprite.svg#clock`}></use></svg>Historial
              </button>
              <span className="text-muted small">{empleados.length} empleados</span>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {msg && <Aviso tipo={msg.tipo} texto={msg.texto} />}
          <div className="alert alert-light border py-2 px-3 mb-3 small text-muted">
            ⚠️ Datos de ejemplo — el módulo de Vacaciones aún no tiene backend. Las acciones son locales.
          </div>
          {cargando ? (
            <div className="text-muted py-4 text-center">Cargando…</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-muted small text-uppercase">
                    <th>Empleado</th><th>Puesto</th><th>Zona</th><th>Tienda</th>
                    <th>Programaciones de vacaciones</th><th className="text-center">Total días</th><th className="text-center">Mes obligatorio</th>
                  </tr>
                </thead>
                <tbody>
                  {empleados.map((e) => {
                    const activas = e.programaciones.filter((p) => p.estado !== 'Anulada')
                    const totalDias = activas.reduce((a, p) => a + p.dias, 0)
                    const pend = activas.filter((p) => p.estado === 'Pendiente').length
                    const abierto = expandido.has(e.id)
                    return (
                      <Fragment key={e.id}>
                        <tr>
                          <td className="fw-bold">{e.nombre}</td>
                          <td className="text-muted">{e.puesto}</td>
                          <td className="text-primary">{e.zona}</td>
                          <td>{e.tienda}</td>
                          <td>
                            {activas.length === 0 ? (
                              <span className="text-muted">— Sin programaciones</span>
                            ) : (
                              <button className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => toggleFila(e.id)}>
                                <span className="me-1">{abierto ? '▾' : '▸'}</span>{activas.length} programación{activas.length > 1 ? 'es' : ''}
                                {pend > 0 && <span className="badge bg-warning-subtle text-warning ms-2">{pend} pend.</span>}
                              </button>
                            )}
                          </td>
                          <td className="text-center fw-semibold">{totalDias || <span className="text-muted">—</span>}</td>
                          <td className="text-center"><MesBadge m={e.mesObligatorio} /></td>
                        </tr>
                        {abierto && activas.map((p) => (
                          <tr key={p.id} className="bg-light">
                            <td colSpan={7}>
                              <div className="d-flex align-items-center gap-3 ps-3 py-1">
                                <span className="fw-semibold">{fmtFecha(p.fechaInicio)} – {fmtFecha(p.fechaFin)}</span>
                                <span className="text-muted small">{p.dias}d · Año {p.anio}</span>
                                <span className={`badge bg-${ESTADO_STYLE[p.estado].color}-subtle text-${ESTADO_STYLE[p.estado].color}`}>{ESTADO_STYLE[p.estado].label}</span>
                                <button className="btn btn-sm btn-icon btn-outline-danger rounded-circle" onClick={() => anular(e, p)} title="Anular"><svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#x`}></use></svg></button>
                                <button className="btn btn-sm btn-icon btn-outline-secondary rounded-circle" onClick={() => abrirEditar(e, p)} title="Editar"><svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#edit-2`}></use></svg></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    )
                  })}
                  {empleados.length === 0 && (
                    <tr><td colSpan={7} className="text-center text-muted py-4">Sin empleados para el filtro.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal nueva / editar */}
      <Modal show={showForm} onHide={toggleForm} centered className="fade" tabIndex={-1}>
        <ModalHeader className="bg-dark text-white">
          <h5 className="modal-title text-white w-100 text-center">
            🌴 {editRef ? 'Editar' : 'Nueva'} Programación de Vacaciones
          </h5>
          <button type="button" className="btn-close btn-close-white" onClick={toggleForm}></button>
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <label className="form-label">Empleado <span className="text-danger">*</span></label>
            <select className="form-select" value={form.empleadoId} disabled={!!editRef} onChange={(e) => setForm((f) => ({ ...f, empleadoId: Number(e.target.value) }))}>
              <option value={0}>Seleccionar…</option>
              {empleadosMock.map((x) => <option key={x.id} value={x.id}>{x.nombre} — {x.tienda}</option>)}
            </select>
            {editRef && <div className="form-text">{empleadoNombre(form.empleadoId)}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Programado por (Zonal) <span className="text-danger">*</span></label>
            <input type="text" className="form-control" placeholder="Nombre del zonal responsable" value={form.programadoPor} onChange={(e) => setForm((f) => ({ ...f, programadoPor: e.target.value }))} />
          </div>
          <Row className="g-3 mb-3">
            <Col xs={6}>
              <label className="form-label">Fecha Inicio <span className="text-danger">*</span></label>
              <input type="date" className="form-control" value={form.fechaInicio} onChange={(e) => setForm((f) => ({ ...f, fechaInicio: e.target.value }))} />
            </Col>
            <Col xs={6}>
              <label className="form-label">Fecha Fin <span className="text-danger">*</span></label>
              <input type="date" className="form-control" min={form.fechaInicio || undefined} value={form.fechaFin} onChange={(e) => setForm((f) => ({ ...f, fechaFin: e.target.value }))} />
            </Col>
          </Row>
          <Row className="g-3 mb-3">
            <Col xs={6}>
              <label className="form-label">Días calculados</label>
              <input type="text" className="form-control bg-light" readOnly value={diasForm || 'Auto'} />
            </Col>
            <Col xs={6}>
              <label className="form-label">Año de Vacaciones</label>
              <select className="form-select" value={form.anio} onChange={(e) => setForm((f) => ({ ...f, anio: Number(e.target.value) }))}>
                {aniosMock.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Col>
          </Row>
          <div className="mb-3">
            <label className="form-label">Estado</label>
            <select className="form-select" value={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}>
              <option value="Programado">Programado</option>
              {ESTADOS.filter((s) => s !== 'Programada').map((s) => <option key={s} value={s}>{ESTADO_STYLE[s].label}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Observaciones</label>
            <textarea className="form-control" rows={2} placeholder="Opcional…" value={form.observaciones} onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))} />
          </div>
        </ModalBody>
        <ModalFooter className="justify-content-center gap-2">
          <Button variant="outline-success" onClick={guardar} disabled={!formValido}>✓ Guardar</Button>
          <Button variant="outline-danger" onClick={toggleForm}>✕ Cancelar</Button>
        </ModalFooter>
      </Modal>

      {/* ── Drawer: Historial de vacaciones ── */}
      {histOpen && (
        <div className="rol-hist-ov" onClick={() => setHistOpen(false)}>
          <aside className="rol-hist-panel" onClick={(e) => e.stopPropagation()}>
            <div className="rol-hist-hd">
              <div>
                <div className="rol-hist-ttl">Historial de vacaciones</div>
                <div className="rol-hist-sub">Flujo de programación anual</div>
              </div>
              <button className="rpm-close" onClick={() => setHistOpen(false)}>
                <svg className="rol-bico"><use href={`${basePath}/icons/sprite.svg#x`}></use></svg>
              </button>
            </div>

            <div className="rol-hist-estado">
              <span className="rol-estado-chip" style={{ ['--est' as string]: ESTADO_VAC_COLOR[ESTADO_ACTUAL_VAC] }}>
                <span className="rol-estado-dot" />{ESTADO_ACTUAL_VAC}
              </span>
              <span className="rol-hist-estado-txt">Estado actual del documento</span>
            </div>

            <div className="rol-hist-body">
              <ul className="rol-hist-tl">
                {HISTORIAL_VAC.map((h, i) => (
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

export default Vacaciones
