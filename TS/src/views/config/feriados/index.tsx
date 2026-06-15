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
import { useConfirm } from '@/components/ConfirmDialog.tsx'
import { basePath } from '@/helpers'
import {
  listarFeriados,
  crearFeriado,
  editarFeriado,
  eliminarFeriado,
  listarEmpresas,
  listarZonas,
  listarTiendas,
  type Feriado,
  type Empresa,
  type Zona,
  type Tienda,
  type AlcanceFeriado,
  type TipoAmbitoFeriado,
} from '@/lib/feriados'

const hoyISO = () => new Date().toISOString().slice(0, 10)
const anioActual = new Date().getFullYear()
const ANIOS = [anioActual - 1, anioActual, anioActual + 1, anioActual + 2]

const fmtFecha = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const AlcanceBadge = ({ alcance }: { alcance: AlcanceFeriado }) => (
  <span className={`badge ${alcance === 'Nacional' ? 'bg-primary' : 'bg-info'}`}>{alcance}</span>
)

const Aviso = ({ tipo, texto }: { tipo: 'ok' | 'err'; texto: string }) => (
  <div className={`alert ${tipo === 'ok' ? 'alert-success' : 'alert-danger'} py-2 px-3 mb-3`}>{texto}</div>
)

const formInicial = () => ({
  fecha: '',
  descripcion: '',
  alcance: 'Nacional' as AlcanceFeriado,
  empresas: [] as string[],
  compensable: false,
  tipoAmbito: 'Tienda' as TipoAmbitoFeriado,
  idAmbito: '',
})

