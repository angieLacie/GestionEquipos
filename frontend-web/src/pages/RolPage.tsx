import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '../components/AppLayout'
import { useAuth } from '../lib/auth'
import { ApiError } from '../lib/api'
import { listarEmpresas } from '../lib/maestros'
import {
  listarRolesSemanales, obtenerRol, crearRol, programarCelda,
  enviarRol, aprobarRol, rechazarRol, programarGt,
  type CrearRolBody, type EstadoCelda, type PuestoRol, type RolSemanal,
} from '../lib/rol'

const PUESTOS: PuestoRol[] = ['Seniors', 'GtAsesores', 'Secretarias', 'Auxiliares', 'Sastres']
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const ESTADOS_CELDA: { v: EstadoCelda; label: string }[] = [
  { v: 'Vacio', label: '—' },
  { v: 'DescansoLaboral', label: 'Descanso laboral' },
  { v: 'CoberturaTienda', label: 'Cobertura de tienda' },
  { v: 'CompensacionFeriadoLaborado', label: 'Comp. feriado laborado' },
  { v: 'CompensacionDescansoNoGozado', label: 'Comp. descanso no gozado' },
  { v: 'CoberturaTipoVenta', label: 'Cobertura tipo venta (Lukers)' },
]

function domingoDe(fecha: Date): Date {
  const d = new Date(fecha)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d
}
function numeroSemana(d: Date): number {
  const inicio = new Date(d.getFullYear(), 0, 1)
  const dias = Math.floor((d.getTime() - inicio.getTime()) / 86400000)
  return Math.ceil((dias + inicio.getDay() + 1) / 7)
}
const fmt = (d: Date) => d.toISOString().slice(0, 10)

export function RolPage() {
  const [sel, setSel] = useState<string | null>(null)
  return (
    <AppLayout active="rol" title="Rol de Personal">
      {sel ? <Detalle id={sel} volver={() => setSel(null)} /> : <Lista abrir={setSel} />}
    </AppLayout>
  )
}

