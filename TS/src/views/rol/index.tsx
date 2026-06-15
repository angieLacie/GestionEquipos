import { Fragment, useEffect, useMemo, useState } from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import KpiCard from '@/components/KpiCard.tsx'
import NovaSelect from '@/components/NovaSelect.tsx'
import { useConfirm } from '@/components/ConfirmDialog.tsx'
import { basePath } from '@/helpers'
import {
  CARGOS_FILTRO,
  GRUPOS,
  kpis,
  pendientes,
  TIPOS,
  TIPOS_FILTRO,
  type Celda,
  type GrupoKey,
  type TipoKey,
  type Zona,
} from './data'
import { listarRoster, obtenerMapaPuestoCategoria, rosterAZonas } from '@/lib/roster'
import { diasDeSemana, etiquetaSemana, inicioSemana, mismaSemana, sumarDias } from './fechas'
import './rol.scss'

type ColsVisibles = { puesto: boolean; trabajador: boolean } & Record<GrupoKey, boolean>

const pct = (n: number) => (n > 0 ? `${n}%` : '—')
const pctCls = (n: number) => (n === 0 ? 'q-na' : n >= 100 ? 'q-ok' : n >= 85 ? 'q-mid' : 'q-low')

const Ico = ({ name }: { name: string }) => (
  <svg className="rol-bico" aria-hidden="true">
    <use href={`${basePath}/icons/sprite.svg#${name}`}></use>
  </svg>
)

const Chip = ({ celda, dim }: { celda: Celda | null; dim: boolean }) => {
  if (!celda) return <div className="rol-cell rol-cell--empty" />
  const def = TIPOS[celda.tipo]
  return (
    <div className={`rol-cell rol-chip rol-chip--${def.cls} ${dim ? 'rol-cell--dim' : ''}`} title={def.etiqueta}>
      <span className="rol-chip-top">
        <span className="rol-chip-code">{def.code}</span>
        {celda.detalle && <span className="rol-chip-det">{celda.detalle}</span>}
      </span>
      <span className="rol-chip-label">{def.etiqueta}</span>
      {celda.estado && <span className="rol-chip-estado">{celda.estado}</span>}
    </div>
  )
}

// Metadatos de tipo para el modal (subtítulo + color del punto)
const TIPO_META: Record<TipoKey, { sub: string; dot: string }> = {
  'laboral':          { sub: 'Día de trabajo en tienda',       dot: '#3730a3' },
  'descanso':         { sub: 'Descanso semanal programado',    dot: '#16a34a' },
  'cobertura-tienda': { sub: 'Cobertura operativa de tienda',  dot: '#1d4ed8' },
  'comp-feriado':     { sub: 'Por feriado trabajado',          dot: '#c2410c' },
  'comp-descanso':    { sub: 'Por desc. lab. no gozado',       dot: '#c2410c' },
  'cobertura-venta':  { sub: 'Solo tiendas Lukers',            dot: '#854d0e' },
  'apoyo':            { sub: 'Asignación a oficina central',   dot: '#166534' },
  'descanso-medico':  { sub: 'Reposo médico certificado',      dot: '#991b1b' },
  'vacaciones':       { sub: 'Vacaciones anuales',             dot: '#115e59' },
  'lic':              { sub: 'Licencia del trabajador',        dot: '#6d28d9' },
  'feriado-trab':     { sub: 'Feriado trabajado',              dot: '#166534' },
}

const esCompensacion = (t: TipoKey | null) => t === 'comp-feriado' || t === 'comp-descanso'

const TIPOS_LISTA: TipoKey[] = [
  'descanso', 'cobertura-tienda',
  'comp-feriado', 'comp-descanso',
  'cobertura-venta', 'apoyo',
  'descanso-medico', 'vacaciones',
  'lic', 'feriado-trab',
]