const Feriados = () => {
  const [filas, setFilas] = useState<Feriado[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [zonas, setZonas] = useState<Zona[]>([])
  const [tiendas, setTiendas] = useState<Tienda[]>([])
  const [cargando, setCargando] = useState(true)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)

  // Filtros
  const [fAnio, setFAnio] = useState(anioActual)
  const [fEmpresa, setFEmpresa] = useState('')
  const [fAlcance, setFAlcance] = useState<'' | AlcanceFeriado>('')

  // Modal alta/edición (editId = null → alta)
  const [showAdd, toggleAdd] = useToggle()
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(formInicial)
  const [guardando, setGuardando] = useState(false)

  const { confirm, dialog: confirmDialog } = useConfirm()

  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const cargar = () => {
    setCargando(true)
    listarFeriados({
      anio: fAnio,
      idEmpresa: fEmpresa || undefined,
      alcance: fAlcance || undefined,
    })
      .then(setFilas)
      .catch((e) => setMsg({ tipo: 'err', texto: e?.message ?? 'No se pudo cargar.' }))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [fAnio, fEmpresa, fAlcance])

  useEffect(() => {
    listarEmpresas().then(setEmpresas).catch(() => {})
  }, [])

  // Carga zonas/tiendas cuando el modal abre en Local y hay empresas elegidas.
  useEffect(() => {
    if (!showAdd || form.alcance !== 'Local') return
    const emp = form.empresas[0]
    Promise.all([listarZonas(emp), listarTiendas(emp)])
      .then(([z, t]) => { setZonas(z); setTiendas(t) })
      .catch(() => {})
  }, [showAdd, form.alcance, form.empresas])

  const columns = useMemo<ColumnDef<Feriado>[]>(() => [
    {
      accessorKey: 'fecha',
      header: 'Fecha',
      cell: ({ row }) => <span className="fw-semibold">{fmtFecha(row.original.fecha)}</span>,
    },
    { accessorKey: 'descripcion', header: 'Descripción' },
    {
      accessorKey: 'alcance',
      header: 'Alcance',
      cell: ({ row }) => <AlcanceBadge alcance={row.original.alcance} />,
    },
    {
      accessorKey: 'empresasAplicables',
      header: 'Empresas',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="d-flex flex-wrap gap-1">
          {row.original.empresasAplicables.split(',').filter(Boolean).map((e) => (
            <span key={e} className="badge bg-light text-dark border">{e}</span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'compensable',
      header: 'Compensable',
      cell: ({ row }) =>
        row.original.compensable
          ? <span className="badge bg-success-subtle text-success">Sí</span>
          : <span className="text-muted">No</span>,
    },
    {
      accessorKey: 'origen',
      header: 'Origen',
      cell: ({ row }) => (
        <span className="small text-muted">
          {row.original.origen === 'ManualAdm' ? 'Manual' : 'Regional'}
        </span>
      ),
    },
    {
      accessorKey: 'vigenciaDesde',
      header: 'Vigente desde',
      cell: ({ row }) => <span className="small">{fmtFecha(row.original.vigenciaDesde)}</span>,
    },
    {
      id: 'acciones',
      header: () => <span className="d-block text-center">Acciones</span>,
      enableSorting: false,
      cell: ({ row }) =>
        row.original.origen === 'ManualAdm' ? (
          <div className="text-center d-inline-flex gap-1">
            <button className="btn btn-sm btn-icon btn-outline-secondary rounded-circle" onClick={() => abrirEditar(row.original)} title="Editar">
              <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#edit-2`}></use></svg>
            </button>
            <button className="btn btn-sm btn-icon btn-outline-danger rounded-circle" onClick={() => eliminar(row.original)} title="Eliminar">
              <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#trash-2`}></use></svg>
            </button>
          </div>
        ) : (
          <span className="d-block text-center text-muted" title="Feriado oficial — no editable">—</span>
        ),
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

  const abrirAgregar = () => {
    setEditId(null)
    setForm(formInicial())
    toggleAdd()
  }

  const abrirEditar = (f: Feriado) => {
    const amb = f.ambitos[0]
    setEditId(f.id)
    setForm({
      fecha: f.fecha,
      descripcion: f.descripcion,
      alcance: f.alcance,
      empresas: f.empresasAplicables.split(',').filter(Boolean),
      compensable: f.compensable,
      tipoAmbito: amb?.tipoAmbito ?? 'Tienda',
      idAmbito: amb?.idAmbito ?? '',
    })
    toggleAdd()
  }

  const eliminar = async (f: Feriado) => {
    const ok = await confirm({
      title: 'Eliminar feriado',
      message: <>¿Eliminar <strong>{f.descripcion}</strong> ({fmtFecha(f.fecha)})? Esta acción no se puede deshacer.</>,
      confirmText: 'Eliminar',
      variant: 'danger',
    })
    if (!ok) return
    try {
      await eliminarFeriado(f.id)
      setMsg({ tipo: 'ok', texto: 'Feriado eliminado.' })
      cargar()
    } catch (e) {
      setMsg({ tipo: 'err', texto: (e as Error)?.message ?? 'No se pudo eliminar.' })
    }
  }

  const toggleEmpresa = (cod: string) =>
    setForm((f) => ({
      ...f,
      empresas: f.empresas.includes(cod) ? f.empresas.filter((c) => c !== cod) : [...f.empresas, cod],
    }))

  // Validación de habilitación del botón Guardar.
  const formValido =
    !!form.fecha &&
    !!form.descripcion.trim() &&
    form.empresas.length > 0 &&
    (form.alcance === 'Nacional' || !!form.idAmbito)

  const guardar = async () => {
    if (!formValido) return
    setGuardando(true)
    setMsg(null)
    const input = {
      fecha: form.fecha,
      descripcion: form.descripcion.trim(),
      alcance: form.alcance,
      empresasAplicables: form.empresas,
      compensable: form.compensable,
      vigenciaDesde: form.fecha, // vigencia = la fecha del feriado por defecto
      ambitos: form.alcance === 'Local' ? [{ tipoAmbito: form.tipoAmbito, idAmbito: form.idAmbito }] : undefined,
    }
    try {
      if (editId) await editarFeriado(editId, input)
      else await crearFeriado(input)
      toggleAdd()
      setMsg({ tipo: 'ok', texto: editId ? 'Feriado actualizado.' : 'Feriado registrado.' })
      cargar()
    } catch (e) {
      setMsg({ tipo: 'err', texto: (e as Error)?.message ?? 'No se pudo guardar el feriado.' })
    } finally {
      setGuardando(false)
    }
  }

  const nacionales = filas.filter((f) => f.alcance === 'Nacional').length
  const compensables = filas.filter((f) => f.compensable).length

  return (
    <div className="content-wrapper">
      <div className="d-flex align-items-end flex-wrap gap-2 mb-4">
        <PageBreadcrumb
          title={'Calendario de Feriados'}
          subTitle1={'Configuración'}
          subText={'Feriados nacionales y locales que excluyen fechas en descansos y compensaciones'}
        />
      </div>

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <KpiCard label="Feriados del año" value={filas.length} accent="var(--primary-600, #4f46e5)" icon="calendar" sub={String(fAnio)} />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Nacionales" value={nacionales} accent="#0ea5e9" icon="flag" sub="alcance país" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Locales" value={filas.length - nacionales} accent="#f59e0b" icon="map-pin" sub="zona / tienda" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Compensables" value={compensables} accent="#10b981" icon="repeat" sub="laborados → compensación" />
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {msg && <Aviso tipo={msg.tipo} texto={msg.texto} />}

          <div className="alert alert-light border py-2 px-3 mb-3 small text-muted">
            El calendario de feriados es maestro del sistema: las fechas registradas se excluyen de las
            propuestas de compensación (RN-DESC-13) y un feriado laborado genera compensación (RN-DESC-05).
            No se permite registrar feriados con vigencia retroactiva.
          </div>

          {/* Toolbar: filtros + alta */}
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <select className="form-select" style={{ maxWidth: 130 }} value={fAnio} onChange={(e) => setFAnio(Number(e.target.value))}>
              {ANIOS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <select className="form-select" style={{ maxWidth: 200 }} value={fEmpresa} onChange={(e) => setFEmpresa(e.target.value)}>
              <option value="">Todas las empresas</option>
              {empresas.map((e) => <option key={e.codigo} value={e.codigo}>{e.nombre}</option>)}
            </select>
            <select className="form-select" style={{ maxWidth: 170 }} value={fAlcance} onChange={(e) => setFAlcance(e.target.value as '' | AlcanceFeriado)}>
              <option value="">Todo alcance</option>
              <option value="Nacional">Nacional</option>
              <option value="Local">Local</option>
            </select>

            <div className="ms-auto">
              <button className="btn btn-outline-primary" onClick={abrirAgregar}>
                <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#plus`}></use></svg>Nuevo feriado
              </button>
            </div>
          </div>

          {cargando ? (
            <div className="text-muted py-4 text-center">Cargando…</div>
          ) : (
            <>
              <DataTable table={table} emptyMessage="Sin feriados para el filtro. Agrega uno arriba." />
              <TablePagination table={table} itemsName="feriados" />
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal: alta de feriado */}
      <Modal show={showAdd} onHide={toggleAdd} centered className="fade" tabIndex={-1}>
        <ModalHeader>
          <h5 className="modal-title">{editId ? 'Editar feriado' : 'Nuevo feriado'}</h5>
          <button type="button" className="btn-close" onClick={toggleAdd}></button>
        </ModalHeader>
        <ModalBody>
          <Row className="g-3">
            <Col xs={12}>
              <label className="form-label">Descripción <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                placeholder="Ej. Día de la Independencia"
              />
            </Col>
            <Col xs={6}>
              <label className="form-label">Fecha <span className="text-danger">*</span></label>
              <input
                type="date"
                className="form-control"
                min={hoyISO()}
                value={form.fecha}
                onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
              />
            </Col>
            <Col xs={6}>
              <label className="form-label">Alcance</label>
              <select
                className="form-select"
                value={form.alcance}
                onChange={(e) => setForm((f) => ({ ...f, alcance: e.target.value as AlcanceFeriado, idAmbito: '' }))}
              >
                <option value="Nacional">Nacional</option>
                <option value="Local">Local</option>
              </select>
            </Col>

            <Col xs={12}>
              <label className="form-label">Empresas aplicables <span className="text-danger">*</span></label>
              <div className="d-flex flex-wrap gap-3">
                {empresas.map((e) => (
                  <div className="form-check" key={e.codigo}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`emp-${e.codigo}`}
                      checked={form.empresas.includes(e.codigo)}
                      onChange={() => toggleEmpresa(e.codigo)}
                    />
                    <label className="form-check-label" htmlFor={`emp-${e.codigo}`}>{e.nombre}</label>
                  </div>
                ))}
              </div>
            </Col>

            {form.alcance === 'Local' && (
              <>
                <Col xs={5}>
                  <label className="form-label">Tipo de ámbito</label>
                  <select
                    className="form-select"
                    value={form.tipoAmbito}
                    onChange={(e) => setForm((f) => ({ ...f, tipoAmbito: e.target.value as TipoAmbitoFeriado, idAmbito: '' }))}
                  >
                    <option value="Tienda">Tienda</option>
                    <option value="Zona">Zona</option>
                  </select>
                </Col>
                <Col xs={7}>
                  <label className="form-label">{form.tipoAmbito} <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={form.idAmbito}
                    onChange={(e) => setForm((f) => ({ ...f, idAmbito: e.target.value }))}
                  >
                    <option value="">Selecciona…</option>
                    {(form.tipoAmbito === 'Zona' ? zonas : tiendas).map((a) => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                  {form.empresas.length === 0 && (
                    <div className="form-text text-warning">Elige una empresa para listar {form.tipoAmbito === 'Zona' ? 'zonas' : 'tiendas'}.</div>
                  )}
                </Col>
              </>
            )}

            <Col xs={12}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="compensable"
                  checked={form.compensable}
                  onChange={(e) => setForm((f) => ({ ...f, compensable: e.target.checked }))}
                />
                <label className="form-check-label" htmlFor="compensable">
                  Compensable (laborarlo acumula compensación)
                </label>
              </div>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-default" onClick={toggleAdd}>Cancelar</button>
          <Button variant="primary" onClick={guardar} disabled={!formValido || guardando}>
            {guardando ? 'Guardando…' : editId ? 'Guardar' : 'Registrar'}
          </Button>
        </ModalFooter>
      </Modal>

      {confirmDialog}
    </div>
  )
}

export default Feriados
