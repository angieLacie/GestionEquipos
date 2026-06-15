import { useEffect, useMemo, useState } from 'react'
import { Card, Col, Modal, ModalBody, ModalHeader, Row } from 'react-bootstrap'
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
  listarAuditoria,
  ACCIONES,
  ACCION_LABEL,
  type Auditoria,
  type AccionConfig,
} from '@/lib/auditoria'

const fmtFechaHora = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const ACCION_COLOR: Record<AccionConfig, string> = {
  Alta: 'success',
  Modificacion: 'primary',
  Desactivacion: 'danger',
  CambioVigencia: 'info',
  CorreccionRetroactiva: 'warning',
}

const AccionBadge = ({ a }: { a: AccionConfig }) => (
  <span className={`badge bg-${ACCION_COLOR[a]}-subtle text-${ACCION_COLOR[a]}`}>{ACCION_LABEL[a]}</span>
)

const Aviso = ({ tipo, texto }: { tipo: 'ok' | 'err'; texto: string }) => (
  <div className={`alert ${tipo === 'ok' ? 'alert-success' : 'alert-danger'} py-2 px-3 mb-3`}>{texto}</div>
)

const Trunc = ({ v }: { v: string | null }) =>
  v
    ? <span className="d-inline-block text-truncate" style={{ maxWidth: 200 }} title={v}>{v}</span>
    : <span className="text-muted">—</span>

