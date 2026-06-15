import { useEffect, useState } from 'react'
import { Button, Card, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'react-bootstrap'
import { useToggle } from 'usehooks-ts'
import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import KpiCard from '@/components/KpiCard.tsx'
import { useConfirm } from '@/components/ConfirmDialog.tsx'
import { basePath } from '@/helpers'
import {
  obtenerFlujos,
  guardarFlujos,
  FLUJOS_DEFAULT,
  ROLES_APROBADOR,
  MODULOS_FLUJO,
  type FlujoAprobacion,
  type NivelAprobacion,
} from '@/lib/flujos-aprobacion'

const Icon = ({ name, className = '' }: { name: string; className?: string }) => (
  <svg className={`sa-icon ${className}`}><use href={`${basePath}/icons/sprite.svg#${name}`}></use></svg>
)

const Aviso = ({ tipo, texto }: { tipo: 'ok' | 'err'; texto: string }) => (
  <div className={`alert ${tipo === 'ok' ? 'alert-success' : 'alert-danger'} py-2 px-3 mb-3`}>{texto}</div>
)

const nivelNuevo = (orden: number): NivelAprobacion => ({
  orden, rol: 'GZ', slaHoras: 24, obligatorio: true, segregacion: false,
})

const renumerar = (niveles: NivelAprobacion[]): NivelAprobacion[] =>
  niveles.map((n, i) => ({ ...n, orden: i + 1 }))

const FlujosAprobacion = () => {
  const [flujos, setFlujos] = useState<FlujoAprobacion[]>([])
  const [cargando, setCargando] = useState(true)
  const [dirty, setDirty] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)

  // Modal flujo (nuevo / editar metadatos)
  const [showFlujo, toggleFlujo] = useToggle()
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [fForm, setFForm] = useState({ codigo: '', nombre: '', modulo: MODULOS_FLUJO[0] as string, activo: true })

  const { confirm, dialog: confirmDialog } = useConfirm()

  useEffect(() => {
    obtenerFlujos()
      .then(setFlujos)
      .catch((e) => setMsg({ tipo: 'err', texto: e?.message ?? 'No se pudo cargar.' }))
      .finally(() => setCargando(false))
  }, [])

  // Muta los flujos en memoria y marca cambios sin guardar.
  const mutar = (next: FlujoAprobacion[]) => {
    setFlujos(next)
    setDirty(true)
  }

  const guardar = async () => {
    setGuardando(true)
    setMsg(null)
    try {
      await guardarFlujos(flujos)
      setDirty(false)
      setMsg({ tipo: 'ok', texto: 'Flujos guardados como nueva versión.' })
    } catch (e) {
      setMsg({ tipo: 'err', texto: (e as Error)?.message ?? 'No se pudo guardar.' })
    } finally {
      setGuardando(false)
    }
  }

  const restaurar = async () => {
    const ok = await confirm({
      title: 'Restaurar flujos por defecto',
      message: <>Esto reemplaza toda la configuración con los flujos base. ¿Continuar?</>,
      confirmText: 'Restaurar', variant: 'danger',
    })
    if (ok) mutar(structuredClone(FLUJOS_DEFAULT))
  }

  // ── Flujo: alta / edición de metadatos ───────────────────────
  const abrirNuevoFlujo = () => {
    setEditIdx(null)
    setFForm({ codigo: '', nombre: '', modulo: MODULOS_FLUJO[0], activo: true })
    toggleFlujo()
  }
  const abrirEditarFlujo = (i: number) => {
    const f = flujos[i]
    setEditIdx(i)
    setFForm({ codigo: f.codigo, nombre: f.nombre, modulo: f.modulo, activo: f.activo })
    toggleFlujo()
  }
  const codigoDup = flujos.some((f, i) => f.codigo.toUpperCase() === fForm.codigo.trim().toUpperCase() && i !== editIdx)
  const flujoValido = !!fForm.codigo.trim() && !!fForm.nombre.trim() && !codigoDup

  const guardarFlujoMeta = () => {
    if (!flujoValido) return
    if (editIdx === null) {
      mutar([...flujos, { codigo: fForm.codigo.trim().toUpperCase(), nombre: fForm.nombre.trim(), modulo: fForm.modulo, activo: fForm.activo, niveles: [nivelNuevo(1)] }])
    } else {
      mutar(flujos.map((f, i) => i === editIdx ? { ...f, codigo: fForm.codigo.trim().toUpperCase(), nombre: fForm.nombre.trim(), modulo: fForm.modulo, activo: fForm.activo } : f))
    }
    toggleFlujo()
  }

  const eliminarFlujo = async (i: number) => {
    const ok = await confirm({
      title: 'Eliminar flujo',
      message: <>¿Eliminar el flujo <strong>{flujos[i].nombre}</strong> y todos sus niveles?</>,
      confirmText: 'Eliminar', variant: 'danger',
    })
    if (ok) mutar(flujos.filter((_, j) => j !== i))
  }

  const toggleActivo = (i: number) =>
    mutar(flujos.map((f, j) => j === i ? { ...f, activo: !f.activo } : f))

  // ── Niveles ──────────────────────────────────────────────────
  const setNiveles = (i: number, niveles: NivelAprobacion[]) =>
    mutar(flujos.map((f, j) => j === i ? { ...f, niveles: renumerar(niveles) } : f))

  const setNivel = (fi: number, ni: number, patch: Partial<NivelAprobacion>) =>
    setNiveles(fi, flujos[fi].niveles.map((n, k) => k === ni ? { ...n, ...patch } : n))

  const addNivel = (fi: number) =>
    setNiveles(fi, [...flujos[fi].niveles, nivelNuevo(flujos[fi].niveles.length + 1)])

  const moverNivel = (fi: number, ni: number, dir: -1 | 1) => {
    const arr = [...flujos[fi].niveles]
    const j = ni + dir
    if (j < 0 || j >= arr.length) return
    ;[arr[ni], arr[j]] = [arr[j], arr[ni]]
    setNiveles(fi, arr)
  }

  const eliminarNivel = async (fi: number, ni: number) => {
    const ok = await confirm({
      title: 'Eliminar nivel',
      message: <>¿Eliminar el nivel <strong>{flujos[fi].niveles[ni].rol}</strong> del flujo?</>,
      confirmText: 'Eliminar', variant: 'danger',
    })
    if (ok) setNiveles(fi, flujos[fi].niveles.filter((_, k) => k !== ni))
  }

  const totalNiveles = flujos.reduce((s, f) => s + f.niveles.length, 0)
  const activos = flujos.filter((f) => f.activo).length

  return (
    <div className="content-wrapper">
      <div className="d-flex align-items-end flex-wrap gap-2 mb-4">
        <PageBreadcrumb
          title={'Flujos de Aprobación'}
          subTitle1={'Configuración'}
          subText={'Niveles de aprobación por módulo o tipo de registro (SLA, obligatoriedad, segregación)'}
        />
      </div>

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <KpiCard label="Flujos" value={flujos.length} accent="var(--primary-600, #4f46e5)" icon="shuffle" sub="configurados" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Activos" value={activos} accent="#10b981" icon="check-circle" sub="en uso" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Niveles" value={totalNiveles} accent="#0ea5e9" icon="layers" sub="pasos totales" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Estado" value={dirty ? 'Sin guardar' : 'Guardado'} accent={dirty ? '#f59e0b' : '#10b981'} icon={dirty ? 'alert-triangle' : 'check'} sub="cambios" />
        </Col>
      </Row>

      {msg && <Aviso tipo={msg.tipo} texto={msg.texto} />}

      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <div className="text-muted small">
          Cada flujo define una cadena ordenada de aprobadores. La segregación exige que el aprobador sea distinto del solicitante o del nivel previo.
        </div>
        <div className="ms-auto d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={restaurar}>
            <Icon name="refresh-cw" className="me-1" />Restaurar
          </button>
          <button className="btn btn-outline-primary" onClick={abrirNuevoFlujo}>
            <Icon name="plus" className="me-1" />Nuevo flujo
          </button>
          <Button variant="primary" onClick={guardar} disabled={!dirty || guardando}>
            <Icon name="save" className="me-1" />{guardando ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      {cargando ? (
        <div className="text-muted py-4 text-center">Cargando…</div>
      ) : flujos.length === 0 ? (
        <Card><Card.Body className="text-center text-muted py-4">Sin flujos. Crea uno con "Nuevo flujo".</Card.Body></Card>
      ) : (
        flujos.map((f, fi) => (
          <Card key={fi} className="mb-3">
            <Card.Body>
              {/* Cabecera del flujo */}
              <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
                <h5 className="mb-0 fw-bold">{f.nombre}</h5>
                <span className="badge bg-light text-dark border">{f.codigo}</span>
                <span className="badge bg-secondary-subtle text-secondary">{f.modulo}</span>
                <button
                  className={`badge border-0 ${f.activo ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-muted'}`}
                  onClick={() => toggleActivo(fi)}
                  title="Activar / desactivar"
                  style={{ cursor: 'pointer' }}
                >
                  {f.activo ? 'Activo' : 'Inactivo'}
                </button>
                <div className="ms-auto d-flex gap-1">
                  <button className="btn btn-sm btn-icon btn-outline-secondary rounded-circle" onClick={() => abrirEditarFlujo(fi)} title="Editar flujo">
                    <Icon name="edit-2" />
                  </button>
                  <button className="btn btn-sm btn-icon btn-outline-danger rounded-circle" onClick={() => eliminarFlujo(fi)} title="Eliminar flujo">
                    <Icon name="trash-2" />
                  </button>
                </div>
              </div>

              {/* Niveles */}
              <div className="d-flex align-items-stretch flex-wrap gap-2">
                {f.niveles.map((n, ni) => (
                  <div key={ni} className="d-flex align-items-center gap-2">
                    <div className="border rounded-3 p-2" style={{ minWidth: 230, background: 'var(--bs-light)' }}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge rounded-circle bg-primary" style={{ width: 24, height: 24, lineHeight: '18px' }}>{n.orden}</span>
                        <select className="form-select form-select-sm" style={{ maxWidth: 90 }} value={n.rol} onChange={(e) => setNivel(fi, ni, { rol: e.target.value })}>
                          {ROLES_APROBADOR.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <div className="ms-auto d-flex gap-1">
                          <button className="btn btn-sm btn-icon btn-light" onClick={() => moverNivel(fi, ni, -1)} disabled={ni === 0} title="Subir"><Icon name="arrow-up" /></button>
                          <button className="btn btn-sm btn-icon btn-light" onClick={() => moverNivel(fi, ni, 1)} disabled={ni === f.niveles.length - 1} title="Bajar"><Icon name="arrow-down" /></button>
                          <button className="btn btn-sm btn-icon btn-outline-danger" onClick={() => eliminarNivel(fi, ni)} title="Quitar"><Icon name="trash-2" /></button>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="input-group input-group-sm" style={{ maxWidth: 110 }}>
                          <input type="number" min={1} className="form-control" value={n.slaHoras} onChange={(e) => setNivel(fi, ni, { slaHoras: Math.max(1, e.target.valueAsNumber || 0) })} />
                          <span className="input-group-text">h SLA</span>
                        </div>
                        <select className="form-select form-select-sm" style={{ maxWidth: 110 }} value={n.obligatorio ? '1' : '0'} onChange={(e) => setNivel(fi, ni, { obligatorio: e.target.value === '1' })}>
                          <option value="1">Obligatorio</option>
                          <option value="0">Opcional</option>
                        </select>
                      </div>
                      <div className="form-check form-check-sm mb-0">
                        <input className="form-check-input" type="checkbox" id={`seg-${fi}-${ni}`} checked={n.segregacion} onChange={(e) => setNivel(fi, ni, { segregacion: e.target.checked })} />
                        <label className="form-check-label small" htmlFor={`seg-${fi}-${ni}`}>
                          <Icon name="lock" className="me-1" style={{ width: 12, height: 12 }} />Segregación
                        </label>
                      </div>
                    </div>
                    {ni < f.niveles.length - 1 && <Icon name="arrow-right" className="text-muted" />}
                  </div>
                ))}
                <button className="btn btn-outline-secondary align-self-center" onClick={() => addNivel(fi)}>
                  <Icon name="plus" className="me-1" />Nivel
                </button>
              </div>
            </Card.Body>
          </Card>
        ))
      )}

      {/* Modal: nuevo / editar flujo */}
      <Modal show={showFlujo} onHide={toggleFlujo} centered className="fade" tabIndex={-1}>
        <ModalHeader>
          <h5 className="modal-title">{editIdx === null ? 'Nuevo flujo' : 'Editar flujo'}</h5>
          <button type="button" className="btn-close" onClick={toggleFlujo}></button>
        </ModalHeader>
        <ModalBody>
          <Row className="g-3">
            <Col xs={12}>
              <label className="form-label">Nombre <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={fForm.nombre} onChange={(e) => setFForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="ej. Aprobación de Traslado" />
            </Col>
            <Col xs={6}>
              <label className="form-label">Código <span className="text-danger">*</span></label>
              <input type="text" className={`form-control ${codigoDup ? 'is-invalid' : ''}`} value={fForm.codigo} onChange={(e) => setFForm((f) => ({ ...f, codigo: e.target.value }))} placeholder="FL_XXX" />
              {codigoDup && <div className="invalid-feedback">Código ya usado.</div>}
            </Col>
            <Col xs={6}>
              <label className="form-label">Módulo</label>
              <select className="form-select" value={fForm.modulo} onChange={(e) => setFForm((f) => ({ ...f, modulo: e.target.value }))}>
                {MODULOS_FLUJO.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Col>
            <Col xs={12}>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="flujo-activo" checked={fForm.activo} onChange={(e) => setFForm((f) => ({ ...f, activo: e.target.checked }))} />
                <label className="form-check-label" htmlFor="flujo-activo">Flujo activo</label>
              </div>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-default" onClick={toggleFlujo}>Cancelar</button>
          <Button variant="primary" onClick={guardarFlujoMeta} disabled={!flujoValido}>{editIdx === null ? 'Crear' : 'Guardar'}</Button>
        </ModalFooter>
      </Modal>

      {confirmDialog}
    </div>
  )
}

export default FlujosAprobacion
