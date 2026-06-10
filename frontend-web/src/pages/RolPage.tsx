import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '../components/AppLayout'
import { useAuth } from '../lib/auth'
import { ApiError } from '../lib/api'
import { listarEmpresas } from '../lib/maestros'
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

  const rosterKey = `roster-${empresa}-${puesto}-${anio}-${semana}`
  const [roster, setRoster] = useState<{ id: string; nombre: string }[]>(() => {
    const r = localStorage.getItem(rosterKey); return r ? JSON.parse(r) : []
  })
  // Re-sync roster al cambiar de semana/empresa/puesto.
  useMemo(() => { const r = localStorage.getItem(rosterKey); setRoster(r ? JSON.parse(r) : []) }, [rosterKey])

  const invalidar = () => { qc.invalidateQueries({ queryKey: ['rol', doc?.id] }); qc.invalidateQueries({ queryKey: ['roles-sem'] }) }

  const crear = useMutation({
    mutationFn: () => crearRol({ empresa, zonaId: crypto.randomUUID(), anio, numeroSemana: semana, fechaInicio: fmt(lunes), puesto, creadoPor: idUsuario }),
    onSuccess: invalidar,
    onError: (e) => alert(e instanceof ApiError ? e.message : 'Error'),
  })
  const programar = useMutation({
    mutationFn: (p: { colaboradorId: string; fecha: string; estado: EstadoCelda }) => programarCelda(doc!.id, { ...p, registradoPor: idUsuario }),
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

  function agregarColaborador() {
    if (!editable) return
    const nombre = prompt('Nombre del colaborador:'); if (!nombre) return
    const next = [...roster, { id: crypto.randomUUID(), nombre }]
    setRoster(next); localStorage.setItem(rosterKey, JSON.stringify(next))
  }
  function clickCelda(cid: string, f: string, dow: number) {
    if (!editable) return
    const op = prompt(`Estado (${DIAS[dow]}):\n` + ESTADOS_CELDA.map((e, i) => `${i}=${e.label}`).join('\n'))
    if (op === null) return
    const el = ESTADOS_CELDA[Number(op)]; if (el) programar.mutate({ colaboradorId: cid, fecha: f, estado: el.v })
  }

  const coberturas = celdas.filter((c) => c.estado === 'CoberturaTienda' || c.estado === 'CoberturaTipoVenta').length

  return (
    <AppLayout active="rol" title="Rol de Personal">
      {/* KPIs */}
      <div className="kpis">
        <div className="kpi"><div className="kpi-label">Desc. máx / día</div><div className="kpi-val">6</div><div className="kpi-sub">Límite configurado</div></div>
        <div className="kpi green"><div className="kpi-label">Coberturas activas</div><div className="kpi-val green">{coberturas}</div><div className="kpi-sub">CV + COB</div></div>
        <div className="kpi"><div className="kpi-label">Trabajadores</div><div className="kpi-val">{roster.length}</div><div className="kpi-sub">En esta vista</div></div>
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
          {editable && <button className="btn btn-ghost" onClick={agregarColaborador}>+ Trabajador</button>}
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
            <tr className="rol-grp-zona"><td colSpan={13}>{empresa} · {CARGOS.find((c) => c.v === puesto)?.label}</td></tr>
            {roster.length === 0 && (
              <tr><td colSpan={13} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                {doc ? 'Agrega un trabajador para programar la semana.' : 'Crea el rol de la semana para empezar.'}
              </td></tr>
            )}
            {roster.map((t) => (
              <tr key={t.id}>
                <td className="rol-c-puesto">{CARGOS.find((c) => c.v === puesto)?.label}</td>
                <td className="rol-c-personal">{t.nombre}</td>
                <td className="rol-c-cuota">—</td>
                <td className="rol-c-cuota">—</td>
                <td className="rol-c-cuota">—</td>
                <td className="rol-c-cuota">—</td>
                {dias.map((d, i) => {
                  const f = fmt(d)
                  const celda = celdaDe(t.id, f)
                  const est = celda?.estado ?? 'Vacio'
                  return (
                    <td key={i} className="rol-day" onClick={() => clickCelda(t.id, f, d.getDay())}>
                      {est === 'Vacio'
                        ? <span className="rol-vacio">·</span>
                        : <span className={`rol-db rol-db-${est}`}>{abbrDe(est)}</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="leyenda">
        <span><i className="swatch rol-db-DescansoLaboral" /> DL · Descanso laboral</span>
        <span><i className="swatch rol-db-CoberturaTienda" /> COB · Cobertura de tienda</span>
        <span><i className="swatch rol-db-CompensacionFeriadoLaborado" /> CF/CD · Compensaciones</span>
        <span><i className="swatch rol-db-CoberturaTipoVenta" /> CV · Cobertura tipo venta</span>
      </div>
    </AppLayout>
  )
}
