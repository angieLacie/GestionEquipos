import { Fragment, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '../components/AppLayout'
import { useAuth } from '../lib/auth'
import { ApiError } from '../lib/api'
import { listarEmpresas, listarEmpleados, listarTiendas, type Empleado } from '../lib/maestros'
import {
  listarRolesSemanales, obtenerRol, crearRol, programarCelda,
  enviarRol, aprobarRol, rechazarRol, programarGt,
  type EstadoCelda, type PuestoRol, type RolSemanal,
} from '../lib/rol'

const MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const CARGOS: { v: PuestoRol; label: string }[] = [
  { v: 'Seniors', label: 'Seniors' },
  { v: 'GtAsesores', label: 'Gt/Ases' },
  { v: 'Secretarias', label: 'Secretarias' },
  { v: 'Auxiliares', label: 'Auxiliares' },
  { v: 'Sastres', label: 'Sastres' },
]

const ESTADOS_CELDA: { v: EstadoCelda; label: string; abbr: string }[] = [
  { v: 'Vacio', label: '— (vaciar)', abbr: '' },
  { v: 'DescansoLaboral', label: 'Descanso laboral', abbr: 'DL' },
  { v: 'CoberturaTienda', label: 'Cobertura de tienda', abbr: 'COB' },
  { v: 'CompensacionFeriadoLaborado', label: 'Comp. feriado laborado', abbr: 'CF' },
  { v: 'CompensacionDescansoNoGozado', label: 'Comp. descanso no gozado', abbr: 'CD' },
  { v: 'CoberturaTipoVenta', label: 'Cobertura tipo venta (Lukers)', abbr: 'CV' },
]
const abbrDe = (e: EstadoCelda) => ESTADOS_CELDA.find((x) => x.v === e)?.abbr ?? ''

function domingoDe(f: Date) { const d = new Date(f); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - d.getDay()); return d }
function numeroSemana(d: Date) { const i = new Date(d.getFullYear(), 0, 1); const n = Math.floor((d.getTime() - i.getTime()) / 86400000); return Math.ceil((n + i.getDay() + 1) / 7) }
const fmt = (d: Date) => d.toISOString().slice(0, 10)