const Historial = () => {
  const [filas, setFilas] = useState<Auditoria[]>([])
  const [cargando, setCargando] = useState(true)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)

  // Filtros (servidor)
  const [fElemento, setFElemento] = useState('')
  const [fAccion, setFAccion] = useState<'' | AccionConfig>('')
  const [fDesde, setFDesde] = useState('')
  const [fHasta, setFHasta] = useState('')

  // Modal detalle
  const [showDet, toggleDet] = useToggle()
  const [detalle, setDetalle] = useState<Auditoria | null>(null)

  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const cargar = () => {
    setCargando(true)
    listarAuditoria({
      elemento: fElemento || undefined,
      accion: fAccion || undefined,
      desde: fDesde || undefined,
      hasta: fHasta || undefined,
    })
      .then(setFilas)
      .catch((e) => setMsg({ tipo: 'err', texto: e?.message ?? 'No se pudo cargar.' }))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    const t = setTimeout(cargar, fElemento ? 300 : 0)
    return () => clearTimeout(t)
  }, [fElemento, fAccion, fDesde, fHasta])

  const verDetalle = (r: Auditoria) => {
    setDetalle(r)
    toggleDet()
  }

  const columns = useMemo<ColumnDef<Auditoria>[]>(() => [
    {
      accessorKey: 'fechaHora',
      header: 'Fecha / hora',
      cell: ({ row }) => <span className="small fw-semibold">{fmtFechaHora(row.original.fechaHora)}</span>,
    },
    {
      accessorKey: 'accion',
      header: 'Acción',
      cell: ({ row }) => <AccionBadge a={row.original.accion} />,
    },
    {
      accessorKey: 'elemento',
      header: 'Elemento',
      cell: ({ row }) => <code className="small">{row.original.elemento}</code>,
    },
    {
      id: 'anterior',
      header: 'Anterior',
      enableSorting: false,
      cell: ({ row }) => <Trunc v={row.original.valorAnterior} />,
    },
    {
      id: 'nuevo',
      header: 'Nuevo',
      enableSorting: false,
      cell: ({ row }) => <Trunc v={row.original.valorNuevo} />,
    },
    {
      accessorKey: 'usuario',
      header: 'Usuario',
      cell: ({ row }) =>
        row.original.usuario
          ? <span>{row.original.usuario}</span>
          : <span className="text-muted small" title="Usuario no resuelto">—</span>,
    },
    {
      id: 'detalle',
      header: () => <span className="d-block text-center">Detalle</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-center">
          <button className="btn btn-sm btn-icon btn-outline-secondary rounded-circle" onClick={() => verDetalle(row.original)} title="Ver detalle">
            <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#eye`}></use></svg>
          </button>
        </div>
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

  const hoy = new Date().toISOString().slice(0, 10)
  const cambiosHoy = filas.filter((f) => f.fechaHora.slice(0, 10) === hoy).length
  const usuariosDistintos = new Set(filas.map((f) => f.usuario).filter(Boolean)).size

  return (
    <div className="content-wrapper">
      <div className="d-flex align-items-end flex-wrap gap-2 mb-4">
        <PageBreadcrumb
          title={'Historial de Cambios'}
          subTitle1={'Configuración'}
          subText={'Log inmutable de cambios de configuración: quién, cuándo, valor anterior y nuevo'}
        />
      </div>

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <KpiCard label="Registros" value={filas.length} accent="var(--primary-600, #4f46e5)" icon="list" sub="en el log" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Cambios hoy" value={cambiosHoy} accent="#0ea5e9" icon="clock" sub={hoy.split('-').reverse().join('/')} />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Usuarios" value={usuariosDistintos} accent="#8b5cf6" icon="users" sub="con actividad" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Acciones" value={ACCIONES.length} accent="#10b981" icon="activity" sub="tipos auditados" />
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {msg && <Aviso tipo={msg.tipo} texto={msg.texto} />}

          <div className="alert alert-light border py-2 px-3 mb-3 small text-muted">
            Registro <strong>append-only</strong> de todos los cambios de configuración (parámetros, feriados,
            tiendas, campaña). Inmutable: no se edita ni elimina (RN-MAES-16/18). Cada entrada conserva el valor
            anterior y el nuevo, el usuario que lo realizó y la justificación cuando aplica.
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <div className="input-group flex-nowrap" style={{ maxWidth: 260 }}>
              <span className="input-group-text px-2">
                <svg className="sa-icon sa-bold"><use href={`${basePath}/icons/sprite.svg#search`}></use></svg>
              </span>
              <input type="text" className="form-control" placeholder="Buscar elemento…" value={fElemento} onChange={(e) => setFElemento(e.target.value)} autoComplete="off" />
            </div>
            <select className="form-select" style={{ maxWidth: 180 }} value={fAccion} onChange={(e) => setFAccion(e.target.value as '' | AccionConfig)}>
              <option value="">Toda acción</option>
              {ACCIONES.map((a) => <option key={a} value={a}>{ACCION_LABEL[a]}</option>)}
            </select>
            <div className="d-flex align-items-center gap-1">
              <label className="form-label mb-0 small text-muted">Desde</label>
              <input type="date" className="form-control" style={{ maxWidth: 150 }} value={fDesde} onChange={(e) => setFDesde(e.target.value)} />
              <label className="form-label mb-0 small text-muted">Hasta</label>
              <input type="date" className="form-control" style={{ maxWidth: 150 }} value={fHasta} min={fDesde || undefined} onChange={(e) => setFHasta(e.target.value)} />
            </div>
          </div>

          {cargando ? (
            <div className="text-muted py-4 text-center">Cargando…</div>
          ) : (
            <>
              <DataTable table={table} emptyMessage="Sin registros para el filtro." />
              <TablePagination table={table} itemsName="registros" />
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal: detalle del registro */}
      <Modal show={showDet} onHide={toggleDet} centered size="lg" className="fade" tabIndex={-1}>
        <ModalHeader>
          <h5 className="modal-title">Detalle del cambio</h5>
          <button type="button" className="btn-close" onClick={toggleDet}></button>
        </ModalHeader>
        <ModalBody>
          {detalle && (
            <Row className="g-3">
              <Col md={6}><span className="text-muted small d-block">Fecha / hora</span>{fmtFechaHora(detalle.fechaHora)}</Col>
              <Col md={6}><span className="text-muted small d-block">Acción</span><AccionBadge a={detalle.accion} /></Col>
              <Col md={6}><span className="text-muted small d-block">Elemento</span><code>{detalle.elemento}</code></Col>
              <Col md={6}><span className="text-muted small d-block">Usuario</span>{detalle.usuario ?? '—'}</Col>
              <Col md={6}><span className="text-muted small d-block">Vigencia desde</span>{detalle.vigenciaDesde ?? '—'}</Col>
              <Col xs={12}>
                <span className="text-muted small d-block mb-1">Valor anterior</span>
                <pre className="bg-light border rounded p-2 mb-0 small" style={{ whiteSpace: 'pre-wrap', maxHeight: 160, overflow: 'auto' }}>{detalle.valorAnterior ?? '—'}</pre>
              </Col>
              <Col xs={12}>
                <span className="text-muted small d-block mb-1">Valor nuevo</span>
                <pre className="bg-light border rounded p-2 mb-0 small" style={{ whiteSpace: 'pre-wrap', maxHeight: 160, overflow: 'auto' }}>{detalle.valorNuevo ?? '—'}</pre>
              </Col>
              {detalle.justificacion && (
                <Col xs={12}>
                  <span className="text-muted small d-block">Justificación</span>{detalle.justificacion}
                </Col>
              )}
            </Row>
          )}
        </ModalBody>
      </Modal>
    </div>
  )
}

export default Historial