const PendientesCard = () => {
  const [abierto, setAbierto] = useState<string | null>(null)
  const total = pendientes.reduce((s, p) => s + p.feriados + p.descansos, 0)

  return (
    <Card className="rol-card">
      <div className="rol-pend-hd">
        <span className="rol-pend-ttl">Pendientes: Feriados y Descansos no Gozados</span>
        <span className="rol-pend-cnt">{total} pendientes</span>
        <span className="rol-pend-sub">Clic en un empleado para ver las fechas</span>
      </div>
      <table className="rol-pend-tbl">
        <thead>
          <tr>
            <th>Personal</th>
            <th className="text-center">Feriados Pendientes</th>
            <th className="text-center">Descansos no Gozados</th>
          </tr>
        </thead>
        <tbody>
          {pendientes.map((p) => {
            const expandido = abierto === p.trabajador
            const tieneDatos = p.feriados > 0 || p.descansos > 0
            return (
              <Fragment key={p.trabajador}>
                <tr
                  className={`rol-pend-row ${tieneDatos ? 'rol-pend-row--click' : ''} ${expandido ? 'rol-pend-row--open' : ''}`}
                  onClick={() => tieneDatos && setAbierto(expandido ? null : p.trabajador)}
                >
                  <td>
                    <div className="rol-pend-emp">
                      {tieneDatos && <span className="rol-pend-arrow">{expandido ? '▼' : '▶'}</span>}
                      <span className="fw-semibold">{p.trabajador}</span>
                      <span className="rol-pend-emp-sub">{p.cargo}</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={`rol-pm-num ${p.feriados > 0 ? 'red' : 'gray'}`}>{p.feriados}</span>
                  </td>
                  <td className="text-center">
                    <span className={`rol-pm-num ${p.descansos > 0 ? 'orange' : 'gray'}`}>{p.descansos}</span>
                  </td>
                </tr>
                {expandido && (
                  <tr className="rol-pend-det-row">
                    <td colSpan={3}>
                      <div className="rol-pend-det">
                        <div className="rol-pend-det-ttl">{p.trabajador} — Pendientes</div>
                        {p.feriados > 0 && (
                          <div className="rol-pend-det-sec">
                            <div className="rol-pend-det-sec-hd red">● Feriados trabajados ({p.feriados}):</div>
                            <ul>{p.detFeriados.map((f) => <li key={f}>{f}</li>)}</ul>
                          </div>
                        )}
                        {p.descansos > 0 && (
                          <div className="rol-pend-det-sec">
                            <div className="rol-pend-det-sec-hd orange">● Descansos no gozados ({p.descansos}):</div>
                            <ul>{p.detDescansos.map((d) => <li key={d}>{d}</li>)}</ul>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}

type ModalCtx = {
  zonaIdx: number
  tiendaIdx: number
  filaIdx: number
  nombre: string
  tiendaNombre: string
  diasSel: number[]
}

const Rol = () => {
  const [tab, setTab] = useState<'semanal' | 'pendientes'>('semanal')
  const [dom, setDom] = useState<Date>(() => inicioSemana(new Date()))
  const [colsOpen, setColsOpen] = useState(false)
  const [progOpen, setProgOpen] = useState(false)
  const [zonasColapsadas, setZonasColapsadas] = useState<Set<string>>(new Set())
  const toggleZona = (nombre: string) =>
    setZonasColapsadas((prev) => {
      const next = new Set(prev)
      next.has(nombre) ? next.delete(nombre) : next.add(nombre)
      return next
    })
  const [cols, setCols] = useState<ColsVisibles>({
    puesto: true, trabajador: true, asesor: true, senior: true, asesoria: true, tesoro: true, sem: true,
  })

  // Filtros
  const [fZonas, setFZonas] = useState<string[]>([])
  const [fTiendas, setFTiendas] = useState<string[]>([])
  const [fCargos, setFCargos] = useState<string[]>([])
  const [fTipos, setFTipos] = useState<string[]>([])
  const [busqueda, setBusqueda] = useState('')

  // Roster real (RMS vía /v1/maes/empleados/roster). Editable en memoria para las celdas.
  const [localZonas, setLocalZonas] = useState<Zona[]>([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    setCargando(true)
    Promise.all([listarRoster({ pageSize: 2000 }), obtenerMapaPuestoCategoria()])
      .then(([pag, mapa]) => { if (vivo) { setLocalZonas(rosterAZonas(pag.items, mapa)); setErrorCarga(null) } })
      .catch((e) => { if (vivo) setErrorCarga(e?.message ?? 'No se pudo cargar el roster.') })
      .finally(() => { if (vivo) setCargando(false) })
    return () => { vivo = false }
  }, [])

  // Opciones de filtro derivadas del roster cargado
  const listaZonas = useMemo(() => [...new Set(localZonas.map((z) => z.nombre))], [localZonas])
  const listaTiendas = useMemo(
    () => [...new Set(localZonas.flatMap((z) => z.tiendas.map((t) => t.nombre)))],
    [localZonas],
  )

  // Modal de programación
  const [modal, setModal] = useState<ModalCtx | null>(null)
  const [selTipo, setSelTipo] = useState<TipoKey | null>(null)
  const [tiendaCob, setTiendaCob] = useState('')
  const [tiendaStep, setTiendaStep] = useState(false)
  const [compStep, setCompStep] = useState(false)
  const [fechaComp, setFechaComp] = useState('') // fecha que se compensa (CF/CD)
  const [notas, setNotas] = useState('')

  // Confirmación para acciones destructivas (anular)
  const { confirm, dialog: confirmDialog } = useConfirm()

  const dias = useMemo(() => diasDeSemana(dom), [dom])
  const esSemanaActual = mismaSemana(dom, new Date())
  const irHoy = () => setDom(inicioSemana(new Date()))
  const semanaAnterior = () => setDom((d) => sumarDias(d, -7))
  const semanaSiguiente = () => setDom((d) => sumarDias(d, 7))

  const limpiarFiltros = () => { setFZonas([]); setFTiendas([]); setFCargos([]); setFTipos([]); setBusqueda('') }

  const optZonas = listaZonas.map((z) => ({ value: z, label: z }))
  const optTiendas = listaTiendas.map((t) => ({ value: t, label: t }))
  const optCargos = CARGOS_FILTRO.filter((o) => o.value !== 'todos').map((o) => ({ value: o.value, label: o.label }))
  const optTipos = TIPOS_FILTRO.filter((o) => o.value !== '').map((o) => ({ value: o.value, label: o.label }))

  const setCol = (k: keyof ColsVisibles, v: boolean) => setCols((c) => ({ ...c, [k]: v }))

  const gruposVis = useMemo(() => GRUPOS.filter((g) => cols[g.key]), [cols])
  const metricColsVis = useMemo(() => gruposVis.flatMap((g) => g.cols), [gruposVis])

  // Datos filtrados con índices originales preservados para edición
  const zonasFiltradas = useMemo(() => {
    const query = busqueda.trim().toLowerCase()
    return localZonas
      .map((z, zi) => ({
        ...z, zi,
        tiendas: z.tiendas.map((t, ti) => ({
          ...t, ti,
          filas: t.filas
            .map((f, fi) => ({ ...f, fi }))
            .filter((f) => {
              if (fCargos.length > 0 && !fCargos.includes(f.cargo)) return false
              if (query && !f.trabajador.toLowerCase().includes(query)) return false
              return true
            }),
        }))
        .filter((t) => (fTiendas.length === 0 || fTiendas.includes(t.nombre)) && t.filas.length > 0),
      }))
      .filter((z) => (fZonas.length === 0 || fZonas.includes(z.nombre)) && z.tiendas.length > 0)
  }, [localZonas, fZonas, fTiendas, fCargos, busqueda])

  const totalCols = (cols.puesto ? 1 : 0) + (cols.trabajador ? 1 : 0) + metricColsVis.length + 7

  // ── Handlers del modal ──────────────────────────────────────

  function abrirModal(zonaIdx: number, tiendaIdx: number, filaIdx: number, diaIdx: number) {
    const fila = localZonas[zonaIdx].tiendas[tiendaIdx].filas[filaIdx]
    const cel = fila.celdas[diaIdx]
    setModal({
      zonaIdx, tiendaIdx, filaIdx,
      nombre: fila.trabajador,
      tiendaNombre: localZonas[zonaIdx].tiendas[tiendaIdx].nombre,
      diasSel: [diaIdx],
    })
    setSelTipo(cel?.tipo ?? null)
    setTiendaCob(esCompensacion(cel?.tipo ?? null) ? '' : (cel?.detalle ?? ''))
    setFechaComp(esCompensacion(cel?.tipo ?? null) ? (cel?.detalle ?? '') : '')
    setTiendaStep(false)
    setCompStep(false)
    setNotas('')
  }

  function toggleDia(idx: number) {
    setModal((m) => {
      if (!m) return m
      const ya = m.diasSel.includes(idx)
      const nuevos = ya ? m.diasSel.filter((x) => x !== idx) : [...m.diasSel, idx]
      return nuevos.length > 0 ? { ...m, diasSel: nuevos } : m
    })
  }

  function guardarModal() {
    if (!modal || !selTipo) return
    if (selTipo === 'cobertura-tienda' && !tiendaCob) { setTiendaStep(true); return }
    if (esCompensacion(selTipo) && !fechaComp) { setCompStep(true); return }
    const detalle = selTipo === 'cobertura-tienda' ? tiendaCob : esCompensacion(selTipo) ? fechaComp : undefined
    setLocalZonas((prev) => {
      const z = JSON.parse(JSON.stringify(prev)) as Zona[]
      const fila = z[modal.zonaIdx].tiendas[modal.tiendaIdx].filas[modal.filaIdx]
      for (const d of modal.diasSel) {
        fila.celdas[d] = { tipo: selTipo, estado: 'PROGRAMADO', ...(detalle ? { detalle } : {}) }
      }
      return z
    })
    setModal(null)
  }

  async function anularModal() {
    if (!modal) return
    const ok = await confirm({
      title: 'Anular programación',
      message: <>¿Anular la programación de <strong>{modal.nombre}</strong> en {modal.diasSel.length} día(s)?</>,
      confirmText: 'Anular',
      variant: 'danger',
    })
    if (!ok) return
    setLocalZonas((prev) => {
      const z = JSON.parse(JSON.stringify(prev)) as Zona[]
      const fila = z[modal.zonaIdx].tiendas[modal.tiendaIdx].filas[modal.filaIdx]
      for (const d of modal.diasSel) fila.celdas[d] = null
      return z
    })
    setModal(null)
  }

  const celdaActual = modal
    ? localZonas[modal.zonaIdx].tiendas[modal.tiendaIdx].filas[modal.filaIdx].celdas[modal.diasSel[0]]
    : null

  // Sugerencias de fecha a compensar: pendientes del trabajador (por nombre).
  const sugComp = useMemo(() => {
    if (!modal || !esCompensacion(selTipo)) return [] as string[]
    const p = pendientes.find((x) => x.trabajador === modal.nombre)
    if (!p) return []
    return selTipo === 'comp-feriado' ? p.detFeriados : p.detDescansos
  }, [modal, selTipo])

  return (
    <div className="content-wrapper rol-page" onClick={() => { colsOpen && setColsOpen(false); progOpen && setProgOpen(false) }}>
      <div className="d-flex align-items-end flex-wrap gap-2 mb-4">
        <PageBreadcrumb title={'Rol de Personal'} subTitle1={'Gestión'} subText={'Programación semanal del rol de personal por tienda'} />
        <div className="ms-auto d-flex align-items-center gap-3 small text-muted">
          <span><Ico name="refresh-cw" /> Última act. hoy</span>
          <span className="rol-online">● En línea</span>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {kpis.map((k) => (
          <Col key={k.label} xs={6} md={4} xl>
            <KpiCard label={k.label} value={k.valor} accent={k.color} icon={k.icon} sub={k.sub} className="rol-kpi-card" />
          </Col>
        ))}
      </Row>

      <div className="rol-tabs">
        <button className={`rol-tab ${tab === 'semanal' ? 'active' : ''}`} onClick={() => setTab('semanal')}>
          <Ico name="clipboard" /> Rol semanal
        </button>
        <button className={`rol-tab ${tab === 'pendientes' ? 'active' : ''}`} onClick={() => setTab('pendientes')}>
          <Ico name="bookmark" /> Pendientes
        </button>
      </div>

      {tab === 'pendientes' ? (
        <PendientesCard />
      ) : (
        <>
          <Card className="rol-toolbar mb-3">
            <Card.Body className="rol-toolbar-inner">
              <div className="rol-toolbar-filters">
                <NovaSelect options={optZonas} value={fZonas} onChange={setFZonas} placeholder="Todas las zonas" minWidth={170} />
                <NovaSelect options={optTiendas} value={fTiendas} onChange={setFTiendas} placeholder="Todas las tiendas" minWidth={180} />
                <NovaSelect options={optCargos} value={fCargos} onChange={setFCargos} placeholder="Todos los cargos" minWidth={160} />
                <NovaSelect options={optTipos} value={fTipos} onChange={setFTipos} placeholder="Todos los tipos" minWidth={190} />
                <button className="btn btn-sm btn-light rol-btn-ghost" onClick={limpiarFiltros}><Ico name="x" />Limpiar</button>
              </div>
              <div className="rol-toolbar-actions">
                <div className="rol-cols-wrap" onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn-sm btn-primary" onClick={() => setProgOpen((o) => !o)}><Ico name="grid" />Programar <Ico name="chevron-down" /></button>
                  {progOpen && (
                    <div className="rol-prog-menu">
                      <button className="rol-prog-item" onClick={() => setProgOpen(false)}>
                        <span className="rol-prog-ico"><Ico name="shopping-bag" /></span>
                        <span><strong>Cobertura de tienda</strong><small>Asignar cobertura a una tienda</small></span>
                      </button>
                      <button className="rol-prog-item" onClick={() => setProgOpen(false)}>
                        <span className="rol-prog-ico"><Ico name="bar-chart" /></span>
                        <span><strong>Encargatura</strong><small>Registrar encargatura de tienda</small></span>
                      </button>
                      <button className="rol-prog-item" onClick={() => setProgOpen(false)}>
                        <span className="rol-prog-ico"><Ico name="briefcase" /></span>
                        <span><strong>Cobertura por tipo de venta</strong><small>Solo tiendas Lukers</small></span>
                      </button>
                    </div>
                  )}
                </div>
                <button className="btn btn-sm btn-success"><Ico name="download" />Exportar Excel</button>
                <div className="rol-cols-wrap" onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setColsOpen((o) => !o)}><Ico name="columns" />Columnas <Ico name="chevron-down" /></button>
                  {colsOpen && (
                    <div className="rol-cols-menu">
                      <div className="rol-cols-ttl">Mostrar columnas</div>
                      <label><input type="checkbox" checked={cols.puesto} onChange={(e) => setCol('puesto', e.target.checked)} /> Puesto</label>
                      <label><input type="checkbox" checked={cols.trabajador} onChange={(e) => setCol('trabajador', e.target.checked)} /> Trabajador</label>
                      {GRUPOS.map((g) => (
                        <label key={g.key}>
                          <input type="checkbox" checked={cols[g.key]} onChange={(e) => setCol(g.key, e.target.checked)} /> {g.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <button className="btn btn-sm btn-primary"><Ico name="send" />Enviar a aprobación</button>
              </div>
            </Card.Body>
          </Card>

          <Card className="rol-card">
            <div className="rol-weeknav">
              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-sm btn-light" onClick={semanaAnterior}><Ico name="chevron-left" /></button>
                <button className={`btn btn-sm ${esSemanaActual ? 'btn-outline-primary' : 'btn-primary'}`} onClick={irHoy}>Hoy</button>
                <button className="btn btn-sm btn-light" onClick={semanaSiguiente}><Ico name="chevron-right" /></button>
                <strong className="ms-2">{etiquetaSemana(dom)}</strong>
                {esSemanaActual && <span className="badge bg-light text-secondary">Semana actual</span>}
              </div>
              <input className="form-control form-control-sm rol-search" placeholder="Buscar trabajador" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>

            <div className="rol-grid">
              <table className="rol-tbl">
                <thead>
                  <tr className="rol-tr-group">
                    {cols.puesto && <th className="rol-th-id" rowSpan={2}>Puesto</th>}
                    {cols.trabajador && <th className="rol-th-id rol-th-trab" rowSpan={2}>Trabajador</th>}
                    {gruposVis.map((g) => (
                      <th key={g.key} className={`rol-th-grp ${g.cls}`} colSpan={g.cols.length}>{g.label}</th>
                    ))}
                    <th className="rol-th-grp g-week" colSpan={7}>Semana en curso</th>
                  </tr>
                  <tr className="rol-tr-sub">
                    {gruposVis.map((g) =>
                      g.cols.map((col) => (
                        <th key={col.key} className={`rol-th-sub ${g.cls}`}>{col.label}</th>
                      )),
                    )}
                    {dias.map((d) => (
                      <th key={d.dia} className="rol-th-dia">
                        <div className="rol-dia-nombre">{d.dia}</div>
                        <div className="rol-dia-fecha">{d.fecha}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cargando && (
                    <tr><td colSpan={totalCols} className="rol-empty">Cargando roster…</td></tr>
                  )}
                  {errorCarga && !cargando && (
                    <tr><td colSpan={totalCols} className="rol-empty text-danger">⚠ {errorCarga}</td></tr>
                  )}
                  {!cargando && !errorCarga && zonasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={totalCols} className="rol-empty">Sin resultados para los filtros aplicados.</td>
                    </tr>
                  )}
                  {zonasFiltradas.map((z) => {
                    const colapsada = zonasColapsadas.has(z.nombre)
                    return (
                    <Fragment key={`z-${z.nombre}`}>
                      <tr className="rol-tr-zona rol-tr-zona--click" onClick={() => toggleZona(z.nombre)}>
                        <td colSpan={totalCols}>
                          <div className="rol-zona-row">
                            <span><Ico name={colapsada ? 'chevron-right' : 'chevron-down'} /> {z.nombre}</span>
                            <span className="badge bg-primary">{z.personas} PERSONAS</span>
                          </div>
                        </td>
                      </tr>
                      {!colapsada && z.tiendas.map((t) => (
                        <Fragment key={`t-${z.nombre}-${t.nombre}`}>
                          <tr className="rol-tr-tienda">
                            <td colSpan={totalCols}><Ico name="map-pin" /> {t.nombre}</td>
                          </tr>
                          {t.filas.map((f) => (
                            <tr className="rol-tr-fila" key={`${t.nombre}-${f.fi}`}>
                              {cols.puesto && <td className="rol-td-puesto">{f.puesto}</td>}
                              {cols.trabajador && <td className="rol-td-trab">{f.trabajador}</td>}
                              {metricColsVis.map((col) => (
                                <td key={col.key} className={`rol-td-q ${pctCls(f.cuota[col.key])}`}>{pct(f.cuota[col.key])}</td>
                              ))}
                              {f.celdas.map((cel, j) => (
                                <td
                                  className="rol-td-dia rol-td-dia--edit"
                                  key={j}
                                  title="Clic para programar"
                                  onClick={() => abrirModal(z.zi, t.ti, f.fi, j)}
                                >
                                  <Chip celda={cel} dim={fTipos.length > 0 && !!cel && !fTipos.includes(cel.tipo)} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </Fragment>
                      ))}
                    </Fragment>
                  )})}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* ── Modal de programación ─────────────────────────────── */}
      {modal && (
        <div className="rpm-ov" onClick={() => setModal(null)}>
          <div className="rpm-dlg" onClick={(e) => e.stopPropagation()}>
            <div className="rpm-hd">
              <span className="rpm-ico"><Ico name="calendar" /></span>
              <span className="rpm-ttl">Programar</span>
              <button className="rpm-close" onClick={() => setModal(null)}><Ico name="x" /></button>
            </div>
            <div className="rpm-sub">{modal.nombre} · {modal.tiendaNombre}</div>

            <div className="rpm-body">
              <div className="rpm-sec-ttl">FECHA DE INICIO</div>
              <div className="rpm-dias">
                {dias.map((d, i) => {
                  const sel = modal.diasSel.includes(i)
                  const [n] = d.fecha.split('/')
                  return (
                    <button key={i} className={`rpm-dia${sel ? ' rpm-dia--sel' : ''}`} onClick={() => toggleDia(i)}>
                      <span className="rpm-dia-nombre">{d.dia}</span>
                      <span className="rpm-dia-num">{n}</span>
                    </button>
                  )
                })}
              </div>

              {tiendaStep ? (
                <>
                  <div className="rpm-sec-ttl">TIENDA A CUBRIR</div>
                  <div className="rpm-tiendas-lista">
                    {listaTiendas.map((nombre) => (
                      <button
                        key={nombre}
                        className={`rpm-tienda-btn${tiendaCob === nombre ? ' rpm-tienda-btn--sel' : ''}`}
                        onClick={() => setTiendaCob(nombre)}
                      >
                        <Ico name="shopping-bag" /> {nombre}
                      </button>
                    ))}
                  </div>
                  <button className="rpm-back" onClick={() => setTiendaStep(false)}>‹ Volver a tipos</button>
                </>
              ) : compStep ? (
                <>
                  <div className="rpm-sec-ttl">
                    {selTipo === 'comp-feriado' ? 'FERIADO QUE SE COMPENSA' : 'DESCANSO NO GOZADO QUE SE COMPENSA'}
                  </div>
                  {sugComp.length > 0 && (
                    <div className="rpm-tiendas-lista mb-2">
                      {sugComp.map((s) => (
                        <button
                          key={s}
                          className={`rpm-tienda-btn${fechaComp === s ? ' rpm-tienda-btn--sel' : ''}`}
                          onClick={() => setFechaComp(s)}
                        >
                          <Ico name="calendar" /> {s}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="rpm-sec-ttl">O INGRESA LA FECHA</div>
                  <input
                    type="date"
                    className="rpm-notas"
                    value={/^\d{4}-\d{2}-\d{2}$/.test(fechaComp) ? fechaComp : ''}
                    onChange={(e) => setFechaComp(e.target.value)}
                  />
                  <button className="rpm-back" onClick={() => setCompStep(false)}>‹ Volver a tipos</button>
                </>
              ) : (
                <>
                  <div className="rpm-sec-ttl">TIPO</div>
                  <div className="rpm-tipos">
                    {TIPOS_LISTA.map((tk) => {
                      const def = TIPOS[tk]
                      const meta = TIPO_META[tk]
                      return (
                        <button
                          key={tk}
                          className={`rpm-tipo${selTipo === tk ? ' rpm-tipo--sel' : ''}`}
                          onClick={() => {
                            setSelTipo(tk)
                            if (esCompensacion(tk)) { setFechaComp(''); setCompStep(true) }
                          }}
                        >
                          <span className="rpm-tipo-dot" style={{ background: meta.dot }} />
                          <span className="rpm-tipo-txt">
                            <strong>{def.etiqueta}</strong>
                            <small>{meta.sub}</small>
                          </span>
                          {selTipo === tk && <span className="rpm-tipo-check">✓</span>}
                        </button>
                      )
                    })}
                  </div>

                  {esCompensacion(selTipo) && fechaComp && (
                    <div className="rpm-comp-resumen">Compensa: <strong>{fechaComp}</strong></div>
                  )}

                  <div className="rpm-sec-ttl">NOTAS</div>
                  <textarea
                    className="rpm-notas"
                    placeholder="Motivo, observaciones..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={2}
                  />
                </>
              )}
            </div>

            <div className="rpm-footer">
              {celdaActual && (
                <button className="rpm-anular" onClick={anularModal}><Ico name="x" /> Anular programación</button>
              )}
              <div className="rpm-footer-right">
                <button className="btn btn-sm btn-light" onClick={() => setModal(null)}>Cancelar</button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={guardarModal}
                  disabled={!selTipo || (tiendaStep && !tiendaCob) || (compStep && !fechaComp)}
                >
                  <Ico name="save" /> Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDialog}
    </div>
  )
}

export default Rol
