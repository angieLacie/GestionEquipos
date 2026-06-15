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
  listarTiendas,
  editarTienda,
  type Tienda,
  type UbicacionTienda,
  type EstadoTienda,
} from '@/lib/tiendas'
import { listarEmpresas, listarZonas, type Empresa, type Zona } from '@/lib/feriados'

const UBIC_LABEL: Record<UbicacionTienda, string> = { Cc: 'Centro Comercial', Pc: 'Pie de Calle' }
const ESTADOS: EstadoTienda[] = ['Activa', 'Suspendida', 'Cerrada']
const EST_COLOR: Record<EstadoTienda, string> = { Activa: 'success', Suspendida: 'warning', Cerrada: 'danger' }

const UbicBadge = ({ u }: { u: UbicacionTienda | null }) =>
  u
    ? <span className={`badge ${u === 'Cc' ? 'bg-primary' : 'bg-info'}`}>{u === 'Cc' ? 'CC' : 'PC'}</span>
    : <span className="badge bg-light text-dark border">Sin definir</span>

const Aviso = ({ tipo, texto }: { tipo: 'ok' | 'err'; texto: string }) => (
  <div className={`alert ${tipo === 'ok' ? 'alert-success' : 'alert-danger'} py-2 px-3 mb-3`}>{texto}</div>
)

