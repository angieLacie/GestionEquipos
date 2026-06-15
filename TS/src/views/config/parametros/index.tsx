import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'react-bootstrap'
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useToggle } from 'usehooks-ts'
import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import KpiCard from '@/components/KpiCard.tsx'
import DataTable from '@/components/DataTable.tsx'
import TablePagination from '@/components/TablePagination.tsx'
import { basePath } from '@/helpers'
import {
  listarParametros,
  crearParametro,
  MODULOS,
  TIPOS_DATO,
  CRITICIDADES,
  AMBITOS,
  type Parametro,
  type ModuloNova,
  type Criticidad,
  type CrearParametroInput,
} from '@/lib/config-parametros'

const hoyISO = () => new Date().toISOString().slice(0, 10)

const fmtFecha = (iso: string | null) => {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const CritBadge = ({ c }: { c: Criticidad }) => (
  <span className={`badge ${c === 'Bloqueante' ? 'bg-danger' : 'bg-warning text-dark'}`}>{c}</span>
)

const Aviso = ({ tipo, texto }: { tipo: 'ok' | 'err'; texto: string }) => (
  <div className={`alert ${tipo === 'ok' ? 'alert-success' : 'alert-danger'} py-2 px-3 mb-3`}>{texto}</div>
)

const formInicial = (): CrearParametroInput => ({
  modulo: 'Transversal',
  flujo: '',
  nivel: '',
  nombreParametro: '',
  ambito: 'Global',
  idEmpresa: '',
  idAmbito: '',
  tipoDato: 'Texto',
  unidad: '',
  valor: '',
  esImpactoNegocio: false,
  criticidadConsumo: 'Degradable',
  justificacion: '',
  vigenciaDesde: hoyISO(),
  esCorreccionRetroactiva: false,
})

const Parametros = () => {
  const [filas, setFilas] = useState<Parametro[]>([])
  const [cargando, setCargando] = useState(true)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)

  // Filtros (servidor)
  const [fModulo, setFModulo] = useState<'' | ModuloNova>('')
  const [fCrit, setFCrit] = useState<'' | Criticidad>('')
  const [fClave, setFClave] = useState('')

  // Modal alta
  const [showAdd, toggleAdd] = useToggle()
  const [form, setForm] = useState<CrearParametroInput>(formInicial)
  const [guardando, setGuardando] = useState(false)

  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const cargar = () => {
    setCargando(true)
    listarParametros({ modulo: fModulo || undefined, criticidad: fCrit || undefined, clave: fClave || undefined })
      .then(setFilas)
      .catch((e) => setMsg({ tipo: 'err', texto: e?.message ?? 'No se pudo cargar.' }))
      .finally(() => setCargando(false))
  }

  // Debounce ligero para el filtro de clave.
  useEffect(() => {
    const t = setTimeout(cargar, fClave ? 300 : 0)
    return () => clearTimeout(t)
  }, [fModulo, fCrit, fClave])

  const abrirAgregar = () => {
    setForm(formInicial())
    toggleAdd()
  }

  // Impacto de negocio exige justificación (RN-MAES-17); retroactivo exige flag.
  const justificacionReq = form.esImpactoNegocio && !form.justificacion?.trim()
  const retroactivoInvalido = form.vigenciaDesde < hoyISO() && !form.esCorreccionRetroactiva
  const formValido =
    !!form.nombreParametro.trim() &&
    !!form.valor.trim() &&
    !justificacionReq &&
    !retroactivoInvalido

  const guardar = async () => {
    if (!formValido) return
    setGuardando(true)
    setMsg(null)
    try {
      const creado = await crearParametro({ ...form, nombreParametro: form.nombreParametro.trim() })
      toggleAdd()
      setMsg({ tipo: 'ok', texto: `Parámetro ${creado.clave} versionado.` })
      cargar()
    } catch (e) {
      setMsg({ tipo: 'err', texto: (e as Error)?.message ?? 'No se pudo guardar.' })
    } finally {
      setGuardando(false)
    }
  }

  const columns = useMemo<ColumnDef<Parametro>[]>(() => [
    {
      accessorKey: 'clave',
      header: 'Clave',
      cell: ({ row }) => <code className="fw-semibold">{row.original.clave}</code>,
    },
    { accessorKey: 'modulo', header: 'Módulo' },
    {
      accessorKey: 'valor',
      header: 'Valor',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="d-inline-block text-truncate" style={{ maxWidth: 240 }} title={row.original.valor}>
          {row.original.valor}
        </span>
      ),
    },
    {
      accessorKey: 'criticidadConsumo',
      header: 'Criticidad',
      cell: ({ row }) => <CritBadge c={row.original.criticidadConsumo} />,
    },
    {
      accessorKey: 'vigenciaDesde',
      header: 'Vigente desde',
      cell: ({ row }) => <span className="small">{fmtFecha(row.original.vigenciaDesde)}</span>,
    },
    {
      accessorKey: 'vigenciaHasta',
      header: 'Vigente hasta',
      cell: ({ row }) =>
        row.original.vigenciaHasta
          ? <span className="small text-muted">{fmtFecha(row.original.vigenciaHasta)}</span>
          : <span className="badge bg-success-subtle text-success">Vigente</span>,
    },
  ], [])

  const table = useReactTable({
    data: filas,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const vigentes = filas.filter((f) => !f.vigenciaHasta).length
  const bloqueantes = filas.filter((f) => f.criticidadConsumo === 'Bloqueante').length
  const modulosDistintos = new Set(filas.map((f) => f.modulo)).size

  const set = <K extends keyof CrearParametroInput>(k: K, v: CrearParametroInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="content-wrapper">
      <div className="d-flex align-items-end flex-wrap gap-2 mb-4">
        <PageBreadcrumb
          title={'Parámetros del Sistema'}
          subTitle1={'Configuración'}
          subText={'Parámetros versionados por módulo, ámbito y vigencia (servicio centralizado)'}
        />
      </div>

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <KpiCard label="Parámetros" value={filas.length} accent="var(--primary-600, #4f46e5)" icon="sliders" sub="versiones listadas" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Vigentes" value={vigentes} accent="#10b981" icon="check-circle" sub="sin cierre" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Bloqueantes" value={bloqueantes} accent="#ef4444" icon="alert-triangle" sub="criticidad alta" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Módulos" value={modulosDistintos} accent="#0ea5e9" icon="layers" sub="con parámetros" />
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {msg && <Aviso tipo={msg.tipo} texto={msg.texto} />}

          <div className="alert alert-light border py-2 px-3 mb-3 small text-muted">
            Fuente única de configuración: cada cambio crea una <strong>nueva versión</strong> con vigencia
            (no sobrescribe la anterior, RN-MAES-09). Los módulos consumen el valor vigente a la fecha del
            evento (RN-MAES-14). Un parámetro de <strong>impacto de negocio</strong> exige justificación (RN-MAES-17).
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <div className="input-group flex-nowrap" style={{ maxWidth: 280 }}>
              <span className="input-group-text px-2">
                <svg className="sa-icon sa-bold"><use href={`${basePath}/icons/sprite.svg#search`}></use></svg>
              </span>
              <input type="text" className="form-control" placeholder="Buscar por clave…" value={fClave} onChange={(e) => setFClave(e.target.value)} autoComplete="off" />
            </div>
            <select className="form-select" style={{ maxWidth: 170 }} value={fModulo} onChange={(e) => setFModulo(e.target.value as '' | ModuloNova)}>
              <option value="">Todos los módulos</option>
              {MODULOS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="form-select" style={{ maxWidth: 170 }} value={fCrit} onChange={(e) => setFCrit(e.target.value as '' | Criticidad)}>
              <option value="">Toda criticidad</option>
              {CRITICIDADES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <div className="ms-auto">
              <button className="btn btn-outline-primary" onClick={abrirAgregar}>
                <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#plus`}></use></svg>Nueva versión
              </button>
            </div>
          </div>

          {cargando ? (
            <div className="text-muted py-4 text-center">Cargando…</div>
          ) : (
            <>
              <DataTable table={table} emptyMessage="Sin parámetros para el filtro. Crea una versión arriba." />
              <TablePagination table={table} itemsName="parámetros" />
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal: nueva versión de parámetro */}
      <Modal show={showAdd} onHide={toggleAdd} centered size="lg" className="fade" tabIndex={-1}>
        <ModalHeader>
          <h5 className="modal-title">Nueva versión de parámetro</h5>
          <button type="button" className="btn-close" onClick={toggleAdd}></button>
        </ModalHeader>
        <ModalBody>
          <Row className="g-3">
            <Col md={4}>
              <label className="form-label">Módulo</label>
              <select className="form-select" value={form.modulo} onChange={(e) => set('modulo', e.target.value as ModuloNova)}>
                {MODULOS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Col>
            <Col md={4}>
              <label className="form-label">Flujo <span className="text-muted">(opcional)</span></label>
              <input type="text" className="form-control" value={form.flujo ?? ''} onChange={(e) => set('flujo', e.target.value)} placeholder="ej. APROBACION" />
            </Col>
            <Col md={4}>
              <label className="form-label">Nivel <span className="text-muted">(opcional)</span></label>
              <input type="text" className="form-control" value={form.nivel ?? ''} onChange={(e) => set('nivel', e.target.value)} placeholder="ej. GG" />
            </Col>

            <Col md={8}>
              <label className="form-label">Nombre del parámetro <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={form.nombreParametro} onChange={(e) => set('nombreParametro', e.target.value)} placeholder="ej. SLA_APROBACION_DIAS" />
              <div className="form-text">La clave se deriva de módulo + nombre + flujo + nivel.</div>
            </Col>
            <Col md={4}>
              <label className="form-label">Tipo de dato</label>
              <select className="form-select" value={form.tipoDato} onChange={(e) => set('tipoDato', e.target.value as CrearParametroInput['tipoDato'])}>
                {TIPOS_DATO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Col>

            <Col md={8}>
              <label className="form-label">Valor <span className="text-danger">*</span></label>
              {form.tipoDato === 'Boolean' ? (
                <select className="form-select" value={form.valor} onChange={(e) => set('valor', e.target.value)}>
                  <option value="">Selecciona…</option>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : (
                <input type="text" className="form-control" value={form.valor} onChange={(e) => set('valor', e.target.value)}
                  placeholder={form.tipoDato === 'Lista' || form.tipoDato === 'Rango' ? 'JSON' : 'valor'} />
              )}
            </Col>
            <Col md={4}>
              <label className="form-label">Unidad <span className="text-muted">(opcional)</span></label>
              <input type="text" className="form-control" value={form.unidad ?? ''} onChange={(e) => set('unidad', e.target.value)} placeholder="ej. días, hr" />
            </Col>

            <Col md={4}>
              <label className="form-label">Ámbito</label>
              <select className="form-select" value={form.ambito} onChange={(e) => set('ambito', e.target.value as CrearParametroInput['ambito'])}>
                {AMBITOS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Col>
            <Col md={4}>
              <label className="form-label">Criticidad</label>
              <select className="form-select" value={form.criticidadConsumo} onChange={(e) => set('criticidadConsumo', e.target.value as Criticidad)}>
                {CRITICIDADES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Col>
            <Col md={4}>
              <label className="form-label">Vigente desde</label>
              <input type="date" className={`form-control ${retroactivoInvalido ? 'is-invalid' : ''}`} value={form.vigenciaDesde} onChange={(e) => set('vigenciaDesde', e.target.value)} />
              {retroactivoInvalido && <div className="invalid-feedback">Retroactivo: marca "corrección" abajo.</div>}
            </Col>

            {form.ambito !== 'Global' && (
              <>
                <Col md={6}>
                  <label className="form-label">Empresa <span className="text-muted">(opcional)</span></label>
                  <input type="text" className="form-control" value={form.idEmpresa ?? ''} onChange={(e) => set('idEmpresa', e.target.value)} placeholder="ej. CADENA" />
                </Col>
                <Col md={6}>
                  <label className="form-label">Id ámbito <span className="text-muted">(opcional)</span></label>
                  <input type="text" className="form-control" value={form.idAmbito ?? ''} onChange={(e) => set('idAmbito', e.target.value)} placeholder="zona/tienda/puesto" />
                </Col>
              </>
            )}

            <Col xs={12}>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="impacto" checked={form.esImpactoNegocio} onChange={(e) => set('esImpactoNegocio', e.target.checked)} />
                <label className="form-check-label" htmlFor="impacto">Impacto de negocio (exige justificación)</label>
              </div>
            </Col>
            {form.esImpactoNegocio && (
              <Col xs={12}>
                <label className="form-label">Justificación <span className="text-danger">*</span></label>
                <textarea className={`form-control ${justificacionReq ? 'is-invalid' : ''}`} rows={2} value={form.justificacion ?? ''} onChange={(e) => set('justificacion', e.target.value)} />
              </Col>
            )}
            {form.vigenciaDesde < hoyISO() && (
              <Col xs={12}>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="retro" checked={form.esCorreccionRetroactiva} onChange={(e) => set('esCorreccionRetroactiva', e.target.checked)} />
                  <label className="form-check-label" htmlFor="retro">Es corrección retroactiva de un error (RN-MAES-10/20)</label>
                </div>
              </Col>
            )}
          </Row>
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-default" onClick={toggleAdd}>Cancelar</button>
          <Button variant="primary" onClick={guardar} disabled={!formValido || guardando}>
            {guardando ? 'Guardando…' : 'Crear versión'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default Parametros
