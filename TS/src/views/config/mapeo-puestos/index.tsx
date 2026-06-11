import { useEffect, useMemo, useState } from 'react'
import { Card } from 'react-bootstrap'
import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import { obtenerMapeoPuestos, guardarMapeoPuestos, type MapeoPuesto } from '@/lib/parametros'
import { listarRoster, type CategoriaRol } from '@/lib/roster'

const CATEGORIAS: CategoriaRol[] = ['GtAsesores', 'Secretarias', 'Auxiliares', 'Sastres', 'Seniors']

const Aviso = ({ tipo, texto }: { tipo: 'ok' | 'err'; texto: string }) => (
  <div className={`alert ${tipo === 'ok' ? 'alert-success' : 'alert-danger'} py-2 px-3 mb-3`}>{texto}</div>
)

const MapeoPuestos = () => {
  const [filas, setFilas] = useState<MapeoPuesto[]>([])
  const [puestosRoster, setPuestosRoster] = useState<string[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)
  const [nuevoPuesto, setNuevoPuesto] = useState('')

  useEffect(() => {
    let vivo = true
    Promise.all([obtenerMapeoPuestos(), listarRoster({ pageSize: 2000 })])
      .then(([mapeo, pag]) => {
        if (!vivo) return
        setFilas(mapeo)
        const distintos = [...new Set(pag.items.map((e) => e.puestoDesc).filter(Boolean) as string[])].sort()
        setPuestosRoster(distintos)
      })
      .catch((e) => vivo && setMsg({ tipo: 'err', texto: e?.message ?? 'No se pudo cargar.' }))
      .finally(() => vivo && setCargando(false))
    return () => { vivo = false }
  }, [])

  // Puestos del roster que aún no están mapeados (candidatos a agregar)
  const sinMapear = useMemo(() => {
    const mapeados = new Set(filas.map((f) => f.puesto.toUpperCase()))
    return puestosRoster.filter((p) => !mapeados.has(p.toUpperCase()))
  }, [filas, puestosRoster])

  const setCategoria = (i: number, categoria: CategoriaRol) =>
    setFilas((f) => f.map((x, j) => (j === i ? { ...x, categoria } : x)))

  const eliminar = (i: number) => setFilas((f) => f.filter((_, j) => j !== i))

  const agregar = () => {
    if (!nuevoPuesto) return
    setFilas((f) => [...f, { puesto: nuevoPuesto, categoria: 'GtAsesores' }])
    setNuevoPuesto('')
  }

  const guardar = async () => {
    setGuardando(true)
    setMsg(null)
    try {
      await guardarMapeoPuestos(filas)
      setMsg({ tipo: 'ok', texto: 'Mapeo guardado. Nueva versión vigente desde hoy.' })
    } catch (e) {
      setMsg({ tipo: 'err', texto: (e as Error)?.message ?? 'Error al guardar.' })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="content-wrapper">
      <div className="d-flex align-items-end flex-wrap gap-2 mb-4">
        <PageBreadcrumb
          title={'Mapeo Puesto → Categoría'}
          subTitle1={'Configuración'}
          subText={'Define a qué categoría del rol pertenece cada puesto de RMS'}
        />
      </div>

      <Card>
        <Card.Body>
          {msg && <Aviso tipo={msg.tipo} texto={msg.texto} />}

          <div className="alert alert-light border py-2 px-3 mb-3 small text-muted">
            La categoría <strong>Seniors</strong> normalmente se determina por el indicador de empleado
            senior; este mapeo cubre el puesto base. Guardar crea una nueva versión del parámetro
            (con vigencia y auditoría), sin tocar código.
          </div>

          {cargando ? (
            <div className="text-muted py-4 text-center">Cargando…</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Puesto (RMS)</th>
                      <th style={{ width: 220 }}>Categoría del rol</th>
                      <th style={{ width: 60 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas.length === 0 && (
                      <tr><td colSpan={3} className="text-center text-muted py-3">Sin mapeos. Agrega uno abajo.</td></tr>
                    )}
                    {filas.map((f, i) => (
                      <tr key={`${f.puesto}-${i}`}>
                        <td className="fw-semibold">{f.puesto}</td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={f.categoria}
                            onChange={(e) => setCategoria(i, e.target.value as CategoriaRol)}
                          >
                            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-light text-danger" onClick={() => eliminar(i)} title="Quitar">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                <select
                  className="form-select form-select-sm"
                  style={{ maxWidth: 320 }}
                  value={nuevoPuesto}
                  onChange={(e) => setNuevoPuesto(e.target.value)}
                >
                  <option value="">+ Agregar puesto del roster…</option>
                  {sinMapear.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <button className="btn btn-sm btn-light" onClick={agregar} disabled={!nuevoPuesto}>Agregar</button>
                <button className="btn btn-sm btn-primary ms-auto" onClick={guardar} disabled={guardando}>
                  {guardando ? 'Guardando…' : '💾 Guardar mapeo'}
                </button>
              </div>

              {sinMapear.length > 0 && (
                <div className="small text-muted mt-3">
                  ⚠ {sinMapear.length} puesto(s) del roster sin mapear → caen a <strong>GtAsesores</strong> por defecto.
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default MapeoPuestos
