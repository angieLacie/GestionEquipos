import { Fragment, useMemo, useState } from 'react'
import { Button, Card, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'react-bootstrap'
import { useToggle } from 'usehooks-ts'
import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import KpiCard from '@/components/KpiCard.tsx'
import { useConfirm } from '@/components/ConfirmDialog.tsx'
import { basePath } from '@/helpers'
import {
  TIPOS, tipoDe, KPIS, SEMANA, CAL_TRABAJADORES, SUGERENCIAS, REGISTROS, RESUMEN,
  ESTADO_LABEL, ESTADO_COLOR, zonasMock, tiendasMock,
  type CalTrabajador, type RegistroDesc, type EstadoDesc,
} from '@/lib/descansos'
import '@/views/rol/rol.scss'

type Tab = 'calendario' | 'tabla' | 'resumen'

const fmtFecha = (iso: string | null) => { if (!iso) return '—'; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }
const iniciales = (n: string) => n.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
const COLORES = ['#4f46e5', '#0ea5e9', '#db2777', '#f59e0b', '#0d9488', '#16a34a', '#8b5cf6']
const colorDe = (n: string) => COLORES[n.length % COLORES.length]

const MotivoBadge = ({ tipoKey, motivo }: { tipoKey: string; motivo: string }) => {
  const t = tipoDe(tipoKey)
  return <span className="badge" style={{ background: (t?.color ?? '#888') + '22', color: t?.color ?? '#555' }}>{motivo}</span>
}

const FiltrosBar = () => (
  <>
    <select className="form-select form-select-sm"><option>Todas las zonas</option>{zonasMock.map((z) => <option key={z}>{z}</option>)}</select>
    <select className="form-select form-select-sm"><option>Todas las tiendas</option>{tiendasMock.map((t) => <option key={t}>{t}</option>)}</select>
    <select className="form-select form-select-sm"><option>Todos los tipos</option>{TIPOS.map((t) => <option key={t.key}>{t.label}</option>)}</select>
    <select className="form-select form-select-sm"><option>Todos los estados</option>{Object.values(ESTADO_LABEL).map((e) => <option key={e}>{e}</option>)}</select>
    <button className="btn btn-sm btn-light rol-btn-ghost"><svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#x`}></use></svg>Limpiar</button>
  </>
)

// Historial mock de acciones sobre descansos (timeline, forma = backend futuro).
type HistItem = {
  fecha: string; hora: string; usuario: string; rol: string
  accion: string; detalle?: string; antes?: string; despues?: string
  tipo: 'documento' | 'celda'
}
const HISTORIAL_DESC: HistItem[] = [
  { fecha: '14/06', hora: '08:30', usuario: 'M. Rojas', rol: 'GZ', accion: 'Generó sugerencia de descansos', detalle: 'Semana 24 · 11 sugeridos', tipo: 'documento' },
  { fecha: '14/06', hora: '09:10', usuario: 'M. Rojas', rol: 'GZ', accion: 'Programó descanso laboral', detalle: 'Rodrigo Villar · 26/05', antes: '—', despues: 'Descanso laboral', tipo: 'celda' },
  { fecha: '14/06', hora: '09:25', usuario: 'S. Méndez', rol: 'GT', accion: 'Programó cobertura', detalle: 'Sandra Méndez · 27/05', antes: '—', despues: 'Cobertura de tienda', tipo: 'celda' },
  { fecha: '14/06', hora: '10:05', usuario: 'M. Rojas', rol: 'GZ', accion: 'Editó motivo', detalle: 'Daniela Ríos · 28/05', antes: 'Descanso laboral', despues: 'Comp. por desc. no gozado', tipo: 'celda' },
  { fecha: '14/06', hora: '10:40', usuario: 'A. Campos', rol: 'GG', accion: 'Anuló programación', detalle: 'Mendez Peña, Carlos · 07/05', antes: 'Asesoría', despues: 'Anulado', tipo: 'celda' },
]

/** Agrupa filas por zona → tienda preservando orden. */
function agrupar<T extends { zona: string; tienda: string }>(filas: T[]) {
  const zonas: { zona: string; tiendas: { tienda: string; filas: T[] }[] }[] = []
  for (const f of filas) {
    let z = zonas.find((x) => x.zona === f.zona)
    if (!z) { z = { zona: f.zona, tiendas: [] }; zonas.push(z) }
    let t = z.tiendas.find((x) => x.tienda === f.tienda)
    if (!t) { t = { tienda: f.tienda, filas: [] }; z.tiendas.push(t) }
    t.filas.push(f)
  }
  return zonas
}

const Descansos = () => {
  const [tab, setTab] = useState<Tab>('calendario')
  const [msg, setMsg] = useState<string | null>(null)

  // Calendario: sugerencia automática + celdas confirmadas
  const [trabajadores, setTrabajadores] = useState<CalTrabajador[]>(CAL_TRABAJADORES)
  const [sugiriendo, setSugiriendo] = useState(false)

  // Programar dropdown
  const [showProg, setShowProg] = useState(false)
  const [histOpen, setHistOpen] = useState(false)

  // Modal editar/nueva
  const [showForm, toggleForm] = useToggle()
  const [editReg, setEditReg] = useState<RegistroDesc | null>(null)
  const [formTipo, setFormTipo] = useState('descanso_laboral')
  const [formFecha, setFormFecha] = useState('2026-06-16')
  const [formNotas, setFormNotas] = useState('')

  // Tabla local (para anular/editar)
  const [registros, setRegistros] = useState<RegistroDesc[]>(REGISTROS)
  const { confirm, dialog: confirmDialog } = useConfirm()

  const totalSugeridos = useMemo(() => Object.values(SUGERENCIAS).reduce((s, a) => s + a.length, 0), [])

  const confirmarSugeridos = () => {
    setTrabajadores((prev) => prev.map((t) => {
      const fechas = SUGERENCIAS[t.id]
      if (!fechas) return t
      const celdas = { ...t.celdas }
      fechas.forEach((f) => { celdas[f] = 'descanso_laboral' })
      return { ...t, celdas }
    }))
    setSugiriendo(false)
    setMsg('Descansos laborales confirmados.')
  }

  // Día picker del modal (14 días desde una base).
  const diasPicker = useMemo(() => {
    const base = new Date('2026-05-26')
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(base.getTime() + i * 86400000)
      return { iso: d.toISOString().slice(0, 10), dia: ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'][d.getUTCDay()], num: d.getUTCDate() }
    })
  }, [])

  const abrirNueva = (tipoKey: string) => {
    setEditReg(null); setFormTipo(tipoKey); setFormFecha('2026-06-16'); setFormNotas('')
    setShowProg(false); toggleForm()
  }
  const abrirEditarReg = (r: RegistroDesc) => {
    setEditReg(r); setFormTipo(r.tipoKey); setFormFecha(r.fechaInicio); setFormNotas('')
    toggleForm()
  }
  const guardar = () => {
    const t = tipoDe(formTipo)!
    if (editReg) {
      setRegistros((prev) => prev.map((r) => r.id === editReg.id ? { ...r, tipoKey: formTipo, motivo: t.label, fechaInicio: formFecha } : r))
      setMsg('Programación actualizada.')
    } else {
      setMsg('Programación registrada.')
    }
    toggleForm()
  }
  const eliminarReg = async () => {
    if (!editReg) return
    const ok = await confirm({ title: 'Eliminar programación', message: <>¿Eliminar la programación de <strong>{editReg.trabajador}</strong>?</>, confirmText: 'Eliminar', variant: 'danger' })
    if (!ok) return
    setRegistros((prev) => prev.filter((r) => r.id !== editReg.id))
    toggleForm(); setMsg('Programación eliminada.')
  }
  const anularReg = async (r: RegistroDesc) => {
    const ok = await confirm({ title: 'Anular programación', message: <>¿Anular la de <strong>{r.trabajador}</strong>?</>, confirmText: 'Anular', variant: 'danger' })
    if (!ok) return
    setRegistros((prev) => prev.map((x) => x.id === r.id ? { ...x, estado: 'Anulado' as EstadoDesc } : x))
    setMsg('Programación anulada.')
  }

  const calGrupos = useMemo(() => agrupar(trabajadores), [trabajadores])
  const tablaGrupos = useMemo(() => agrupar(registros), [registros])

  return (
    <div className="content-wrapper">
      <div className="d-flex align-items-end flex-wrap gap-2 mb-4">
        <PageBreadcrumb title={'Descansos y Compensaciones'} subTitle1={'Gestión'} subText={'Gestión integral de descansos, compensaciones y licencias'} />
        <span className="ms-auto badge bg-success-subtle text-success align-self-start">● En línea</span>
      </div>

      {/* KPIs */}
      <Row className="g-3 mb-4">
        <Col sm={6} xl><KpiCard size="sm" label="Activos" value={KPIS.activos} accent="#4f46e5" icon="users" /></Col>
        <Col sm={6} xl><KpiCard size="sm" label="En descanso" value={KPIS.enDescansoHoy} accent="#f97316" icon="coffee" /></Col>
        <Col sm={6} xl><KpiCard size="sm" label="Vacaciones" value={KPIS.deVacaciones} accent="#06b6d4" icon="sun" /></Col>
        <Col sm={6} xl><KpiCard size="sm" label="Con licencia" value={KPIS.conLicencia} accent="#f43f5e" icon="file-text" /></Col>
        <Col sm={6} xl><KpiCard size="sm" label="Prog. mes" value={KPIS.progMes} accent="#22c55e" icon="calendar" /></Col>
      </Row>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-3">
        {([['calendario', 'Calendario', 'calendar'], ['tabla', 'Tabla', 'list'], ['resumen', 'Resumen', 'bar-chart-2']] as const).map(([k, lbl, ic]) => (
          <button key={k} className={`btn btn-sm ${tab === k ? 'btn-dark' : 'btn-outline-secondary'}`} onClick={() => setTab(k)}>
            <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#${ic}`}></use></svg>{lbl}
          </button>
        ))}
      </div>

      {msg && <div className="alert alert-success py-2 px-3">{msg}</div>}
      <div className="alert alert-light border py-2 px-3 mb-3 small text-muted">⚠️ Datos de ejemplo — el módulo de Descansos aún no tiene backend. Las acciones son locales.</div>

      {/* ── CALENDARIO ── */}
      {tab === 'calendario' && (
        <>
        <Card className="rol-toolbar mb-3">
          <Card.Body className="rol-toolbar-inner">
            <div className="rol-toolbar-filters">
              <FiltrosBar />
            </div>
            <div className="rol-toolbar-actions">
              <div className="rol-cols-wrap" onClick={(e) => e.stopPropagation()}>
                <button className="btn btn-sm btn-primary" onClick={() => setShowProg((v) => !v)}>
                  <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#calendar`}></use></svg>Programar
                  <svg className="sa-icon ms-1"><use href={`${basePath}/icons/sprite.svg#chevron-down`}></use></svg>
                </button>
                {showProg && (
                  <div className="rol-prog-menu">
                    <button className="rol-prog-item" onClick={() => { setShowProg(false); abrirNueva('descanso_laboral') }}>
                      <span className="rol-prog-ico">🛌</span>
                      <span><strong>Descanso laboral</strong><small>2 días, sin cruce, sin registro previo</small></span>
                    </button>
                    <button className="rol-prog-item" onClick={() => { setShowProg(false); abrirNueva('comp_feriado') }}>
                      <span className="rol-prog-ico">🔄</span>
                      <span><strong>Compensación</strong><small>Por feriado o descanso semanal laborado</small></span>
                    </button>
                  </div>
                )}
              </div>
              <button className="btn btn-sm btn-success" onClick={() => setMsg('Exportación no disponible en el prototipo.')}>
                <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#download`}></use></svg>Exportar Excel
              </button>
            </div>
          </Card.Body>
        </Card>

        <Card className="rol-card">
            {/* Banner sugerencia */}
            {sugiriendo ? (
              <div className="d-flex align-items-center gap-2 bg-dark text-white px-3 py-2">
                <span className="fs-5">🛌</span>
                <div className="me-auto">
                  <span className="fw-semibold">Descansos laborales sugeridos</span>
                  <span className="ms-2 small opacity-75">{totalSugeridos} descansos laborales sugeridos</span>
                </div>
                <Button size="sm" variant="success" onClick={confirmarSugeridos}>✓ Confirmar descansos laborales</Button>
                <Button size="sm" variant="outline-light" onClick={() => setSugiriendo(false)}>✕ Descartar</Button>
              </div>
            ) : (
              <div className="rol-weeknav">
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-sm btn-light">‹</button>
                  <button className="btn btn-sm btn-outline-primary">Hoy</button>
                  <button className="btn btn-sm btn-light">›</button>
                  <strong className="ms-2">Sem · 14 jun – 20 jun 2026</strong>
                  <span className="text-muted small">· {trabajadores.length} trabajadores</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-sm btn-light rol-btn-ghost" onClick={() => setHistOpen(true)}>
                    <svg className="rol-bico me-1"><use href={`${basePath}/icons/sprite.svg#clock`}></use></svg>Historial
                  </button>
                  <Button size="sm" variant="outline-primary" onClick={() => setSugiriendo(true)}>
                    <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#zap`}></use></svg>Sugerencia automática
                  </Button>
                </div>
              </div>
            )}

            <div className="rol-grid">
              <table className="rol-tbl" style={{ minWidth: 900 }}>
                <thead>
                  <tr className="rol-tr-group">
                    <th className="rol-th-id">Puesto</th>
                    <th className="rol-th-id rol-th-trab">Trabajador</th>
                    {SEMANA.map((d) => (
                      <th key={d.iso} className="rol-th-dia">
                        <div className="rol-dia-nombre">{d.dia}</div>
                        <div className="rol-dia-fecha">{d.label}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calGrupos.map((z) => (
                    <Fragment key={z.zona}>
                      <tr className="rol-tr-zona">
                        <td colSpan={9}>
                          <div className="rol-zona-row">
                            <span>▾ {z.zona.toUpperCase()}</span>
                            <span className="badge bg-primary">{z.tiendas.reduce((s, t) => s + t.filas.length, 0)} PERSONAS</span>
                          </div>
                        </td>
                      </tr>
                      {z.tiendas.map((t) => (
                        <Fragment key={t.tienda}>
                          <tr className="rol-tr-tienda"><td colSpan={9}><svg className="rol-bico"><use href={`${basePath}/icons/sprite.svg#map-pin`}></use></svg> {t.tienda}</td></tr>
                          {t.filas.map((w) => (
                            <tr className="rol-tr-fila" key={w.id}>
                              <td className="rol-td-puesto">{w.puesto}</td>
                              <td className="rol-td-trab">{w.trabajador}</td>
                              {SEMANA.map((d) => {
                                const tipoKey = w.celdas[d.iso]
                                const sugerido = sugiriendo && SUGERENCIAS[w.id]?.includes(d.iso) && !tipoKey
                                return (
                                  <td key={d.iso} className="text-center" style={{ cursor: 'pointer' }} onClick={() => abrirNueva('descanso_laboral')}>
                                    {tipoKey ? (
                                      <span className="badge w-100" style={{ background: (tipoDe(tipoKey)!.color) + '22', color: tipoDe(tipoKey)!.color }}>{tipoDe(tipoKey)!.label}</span>
                                    ) : sugerido ? (
                                      <span className="d-block rounded-2 px-2 py-1 small" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px dashed #f87171' }}>
                                        Descanso<br /><span className="fw-bold" style={{ fontSize: 10 }}>SUGERIDO</span>
                                      </span>
                                    ) : <span className="text-muted">—</span>}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </Fragment>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
        </Card>
        </>
      )}

      {/* ── TABLA ── */}
      {tab === 'tabla' && (
        <>
        <Card className="rol-toolbar mb-3">
          <Card.Body className="rol-toolbar-inner">
            <div className="rol-toolbar-filters">
              <FiltrosBar />
            </div>
            <div className="rol-toolbar-actions">
              <button className="btn btn-sm btn-success" onClick={() => setMsg('Exportación no disponible en el prototipo.')}>
                <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#download`}></use></svg>Exportar Excel
              </button>
            </div>
          </Card.Body>
        </Card>
        <Card className="rol-card">
          <Card.Body>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-muted small text-uppercase">
                    <th>Puesto</th><th>Trabajador</th><th>Motivo</th><th>Fecha inicio</th><th>Fecha fin</th><th>Estado</th><th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tablaGrupos.map((z) => (
                    <Fragment key={z.zona}>
                      <tr className="bg-dark text-white"><td colSpan={7} className="fw-semibold">▾ {z.zona.toUpperCase()}</td></tr>
                      {z.tiendas.map((t) => (
                        <Fragment key={t.tienda}>
                          <tr className="bg-light"><td colSpan={7} className="small fw-semibold text-danger">📍 {t.tienda}</td></tr>
                          {t.filas.map((r) => (
                            <tr key={r.id}>
                              <td className="text-muted small">{r.puesto}</td>
                              <td>
                                <span className="d-inline-flex align-items-center gap-2">
                                  <span className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fw-semibold" style={{ width: 28, height: 28, fontSize: 11, background: colorDe(r.trabajador) }}>{iniciales(r.trabajador)}</span>
                                  <span className="fw-semibold">{r.trabajador}</span>
                                </span>
                              </td>
                              <td>
                                <MotivoBadge tipoKey={r.tipoKey} motivo={r.motivo} />
                                {r.compensa && <div className="text-muted" style={{ fontSize: 11 }}>↩ Compensa: {fmtFecha(r.compensa)}</div>}
                              </td>
                              <td>{fmtFecha(r.fechaInicio)}</td>
                              <td>{fmtFecha(r.fechaFin)}</td>
                              <td><span className={`badge bg-${ESTADO_COLOR[r.estado]}-subtle text-${ESTADO_COLOR[r.estado]}`}>{ESTADO_LABEL[r.estado]}</span></td>
                              <td className="text-center">
                                <div className="d-inline-flex gap-1">
                                  <button className="btn btn-sm btn-icon btn-outline-secondary rounded-circle" onClick={() => abrirEditarReg(r)} title="Editar"><svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#edit-2`}></use></svg></button>
                                  <button className="btn btn-sm btn-icon btn-outline-danger rounded-circle" onClick={() => anularReg(r)} disabled={r.estado === 'Anulado'} title="Anular"><svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#trash-2`}></use></svg></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
        </>
      )}

      {/* ── RESUMEN ── */}
      {tab === 'resumen' && (
        <>
        <Card className="rol-toolbar mb-3">
          <Card.Body className="rol-toolbar-inner">
            <div className="rol-toolbar-filters">
              <FiltrosBar />
            </div>
            <div className="rol-toolbar-actions">
              <button className="btn btn-sm btn-success" onClick={() => setMsg('Exportación no disponible en el prototipo.')}>
                <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#download`}></use></svg>Exportar Excel
              </button>
            </div>
          </Card.Body>
        </Card>
        <Card className="rol-card">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-end mb-2">
              <div>
                <h6 className="mb-0 fw-bold">Resumen por tienda</h6>
                <span className="small text-muted">Cobertura, ausencias y nivel de riesgo por tienda</span>
              </div>
              <a href="#" className="small text-primary" onClick={(e) => e.preventDefault()}>Ver todas las tiendas</a>
            </div>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-muted small text-uppercase">
                    <th>Tda.</th><th>Nombre</th><th className="text-center">Trab.</th><th className="text-center">Pend.</th><th className="text-center">Comp.</th><th className="text-center">Lic.</th><th>Cobertura</th><th className="text-center">Riesgo</th>
                  </tr>
                </thead>
                <tbody>
                  {RESUMEN.map((s) => (
                    <tr key={s.codigo}>
                      <td className="fw-semibold text-muted">{s.codigo}</td>
                      <td><div className="fw-semibold">{s.nombre}</div><div className="small text-muted">{s.zona}</div></td>
                      <td className="text-center">{s.trab}</td>
                      <td className="text-center">{s.pend}</td>
                      <td className="text-center">{s.comp}</td>
                      <td className="text-center">{s.lic}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: 8, minWidth: 140 }}>
                            <div className={`progress-bar bg-${s.cobertura >= 100 ? 'success' : 'danger'}`} style={{ width: `${s.cobertura}%` }} />
                          </div>
                          <span className="small fw-semibold">{s.cobertura}%</span>
                        </div>
                      </td>
                      <td className="text-center"><span className={`badge bg-${s.riesgo === 'CRÍTICO' ? 'danger' : 'success'}-subtle text-${s.riesgo === 'CRÍTICO' ? 'danger' : 'success'}`}>{s.riesgo}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
        </>
      )}

      {/* ── Drawer: Historial de descansos ── */}
      {histOpen && (
        <div className="rol-hist-ov" onClick={() => setHistOpen(false)}>
          <aside className="rol-hist-panel" onClick={(e) => e.stopPropagation()}>
            <div className="rol-hist-hd">
              <div>
                <div className="rol-hist-ttl">Historial de descansos</div>
                <div className="rol-hist-sub">Semana · 14 jun – 20 jun 2026</div>
              </div>
              <button className="rpm-close" onClick={() => setHistOpen(false)}>
                <svg className="rol-bico"><use href={`${basePath}/icons/sprite.svg#x`}></use></svg>
              </button>
            </div>
            <div className="rol-hist-body">
              <ul className="rol-hist-tl">
                {HISTORIAL_DESC.map((h, i) => (
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

      {/* Modal editar / nueva programación */}
      <Modal show={showForm} onHide={toggleForm} centered size="lg" className="fade" tabIndex={-1}>
        <ModalHeader>
          <div>
            <h5 className="modal-title mb-0">▬ {editReg ? 'Editar' : 'Nueva'} Programación</h5>
            {editReg && <div className="text-muted small">{editReg.trabajador} · {editReg.tienda}</div>}
          </div>
          <button type="button" className="btn-close" onClick={toggleForm}></button>
        </ModalHeader>
        <ModalBody>
          <div className="text-muted small text-uppercase fw-semibold mb-2">Fecha de inicio</div>
          <div className="d-flex flex-wrap gap-1 mb-3">
            {diasPicker.map((d) => (
              <button key={d.iso} onClick={() => setFormFecha(d.iso)}
                className={`btn btn-sm ${formFecha === d.iso ? 'btn-primary' : 'btn-outline-secondary'}`} style={{ width: 56 }}>
                <div style={{ fontSize: 10 }}>{d.dia}</div><div className="fw-bold">{d.num}</div>
              </button>
            ))}
          </div>

          <div className="text-muted small text-uppercase fw-semibold mb-2">Tipo</div>
          <Row className="g-2 mb-3">
            {TIPOS.map((t) => (
              <Col md={6} key={t.key}>
                <button onClick={() => setFormTipo(t.key)}
                  className={`btn w-100 text-start border rounded-3 p-2 ${formTipo === t.key ? 'border-primary bg-primary-subtle' : 'btn-outline-light text-dark'}`}>
                  <div className="d-flex align-items-start gap-2">
                    <span className="rounded-circle flex-shrink-0 mt-1" style={{ width: 10, height: 10, background: t.color }} />
                    <div>
                      <div className="fw-semibold small">{t.label}{formTipo === t.key && ' ✓'}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>{t.desc}</div>
                    </div>
                  </div>
                </button>
              </Col>
            ))}
          </Row>

          <div className="text-muted small text-uppercase fw-semibold mb-1">Notas</div>
          <textarea className="form-control" rows={2} placeholder="Motivo, observaciones…" value={formNotas} onChange={(e) => setFormNotas(e.target.value)} />
        </ModalBody>
        <ModalFooter className="justify-content-between">
          {editReg ? <Button variant="link" className="text-danger p-0" onClick={eliminarReg}>🗑 Eliminar</Button> : <span />}
          <div className="d-flex gap-2">
            <Button variant="light" onClick={toggleForm}>Cancelar</Button>
            <Button variant="primary" onClick={guardar}>💾 {editReg ? 'Guardar cambios' : 'Guardar'}</Button>
          </div>
        </ModalFooter>
      </Modal>

      {confirmDialog}
    </div>
  )
}

export default Descansos