function Lista({ abrir }: { abrir: (id: string) => void }) {
  const qc = useQueryClient()
  const [nuevo, setNuevo] = useState(false)
  const { data, isLoading, error } = useQuery({ queryKey: ['roles-sem'], queryFn: () => listarRolesSemanales() })

  return (
    <section className="tarjeta">
      <div className="entre">
        <h2>Roles semanales</h2>
        <button className="btn btn-primary" onClick={() => setNuevo(true)}>+ Nuevo rol</button>
      </div>
      {isLoading && <p className="muted">Cargando…</p>}
      {error && <p className="error">{(error as Error).message}</p>}
      {data && data.items.length === 0 && <p className="muted">Sin roles. Crea el primero.</p>}
      {data && data.items.length > 0 && (
        <table>
          <thead>
            <tr><th>Empresa</th><th>Año/Sem</th><th>Semana</th><th>Puesto</th><th>Estado</th><th>v</th><th></th></tr>
          </thead>
          <tbody>
            {data.items.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.empresa}</strong></td>
                <td>{r.anio} / {String(r.numeroSemana).padStart(2, '0')}</td>
                <td>{r.fechaInicio} → {r.fechaFin}</td>
                <td>{r.puesto}</td>
                <td><span className="estado-rol">{r.estado}</span></td>
                <td>{r.version}</td>
                <td><button className="btn btn-ghost" onClick={() => abrir(r.id)}>Abrir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {nuevo && <NuevoRol onClose={() => setNuevo(false)} onSaved={(id) => { setNuevo(false); qc.invalidateQueries({ queryKey: ['roles-sem'] }); abrir(id) }} />}
    </section>
  )
}

function NuevoRol({ onClose, onSaved }: { onClose: () => void; onSaved: (id: string) => void }) {
  const creadoPor = useAuth((s) => s.usuario?.idUsuario) ?? ''
  const { data: empresas } = useQuery({ queryKey: ['empresas'], queryFn: listarEmpresas })
  const [empresa, setEmpresa] = useState('CADENA')
  const [puesto, setPuesto] = useState<PuestoRol>('GtAsesores')
  const [fecha, setFecha] = useState(fmt(domingoDe(new Date())))
  const [zonaId, setZonaId] = useState<string>(crypto.randomUUID())
  const [error, setError] = useState<string | null>(null)

  const mut = useMutation({
    mutationFn: (b: CrearRolBody) => crearRol(b),
    onSuccess: (r) => onSaved(r.id),
    onError: (e) => setError(e instanceof ApiError ? e.message : 'No se pudo crear.'),
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const dom = domingoDe(new Date(fecha + 'T00:00:00'))
    mut.mutate({
      empresa, zonaId, anio: dom.getFullYear(), numeroSemana: numeroSemana(dom),
      fechaInicio: fmt(dom), puesto, creadoPor,
    })
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>Nuevo rol semanal</h3>
        <div className="grid2">
          <div className="campo">
            <label>Empresa</label>
            <select value={empresa} onChange={(e) => setEmpresa(e.target.value)}>
              {(empresas ?? []).map((x) => <option key={x.codigo} value={x.codigo}>{x.nombre}</option>)}
            </select>
          </div>
          <div className="campo">
            <label>Puesto</label>
            <select value={puesto} onChange={(e) => setPuesto(e.target.value as PuestoRol)}>
              {PUESTOS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="campo">
            <label>Semana (se ajusta al domingo)</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </div>
          <div className="campo">
            <label>Zona (UUID)</label>
            <input value={zonaId} onChange={(e) => setZonaId(e.target.value)} required />
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="fila-acciones" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={mut.isPending}>{mut.isPending ? 'Creando…' : 'Crear'}</button>
        </div>
      </form>
    </div>
  )
}

function Detalle({ id, volver }: { id: string; volver: () => void }) {
  const qc = useQueryClient()
  const idUsuario = useAuth((s) => s.usuario?.idUsuario) ?? ''
  const { data, isLoading, error } = useQuery({ queryKey: ['rol', id], queryFn: () => obtenerRol(id) })
  const [rosterLocal, setRosterLocal] = useState<{ id: string; nombre: string }[]>(() => {
    const raw = localStorage.getItem(`roster-${id}`)
    return raw ? JSON.parse(raw) : []
  })

  const invalidar = () => qc.invalidateQueries({ queryKey: ['rol', id] })

  const programar = useMutation({
    mutationFn: (p: { colaboradorId: string; fecha: string; estado: EstadoCelda }) =>
      programarCelda(id, { ...p, registradoPor: idUsuario }),
    onSuccess: invalidar,
  })
  const transicion = useMutation({
    mutationFn: (accion: () => Promise<RolSemanal>) => accion(),
    onSuccess: invalidar,
    onError: (e) => alert(e instanceof ApiError ? e.message : 'Error'),
  })

  const dias = useMemo(() => {
    if (!data) return []
    const base = new Date(data.rol.fechaInicio + 'T00:00:00')
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base); d.setDate(base.getDate() + i); return d
    })
  }, [data])

  if (isLoading) return <p className="muted">Cargando…</p>
  if (error || !data) return <p className="error">{(error as Error)?.message ?? 'No encontrado'}</p>

  const { rol, dias: celdas } = data
  const idsEnCeldas = [...new Set(celdas.map((c) => c.colaboradorId))]
  const filas = [
    ...rosterLocal,
    ...idsEnCeldas.filter((cid) => !rosterLocal.some((r) => r.id === cid)).map((cid) => ({ id: cid, nombre: cid.slice(0, 8) })),
  ]
  const celdaDe = (cid: string, fecha: string) => celdas.find((c) => c.colaboradorId === cid && c.fecha === fecha)
  const editable = ['EnEdicion', 'PendienteEnvio', 'RechazadoGG', 'VersionEnRevision'].includes(rol.estado)

  function agregarColaborador() {
    const nombre = prompt('Nombre del colaborador:')
    if (!nombre) return
    const nuevo = [...rosterLocal, { id: crypto.randomUUID(), nombre }]
    setRosterLocal(nuevo)
    localStorage.setItem(`roster-${id}`, JSON.stringify(nuevo))
  }

  return (
    <section className="tarjeta">
      <div className="entre">
        <div className="wk-bar">
          <button className="btn btn-ghost" onClick={volver}>← Volver</button>
          <span className="rango">{rol.empresa} · {rol.puesto} · Sem {String(rol.numeroSemana).padStart(2, '0')}/{rol.anio}</span>
          <span className="estado-rol">{rol.estado}</span>
        </div>
        <div className="fila-acciones">
          {editable && <button className="btn btn-ghost" onClick={agregarColaborador}>+ Colaborador</button>}
          {['EnEdicion', 'PendienteEnvio', 'RechazadoGG'].includes(rol.estado) &&
            <button className="btn btn-primary" onClick={() => transicion.mutate(() => enviarRol(id, idUsuario))}>Enviar a GG</button>}
          {rol.estado === 'EnviadoGG' && <>
            <button className="btn btn-primary" onClick={() => transicion.mutate(() => aprobarRol(id, idUsuario))}>Aprobar</button>
            <button className="btn btn-ghost" onClick={() => { const c = prompt('Comentario de rechazo:'); if (c) transicion.mutate(() => rechazarRol(id, idUsuario, c)) }}>Rechazar</button>
          </>}
          {rol.estado === 'AprobadoGG' && <button className="btn btn-primary" onClick={() => transicion.mutate(() => programarGt(id, idUsuario))}>Programar GT</button>}
        </div>
      </div>

      <table className="cal">
        <thead>
          <tr>
            <th className="col-trab">Colaborador</th>
            {dias.map((d, i) => <th key={i}>{DIAS[d.getDay()]}<br />{d.getDate()}/{d.getMonth() + 1}</th>)}
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 && <tr><td className="col-trab muted" colSpan={8}>Agrega un colaborador para programar.</td></tr>}
          {filas.map((f) => (
            <tr key={f.id}>
              <td className="col-trab">{f.nombre}</td>
              {dias.map((d, i) => {
                const fechaStr = fmt(d)
                const celda = celdaDe(f.id, fechaStr)
                const estado = celda?.estado ?? 'Vacio'
                return (
                  <td key={i} className={`celda c-${estado}`} title={estado}
                    onClick={() => {
                      if (!editable) return
                      const op = prompt(`Estado para ${f.nombre} (${DIAS[d.getDay()]}):\n` + ESTADOS_CELDA.map((e, n) => `${n}=${e.label}`).join('\n'))
                      if (op === null) return
                      const elegido = ESTADOS_CELDA[Number(op)]
                      if (elegido) programar.mutate({ colaboradorId: f.id, fecha: fechaStr, estado: elegido.v })
                    }}>
                    {estado !== 'Vacio' ? ESTADOS_CELDA.find((e) => e.v === estado)?.label.split(' ')[0] : ''}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="leyenda">
        <span><i className="swatch c-DescansoLaboral" /> Descanso laboral</span>
        <span><i className="swatch c-CoberturaTienda" /> Cobertura de tienda</span>
        <span><i className="swatch c-CompensacionFeriadoLaborado" /> Compensaciones</span>
        <span><i className="swatch c-CoberturaTipoVenta" /> Cobertura tipo venta</span>
      </div>
      {!editable && <p className="muted" style={{ marginTop: 10 }}>Rol en estado {rol.estado}: solo lectura.</p>}
    </section>
  )
}