export function RolPage() {
  const qc = useQueryClient()
  const idUsuario = useAuth((s) => s.usuario?.idUsuario) ?? ''
  const { data: empresas } = useQuery({ queryKey: ['empresas'], queryFn: listarEmpresas })

  const [empresa, setEmpresa] = useState('CADENA')
  const [puesto, setPuesto] = useState<PuestoRol>('GtAsesores')
  const [wkOffset, setWkOffset] = useState(0)
  const [pop, setPop] = useState<{ cid: string; fecha: string; x: number; y: number } | null>(null)
  const [pickTienda, setPickTienda] = useState(false)

  const lunes = useMemo(() => { const d = domingoDe(new Date()); d.setDate(d.getDate() + wkOffset * 7); return d }, [wkOffset])
  const anio = lunes.getFullYear()
  const semana = numeroSemana(lunes)
  const dias = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(lunes); d.setDate(lunes.getDate() + i); return d }), [lunes])
  const finSem = dias[6]
  const wkLabel = `Sem ${String(semana).padStart(2, '0')} — ${lunes.getDate()} ${MES[lunes.getMonth()]} al ${finSem.getDate()} ${MES[finSem.getMonth()]} ${finSem.getFullYear()}`

  // Documento de rol para (empresa, puesto, semana). Una zona demo por documento.
  const { data: lista } = useQuery({
    queryKey: ['roles-sem', empresa, anio, semana],
    queryFn: () => listarRolesSemanales({ empresa, anio: String(anio), numeroSemana: String(semana) }),
  })
  const doc = lista?.items.find((r) => r.puesto === puesto) ?? null

  const { data: detalle } = useQuery({
    queryKey: ['rol', doc?.id],
    queryFn: () => obtenerRol(doc!.id),
    enabled: !!doc,
  })

  // Roster real desde el maestro de empleados (Maestros): empresa + categoría (= puesto del rol).
  const { data: empleadosPag } = useQuery({
    queryKey: ['empleados', empresa, puesto],
    queryFn: () => listarEmpleados({ idEmpresa: empresa, categoria: puesto }),
  })
  const empleados = empleadosPag?.items ?? []

  // Tiendas de la empresa (destino de CoberturaTienda).
  const { data: tiendasPag } = useQuery({
    queryKey: ['tiendas', empresa],
    queryFn: () => listarTiendas({ idEmpresa: empresa }),
  })
  const tiendas = tiendasPag?.items ?? []

  const invalidar = () => { qc.invalidateQueries({ queryKey: ['rol'] }); qc.invalidateQueries({ queryKey: ['roles-sem'] }) }

  const crear = useMutation({
    mutationFn: () => crearRol({ empresa, zonaId: crypto.randomUUID(), anio, numeroSemana: semana, fechaInicio: fmt(lunes), puesto, creadoPor: idUsuario }),
    onSuccess: invalidar,
    onError: (e) => alert(e instanceof ApiError ? e.message : 'Error'),
  })
  const programar = useMutation({
    mutationFn: (p: { colaboradorId: string; fecha: string; estado: EstadoCelda; tiendaCoberturaId?: string }) => programarCelda(doc!.id, { ...p, registradoPor: idUsuario }),
    onSuccess: invalidar,
    onError: (e) => alert(e instanceof ApiError ? e.message : 'Error'),
  })
  const transicion = useMutation({
    mutationFn: (fn: () => Promise<RolSemanal>) => fn(),
    onSuccess: invalidar,
    onError: (e) => alert(e instanceof ApiError ? e.message : 'Error'),
  })

  const celdas = detalle?.dias ?? []
  const estado = doc?.estado
  const editable = !!doc && ['EnEdicion', 'PendienteEnvio', 'RechazadoGG', 'VersionEnRevision'].includes(estado!)
  const celdaDe = (cid: string, f: string) => celdas.find((c) => c.colaboradorId === cid && c.fecha === f)

  const filas = empleados

  // Agrupa los empleados por Zona → Tienda (como el prototipo).
  const grupos = useMemo(() => {
    const byZona = new Map<string, Map<string, Empleado[]>>()
    for (const e of empleados) {
      if (!byZona.has(e.zona)) byZona.set(e.zona, new Map())
      const t = byZona.get(e.zona)!
      if (!t.has(e.tienda)) t.set(e.tienda, [])
      t.get(e.tienda)!.push(e)
    }
    return byZona
  }, [empleados])

  // Siembra celdas variadas sobre los empleados reales para ver el calendario lleno (demo).
  async function cargarDatosPrueba() {
    if (!lista) return // espera a conocer si ya existe un rol (evita crear duplicados)
    if (empleados.length === 0) { alert('No hay empleados para esta empresa/puesto.'); return }
    let id = doc?.id
    if (id && !editable) { alert(`El rol está en ${estado}: elige otra semana o puesto para los datos de prueba.`); return }
    if (!id) { const r = await crearRol({ empresa, zonaId: crypto.randomUUID(), anio, numeroSemana: semana, fechaInicio: fmt(lunes), puesto, creadoPor: idUsuario }); id = r.id }

    const esLukers = empresa.toUpperCase() === 'LUKERS'
    // CoberturaTienda exige tiendaCoberturaId (no hay maestro de tiendas cableado aún) → se omite del demo.
    const plan: EstadoCelda[][] = [
      ['DescansoLaboral', 'CompensacionFeriadoLaborado'],
      ['CompensacionDescansoNoGozado', 'DescansoLaboral'],
      ['CompensacionFeriadoLaborado', 'DescansoLaboral'],
      ['DescansoLaboral', 'CompensacionDescansoNoGozado'],
      [esLukers ? 'CoberturaTipoVenta' : 'DescansoLaboral', 'CompensacionFeriadoLaborado'],
    ]
    for (let i = 0; i < empleados.length; i++) {
      const [e1, e2] = plan[i % plan.length]
      await programarCelda(id!, { colaboradorId: empleados[i].id, fecha: fmt(dias[i % 7]), estado: e1, registradoPor: idUsuario })
      await programarCelda(id!, { colaboradorId: empleados[i].id, fecha: fmt(dias[(i + 3) % 7]), estado: e2, registradoPor: idUsuario })
    }
    invalidar()
  }

  function clickCelda(cid: string, f: string, ev: React.MouseEvent) {
    if (!doc) { alert('Crea el rol de la semana antes de programar.'); return }
    if (!editable) { alert(`El rol está en "${estado}" y no admite edición. Para programar necesita estar en edición (créalo en otra semana, o recházalo si está EnviadoGG).`); return }
    const r = (ev.currentTarget as HTMLElement).getBoundingClientRect()
    setPickTienda(false)
    setPop({ cid, fecha: f, x: Math.min(r.left, window.innerWidth - 230), y: r.bottom + 4 })
  }
  function asignarCelda(e: EstadoCelda) {
    if (!pop) return
    if (e === 'CoberturaTienda') {
      if (tiendas.length === 0) { alert('No hay tiendas registradas para esta empresa.'); return }
      setPickTienda(true) // pasa al sub-paso de elegir la tienda a cubrir
      return
    }
    programar.mutate({ colaboradorId: pop.cid, fecha: pop.fecha, estado: e })
    setPop(null)
  }
  function asignarCobertura(tiendaId: string) {
    if (!pop) return
    programar.mutate({ colaboradorId: pop.cid, fecha: pop.fecha, estado: 'CoberturaTienda', tiendaCoberturaId: tiendaId })
    setPop(null); setPickTienda(false)
  }

  const coberturas = celdas.filter((c) => c.estado === 'CoberturaTienda' || c.estado === 'CoberturaTipoVenta').length

  return (
    <AppLayout active="rol" title="Rol de Personal">
      {/* KPIs */}
      <div className="kpis">
        <div className="kpi"><div className="kpi-label">Desc. máx / día</div><div className="kpi-val">6</div><div className="kpi-sub">Límite configurado</div></div>
        <div className="kpi green"><div className="kpi-label">Coberturas activas</div><div className="kpi-val green">{coberturas}</div><div className="kpi-sub">CV + COB</div></div>
        <div className="kpi"><div className="kpi-label">Trabajadores</div><div className="kpi-val">{filas.length}</div><div className="kpi-sub">En esta vista</div></div>
        <div className="kpi crit"><div className="kpi-label">Estado del rol</div><div className="kpi-val red" style={{ fontSize: 16 }}>{estado ?? 'Sin crear'}</div><div className="kpi-sub">{wkLabel}</div></div>
      </div>

      {/* Filtros */}
      <div className="rol-filtros">
        <select className="rol-sel" value={empresa} onChange={(e) => setEmpresa(e.target.value)}>
          {(empresas ?? []).map((x) => <option key={x.codigo} value={x.codigo}>{x.nombre}</option>)}
        </select>
        <select className="rol-sel" value={puesto} onChange={(e) => setPuesto(e.target.value as PuestoRol)}>
          {CARGOS.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
        </select>
        <div style={{ marginLeft: 'auto' }} className="fila-acciones">
          {!doc && <button className="btn btn-ghost" onClick={() => crear.mutate()} disabled={crear.isPending}>+ Crear rol de la semana</button>}
          <button className="btn btn-ghost" onClick={cargarDatosPrueba}>🎲 Datos de prueba</button>
          {doc && ['EnEdicion', 'PendienteEnvio', 'RechazadoGG'].includes(estado!) &&
            <button className="btn btn-primary" onClick={() => transicion.mutate(() => enviarRol(doc.id, idUsuario))}>✉ Enviar a aprobación</button>}
          {estado === 'EnviadoGG' && <>
            <button className="btn btn-primary" onClick={() => transicion.mutate(() => aprobarRol(doc!.id, idUsuario))}>Aprobar</button>
            <button className="btn btn-ghost" onClick={() => { const c = prompt('Comentario de rechazo:'); if (c) transicion.mutate(() => rechazarRol(doc!.id, idUsuario, c)) }}>Rechazar</button>
          </>}
          {estado === 'AprobadoGG' && <button className="btn btn-primary" onClick={() => transicion.mutate(() => programarGt(doc!.id, idUsuario))}>Programar GT</button>}
        </div>
      </div>

      {/* Barra de semana */}
      <div className="rol-wk-bar">
        <button className="rol-wk-btn" onClick={() => setWkOffset((o) => o - 1)} title="Semana anterior">‹</button>
        <button className="rol-wk-today" onClick={() => setWkOffset(0)}>Hoy</button>
        <button className="rol-wk-btn" onClick={() => setWkOffset((o) => o + 1)} title="Semana siguiente">›</button>
        <span className="rol-wk-range">{wkLabel}</span>
        <span className="rol-wk-meta">{wkOffset === 0 ? 'Semana actual' : wkOffset > 0 ? `+${wkOffset} sem.` : `${wkOffset} sem.`}</span>
        {doc && <span className="estado-rol" style={{ marginLeft: 8 }}>{estado}</span>}
      </div>

      {/* Tabla */}
      <div className="rol-wrap">
        <table className="rol-tbl">
          <thead>
            <tr>
              <th className="rol-c-puesto" rowSpan={2}>Puesto</th>
              <th className="rol-c-personal" rowSpan={2} style={{ textAlign: 'left' }}>Trabajador</th>
              <th className="rol-th-asesor" colSpan={2}>% Cuota Asesor</th>
              <th className="rol-th-asesor" rowSpan={2}>% Cuota<br />Senior</th>
              <th className="rol-th-asesor" rowSpan={2}>% Semana<br />Senior</th>
              <th className="rol-th-sem" colSpan={7}>Semana en curso</th>
            </tr>
            <tr>
              <th className="rol-th-asesor">{MES[(lunes.getMonth() + 11) % 12]} %</th>
              <th className="rol-th-asesor">{MES[lunes.getMonth()]} %</th>
              {dias.map((d, i) => <th key={i} className="rol-th-sem">{DIAS[d.getDay()]}<br />{d.getDate()}/{d.getMonth() + 1}</th>)}
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 && (
              <tr><td colSpan={13} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                Sin empleados para {empresa} · {CARGOS.find((c) => c.v === puesto)?.label}.
              </td></tr>
            )}
            {[...grupos.entries()].map(([zona, tiendas]) => {
              const totalZona = [...tiendas.values()].reduce((s, arr) => s + arr.length, 0)
              return (
                <Fragment key={zona}>
                  <tr className="rol-grp-zona"><td colSpan={13}>{zona} · {totalZona} personas</td></tr>
                  {[...tiendas.entries()].map(([tienda, emps]) => (
                    <Fragment key={tienda}>
                      <tr className="rol-grp-tienda"><td colSpan={13}>📍 {tienda}</td></tr>
                      {emps.map((t) => (
                        <tr key={t.id}>
                          <td className="rol-c-puesto">{t.cargo}</td>
                          <td className="rol-c-personal">{t.nombreCompleto}</td>
                          <td className="rol-c-cuota">—</td>
                          <td className="rol-c-cuota">—</td>
                          <td className="rol-c-cuota">—</td>
                          <td className="rol-c-cuota">—</td>
                          {dias.map((d, i) => {
                            const f = fmt(d)
                            const celda = celdaDe(t.id, f)
                            const est = celda?.estado ?? 'Vacio'
                            return (
                              <td key={i} className="rol-day" onClick={(ev) => clickCelda(t.id, f, ev)}>
                                {est === 'Vacio'
                                  ? <span className="rol-vacio">·</span>
                                  : <span className={`rol-db rol-db-${est}`}>{abbrDe(est)}</span>}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="leyenda">
        <span><i className="swatch rol-db-DescansoLaboral" /> DL · Descanso laboral</span>
        <span><i className="swatch rol-db-CoberturaTienda" /> COB · Cobertura de tienda</span>
        <span><i className="swatch rol-db-CompensacionFeriadoLaborado" /> CF/CD · Compensaciones</span>
        <span><i className="swatch rol-db-CoberturaTipoVenta" /> CV · Cobertura tipo venta</span>
      </div>

      {pop && (
        <>
          <div className="rol-pop-ov" onClick={() => { setPop(null); setPickTienda(false) }} />
          <div className="rol-pop" style={{ left: pop.x, top: pop.y }}>
            {!pickTienda ? (
              <>
                <div className="rol-pop-ttl">Asignar tipo</div>
                <div className="rol-pop-grid">
                  {ESTADOS_CELDA.filter((e) => e.v !== 'Vacio').map((e) => (
                    <button key={e.v} className={`rol-pop-btn rol-db-${e.v}`} onClick={() => asignarCelda(e.v)} title={e.label}>
                      {e.abbr}<span>{e.label}</span>
                    </button>
                  ))}
                </div>
                <button className="rol-pop-clear" onClick={() => asignarCelda('Vacio')}>✕ Vaciar día</button>
              </>
            ) : (
              <>
                <div className="rol-pop-ttl">Tienda a cubrir</div>
                <div className="rol-pop-tiendas">
                  {tiendas.map((t) => (
                    <button key={t.id} className="rol-pop-tienda" onClick={() => asignarCobertura(t.id)}>🏪 {t.nombre}</button>
                  ))}
                </div>
                <button className="rol-pop-clear" onClick={() => setPickTienda(false)}>‹ Volver</button>
              </>
            )}
          </div>
        </>
      )}
    </AppLayout>
  )
}