const Tiendas = () => {
  const [filas, setFilas] = useState<Tienda[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [zonas, setZonas] = useState<Zona[]>([])
  const [cargando, setCargando] = useState(true)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)

  // Filtros
  const [fEmpresa, setFEmpresa] = useState('')
  const [fEstado, setFEstado] = useState<'' | EstadoTienda>('')
  const [busqueda, setBusqueda] = useState('')

  // Modal edición
  const [showEdit, toggleEdit] = useToggle()
  const [editTienda, setEditTienda] = useState<Tienda | null>(null)
  const [form, setForm] = useState<{ ubicacion: UbicacionTienda; idZona: string; estadoOperativo: EstadoTienda }>({
    ubicacion: 'Cc', idZona: '', estadoOperativo: 'Activa',
  })
  const [guardando, setGuardando] = useState(false)

  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const cargar = () => {
    setCargando(true)
    listarTiendas({ idEmpresa: fEmpresa || undefined, estadoOperativo: fEstado || undefined })
      .then(setFilas)
      .catch((e) => setMsg({ tipo: 'err', texto: e?.message ?? 'No se pudo cargar.' }))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [fEmpresa, fEstado])

  useEffect(() => {
    listarEmpresas().then(setEmpresas).catch(() => {})
    listarZonas().then(setZonas).catch(() => {})
  }, [])

  const zonaNombre = (id: string | null) => zonas.find((z) => z.id === id)?.nombre ?? '—'

  // Zonas de la empresa de la tienda en edición (para el select del modal).
  const zonasModal = useMemo(
    () => (editTienda ? zonas.filter((z) => z.idEmpresa === editTienda.idEmpresa) : []),
    [zonas, editTienda],
  )

  const filasFiltradas = useMemo<Tienda[]>(() => {
    const q = busqueda.trim().toLowerCase()
    return filas.filter((t) => !q || t.nombre.toLowerCase().includes(q) || t.codigo.toLowerCase().includes(q))
  }, [filas, busqueda])

  const abrirEditar = (t: Tienda) => {
    setEditTienda(t)
    setForm({
      ubicacion: t.ubicacion ?? 'Cc',
      idZona: t.idZona ?? '',
      estadoOperativo: t.estadoOperativo,
    })
    toggleEdit()
  }

  const guardar = async () => {
    if (!editTienda) return
    setGuardando(true)
    setMsg(null)
    try {
      await editarTienda(editTienda.id, form)
      toggleEdit()
      setMsg({ tipo: 'ok', texto: `Tienda ${editTienda.codigo} actualizada.` })
      cargar()
    } catch (e) {
      setMsg({ tipo: 'err', texto: (e as Error)?.message ?? 'No se pudo guardar.' })
    } finally {
      setGuardando(false)
    }
  }

  const columns = useMemo<ColumnDef<Tienda>[]>(() => [
    {
      accessorKey: 'codigo',
      header: 'Código',
      cell: ({ row }) => <span className="fw-semibold">{row.original.codigo}</span>,
    },
    { accessorKey: 'nombre', header: 'Tienda' },
    { accessorKey: 'idEmpresa', header: 'Empresa' },
    {
      id: 'zona',
      header: 'Zona',
      cell: ({ row }) => <span className="small">{zonaNombre(row.original.idZona)}</span>,
    },
    {
      accessorKey: 'ubicacion',
      header: 'Ubicación',
      cell: ({ row }) => <UbicBadge u={row.original.ubicacion} />,
    },
    {
      accessorKey: 'dotacionMinimaAsesores',
      header: () => <span>Dotación mín. <span className="text-muted fw-normal">(RMS)</span></span>,
      cell: ({ row }) => <span className="text-end d-block pe-3">{row.original.dotacionMinimaAsesores}</span>,
    },
    {
      accessorKey: 'estadoOperativo',
      header: 'Estado',
      cell: ({ row }) => (
        <span className={`badge bg-${EST_COLOR[row.original.estadoOperativo]}-subtle text-${EST_COLOR[row.original.estadoOperativo]}`}>
          {row.original.estadoOperativo}
        </span>
      ),
    },
    {
      id: 'acciones',
      header: () => <span className="d-block text-center">Acciones</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-center">
          <button className="btn btn-sm btn-icon btn-outline-secondary rounded-circle" onClick={() => abrirEditar(row.original)} title="Editar atributos Nova">
            <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#edit-2`}></use></svg>
          </button>
        </div>
      ),
    },
  ], [zonas])

  const table = useReactTable({
    data: filasFiltradas,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const sinUbicacion = filas.filter((t) => !t.ubicacion).length
  const activas = filas.filter((t) => t.estadoOperativo === 'Activa').length

  return (
    <div className="content-wrapper">
      <div className="d-flex align-items-end flex-wrap gap-2 mb-4">
        <PageBreadcrumb
          title={'Maestro de Tiendas'}
          subTitle1={'Configuración'}
          subText={'Indicador de ubicación (CC/PC), zona y estado operativo. Base sincronizada desde RMS'}
        />
      </div>

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <KpiCard label="Tiendas" value={filas.length} accent="var(--primary-600, #4f46e5)" icon="shopping-bag" sub="en el maestro" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Activas" value={activas} accent="#10b981" icon="check-circle" sub="operativas" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Centro Comercial" value={filas.filter((t) => t.ubicacion === 'Cc').length} accent="#0ea5e9" icon="map-pin" sub="CC" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Sin ubicación" value={sinUbicacion} accent={sinUbicacion ? '#f59e0b' : '#10b981'} icon="alert-triangle"
            badge={sinUbicacion ? { text: 'definir CC/PC', variant: 'warning' } : { text: 'completo', variant: 'success' }} />
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {msg && <Aviso tipo={msg.tipo} texto={msg.texto} />}

          <div className="alert alert-light border py-2 px-3 mb-3 small text-muted">
            La base de tiendas (código, nombre, dotación mínima) se sincroniza desde RMS y es de solo lectura
            (RN-MAES-05/07). En Nova se configuran únicamente el <strong>indicador de ubicación CC/PC</strong>
            (define días no permitidos de compensación, RN-DESC-10B), la zona y el estado operativo.
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <div className="input-group flex-nowrap" style={{ maxWidth: 260 }}>
              <span className="input-group-text px-2">
                <svg className="sa-icon sa-bold"><use href={`${basePath}/icons/sprite.svg#search`}></use></svg>
              </span>
              <input type="text" className="form-control" placeholder="Buscar tienda…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} autoComplete="off" />
            </div>
            <select className="form-select" style={{ maxWidth: 200 }} value={fEmpresa} onChange={(e) => setFEmpresa(e.target.value)}>
              <option value="">Todas las empresas</option>
              {empresas.map((e) => <option key={e.codigo} value={e.codigo}>{e.nombre}</option>)}
            </select>
            <select className="form-select" style={{ maxWidth: 160 }} value={fEstado} onChange={(e) => setFEstado(e.target.value as '' | EstadoTienda)}>
              <option value="">Todo estado</option>
              {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {cargando ? (
            <div className="text-muted py-4 text-center">Cargando…</div>
          ) : (
            <>
              <DataTable table={table} emptyMessage="Sin tiendas para el filtro." />
              <TablePagination table={table} itemsName="tiendas" />
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal: editar atributos Nova */}
      <Modal show={showEdit} onHide={toggleEdit} centered className="fade" tabIndex={-1}>
        <ModalHeader>
          <h5 className="modal-title">Editar tienda {editTienda?.codigo}</h5>
          <button type="button" className="btn-close" onClick={toggleEdit}></button>
        </ModalHeader>
        <ModalBody>
          {editTienda && (
            <>
              <div className="alert alert-light border py-2 px-3 mb-3 small">
                <div><strong>{editTienda.nombre}</strong></div>
                <div className="text-muted">Empresa {editTienda.idEmpresa} · Dotación mín. {editTienda.dotacionMinimaAsesores} (RMS, no editable)</div>
              </div>
              <Row className="g-3">
                <Col xs={6}>
                  <label className="form-label">Ubicación (CC/PC)</label>
                  <select className="form-select" value={form.ubicacion} onChange={(e) => setForm((f) => ({ ...f, ubicacion: e.target.value as UbicacionTienda }))}>
                    <option value="Cc">{UBIC_LABEL.Cc}</option>
                    <option value="Pc">{UBIC_LABEL.Pc}</option>
                  </select>
                </Col>
                <Col xs={6}>
                  <label className="form-label">Estado operativo</label>
                  <select className="form-select" value={form.estadoOperativo} onChange={(e) => setForm((f) => ({ ...f, estadoOperativo: e.target.value as EstadoTienda }))}>
                    {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Col>
                <Col xs={12}>
                  <label className="form-label">Zona</label>
                  <select className="form-select" value={form.idZona} onChange={(e) => setForm((f) => ({ ...f, idZona: e.target.value }))}>
                    <option value="">{editTienda.idZona ? 'Mantener zona actual' : 'Sin asignar'}</option>
                    {zonasModal.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                  </select>
                  {zonasModal.length === 0 && <div className="form-text text-muted">No hay zonas cargadas para {editTienda.idEmpresa}; se conserva la actual.</div>}
                </Col>
              </Row>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-default" onClick={toggleEdit}>Cancelar</button>
          <Button variant="primary" onClick={guardar} disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default Tiendas
