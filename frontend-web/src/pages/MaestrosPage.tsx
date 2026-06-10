import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '../components/AppLayout'
import { useAuth } from '../lib/auth'
import { ApiError } from '../lib/api'
import {
  listarEmpresas,
  listarRoles,
  listarPermisos,
  listarParametros,
  crearParametro,
  type CrearParametroBody,
} from '../lib/maestros'

type Seccion = 'empresas' | 'roles' | 'permisos' | 'parametros'

const TABS: { id: Seccion; label: string }[] = [
  { id: 'empresas', label: 'Empresas' },
  { id: 'roles', label: 'Roles' },
  { id: 'permisos', label: 'Permisos' },
  { id: 'parametros', label: 'Parámetros' },
]

export function MaestrosPage() {
  const [sec, setSec] = useState<Seccion>('empresas')
  return (
    <AppLayout active="maestros" title="Maestros · Configuración">
      <div className="subtabs">
        {TABS.map((t) => (
          <button key={t.id} className={t.id === sec ? 'subtab activa' : 'subtab'} onClick={() => setSec(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {sec === 'empresas' && <Empresas />}
      {sec === 'roles' && <Roles />}
      {sec === 'permisos' && <Permisos />}
      {sec === 'parametros' && <Parametros />}
    </AppLayout>
  )
}

function Estado({ cargando, error }: { cargando: boolean; error: unknown }) {
  if (cargando) return <p className="muted">Cargando…</p>
  if (error) return <p className="error">{(error as Error).message}</p>
  return null
}

function Empresas() {
  const { data, isLoading, error } = useQuery({ queryKey: ['empresas'], queryFn: listarEmpresas })
  return (
    <section className="tarjeta">
      <h2>Empresas / cadenas</h2>
      <Estado cargando={isLoading} error={error} />
      {data && (
        <table>
          <thead>
            <tr><th>Código</th><th>Nombre</th><th>Inicio semana</th><th>Cobertura tipo venta</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {data.map((e) => (
              <tr key={e.codigo}>
                <td><strong>{e.codigo}</strong></td>
                <td>{e.nombre}</td>
                <td>{e.diaInicioSemana}</td>
                <td>{e.existeCoberturaTipoVenta ? 'Sí' : 'No'}</td>
                <td>{e.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function Roles() {
  const { data, isLoading, error } = useQuery({ queryKey: ['roles'], queryFn: listarRoles })
  return (
    <section className="tarjeta">
      <h2>Roles funcionales</h2>
      <Estado cargando={isLoading} error={error} />
      {data && (
        <table>
          <thead><tr><th>Código</th><th>Nombre</th><th>Nivel autoridad</th><th>Ámbito</th></tr></thead>
          <tbody>
            {[...data].sort((a, b) => b.nivelAutoridad - a.nivelAutoridad).map((r) => (
              <tr key={r.codigo}>
                <td><strong>{r.codigo}</strong></td>
                <td>{r.nombre}</td>
                <td>{r.nivelAutoridad}</td>
                <td>{r.ambitoPermitido}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function Permisos() {
  const { data, isLoading, error } = useQuery({ queryKey: ['permisos'], queryFn: listarPermisos })
  return (
    <section className="tarjeta">
      <h2>Permisos granulares</h2>
      <Estado cargando={isLoading} error={error} />
      {data && (
        <table>
          <thead><tr><th>Clave</th><th>Módulo</th><th>Acción</th></tr></thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.clave}><td><code>{p.clave}</code></td><td>{p.modulo}</td><td>{p.accion}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function Parametros() {
  const qc = useQueryClient()
  const [abierto, setAbierto] = useState(false)
  const { data, isLoading, error } = useQuery({ queryKey: ['parametros'], queryFn: listarParametros })

  return (
    <section className="tarjeta">
      <div className="entre">
        <h2>Parámetros de configuración</h2>
        <button className="btn btn-primary" onClick={() => setAbierto(true)}>+ Nuevo parámetro</button>
      </div>
      <Estado cargando={isLoading} error={error} />
      {data && data.items.length === 0 && <p className="muted">Sin parámetros configurados.</p>}
      {data && data.items.length > 0 && (
        <table>
          <thead>
            <tr><th>Clave</th><th>Módulo</th><th>Valor</th><th>Criticidad</th><th>Vigencia desde</th></tr>
          </thead>
          <tbody>
            {data.items.map((p) => (
              <tr key={p.id}>
                <td><code>{p.clave}</code></td>
                <td>{p.modulo}</td>
                <td>{p.valor}</td>
                <td><span className={p.criticidadConsumo === 'Bloqueante' ? 'badge bloq' : 'badge degr'}>{p.criticidadConsumo}</span></td>
                <td>{p.vigenciaDesde}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {abierto && <NuevoParametro onClose={() => setAbierto(false)} onSaved={() => { setAbierto(false); qc.invalidateQueries({ queryKey: ['parametros'] }) }} />}
    </section>
  )
}

const MODULOS = ['ROL', 'MARC', 'DESC', 'ENCA', 'TRAS', 'VAC', 'ASCE', 'APROBACIONES', 'SEGURIDAD', 'TRANSVERSAL']
const TIPOS = ['ENTERO', 'DECIMAL', 'BOOLEAN', 'FECHA', 'HORA', 'TEXTO', 'LISTA', 'RANGO']

function NuevoParametro({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const idActor = useAuth((s) => s.usuario?.idUsuario) ?? ''
  const [form, setForm] = useState({
    modulo: 'TRANSVERSAL',
    nombreParametro: '',
    tipoDato: 'ENTERO',
    valor: '',
    criticidadConsumo: 'DEGRADABLE',
    esImpactoNegocio: false,
    justificacion: '',
    vigenciaDesde: new Date().toISOString().slice(0, 10),
  })
  const [error, setError] = useState<string | null>(null)

  const mut = useMutation({
    mutationFn: (body: CrearParametroBody) => crearParametro(body),
    onSuccess: onSaved,
    onError: (e) => setError(e instanceof ApiError ? e.message : 'No se pudo guardar.'),
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    mut.mutate({
      modulo: form.modulo,
      nombreParametro: form.nombreParametro,
      ambito: 'GLOBAL',
      tipoDato: form.tipoDato,
      valor: form.valor,
      esImpactoNegocio: form.esImpactoNegocio,
      criticidadConsumo: form.criticidadConsumo,
      justificacion: form.justificacion || null,
      vigenciaDesde: form.vigenciaDesde,
      esCorreccionRetroactiva: false,
      idActor,
    })
  }

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="modal-bg" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>Nuevo parámetro</h3>
        <div className="grid2">
          <div className="campo">
            <label>Módulo</label>
            <select value={form.modulo} onChange={(e) => set('modulo', e.target.value)}>
              {MODULOS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="campo">
            <label>Nombre del parámetro</label>
            <input value={form.nombreParametro} onChange={(e) => set('nombreParametro', e.target.value)} placeholder="PLAZO_ENVIO_GZ" required />
          </div>
          <div className="campo">
            <label>Tipo de dato</label>
            <select value={form.tipoDato} onChange={(e) => set('tipoDato', e.target.value)}>
              {TIPOS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="campo">
            <label>Valor</label>
            <input value={form.valor} onChange={(e) => set('valor', e.target.value)} required />
          </div>
          <div className="campo">
            <label>Criticidad</label>
            <select value={form.criticidadConsumo} onChange={(e) => set('criticidadConsumo', e.target.value)}>
              <option>DEGRADABLE</option>
              <option>BLOQUEANTE</option>
            </select>
          </div>
          <div className="campo">
            <label>Vigencia desde</label>
            <input type="date" value={form.vigenciaDesde} onChange={(e) => set('vigenciaDesde', e.target.value)} required />
          </div>
        </div>
        <div className="campo campo-check">
          <input type="checkbox" id="imp" checked={form.esImpactoNegocio} onChange={(e) => set('esImpactoNegocio', e.target.checked)} />
          <label htmlFor="imp">Es de impacto de negocio (exige justificación)</label>
        </div>
        {form.esImpactoNegocio && (
          <div className="campo">
            <label>Justificación</label>
            <input value={form.justificacion} onChange={(e) => set('justificacion', e.target.value)} required />
          </div>
        )}
        {error && <p className="error">{error}</p>}
        <div className="fila-acciones" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={mut.isPending}>{mut.isPending ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  )
}
