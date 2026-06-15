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
  listarEncargaturas,
  generarSemanas,
  empresasMock,
  tiendasMock,
  type Encargatura,
  type TipoCobertura,
  type EstadoEncargatura,
} from '@/lib/encargaturas'

const TIPOS: TipoCobertura[] = ['Tienda', 'Asesoria', 'Tesoro']
const ESTADOS: EstadoEncargatura[] = ['Programado', 'Ejecucion', 'Culminado', 'Anulado']

const TIPO_STYLE: Record<TipoCobertura, { label: string; bg: string; fg: string }> = {
  Tienda: { label: 'TIENDA', bg: '#e0f2fe', fg: '#0369a1' },
  Asesoria: { label: 'ASESORIA', bg: '#ede9fe', fg: '#6d28d9' },
  Tesoro: { label: 'TESORO', bg: '#fef9c3', fg: '#a16207' },
}
const ESTADO_STYLE: Record<EstadoEncargatura, { label: string; bg: string; fg: string }> = {
  Programado: { label: 'PROGRAMADO', bg: '#e0e7ff', fg: '#4338ca' },
  Ejecucion: { label: 'EJECUCIÓN', bg: '#ffedd5', fg: '#c2410c' },
  Culminado: { label: 'CULMINADO', bg: '#dcfce7', fg: '#15803d' },
  Anulado: { label: 'ANULADO', bg: '#fee2e2', fg: '#b91c1c' },
}

const Pill = ({ s }: { s: { label: string; bg: string; fg: string } }) => (
  <span className="badge fw-semibold" style={{ background: s.bg, color: s.fg }}>{s.label}</span>
)

const fmtFecha = (iso: string) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }
const Aviso = ({ tipo, texto }: { tipo: 'ok' | 'err'; texto: string }) => (
  <div className={`alert ${tipo === 'ok' ? 'alert-success' : 'alert-danger'} py-2 px-3 mb-3`}>{texto}</div>
)

const formInicial = (semanaDesde: string, semanaHasta: string) => ({
  tienda: '', tipo: 'Tienda' as TipoCobertura, todas: false, codigo: '', personal: '',
  semanaNum: 24, desde: semanaDesde, hasta: semanaHasta, observacion: '',
})

const Encargaturas = () => {
  const [filas, setFilas] = useState<Encargatura[]>([])
  const [cargando, setCargando] = useState(true)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)

  // Filtros
  const [fEmpresa, setFEmpresa] = useState('')
  const [fTienda, setFTienda] = useState('')
  const [fTipo, setFTipo] = useState<'' | TipoCobertura>('')
  const [fEstado, setFEstado] = useState<'' | EstadoEncargatura>('')

  const semanas = useMemo(() => generarSemanas(), [])
  const semActual = semanas.find((s) => s.num === 24) ?? semanas[0]

  // Modal nueva / editar programación (editId = null → nueva)
  const [showNew, toggleNew] = useToggle()
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(() => formInicial(semActual.desde, semActual.hasta))

  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const { confirm, dialog: confirmDialog } = useConfirm()

  const cargar = () => {
    setCargando(true)
    listarEncargaturas({
      empresa: fEmpresa || undefined,
      tienda: fTienda || undefined,
      tipo: fTipo || undefined,
      estado: fEstado || undefined,
    })
      .then(setFilas)
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [fEmpresa, fTienda, fTipo, fEstado])

  const anular = async (e: Encargatura) => {
    const ok = await confirm({
      title: 'Anular programación',
      message: <>¿Anular la encargatura de <strong>{e.personal}</strong> ({e.tienda})?</>,
      confirmText: 'Anular', variant: 'danger',
    })
    if (!ok) return
    setFilas((prev) => prev.map((x) => x.id === e.id ? { ...x, estado: 'Anulado' } : x))
    setMsg({ tipo: 'ok', texto: 'Programación anulada.' })
  }

  const abrirNueva = () => {
    setEditId(null)
    setForm(formInicial(semActual.desde, semActual.hasta))
    toggleNew()
  }
  const abrirEditar = (e: Encargatura) => {
    setEditId(e.id)
    setForm({
      tienda: e.tienda, tipo: e.tipoCobertura, todas: false, codigo: e.codigo, personal: e.personal,
      semanaNum: 24, desde: e.fechaInicio, hasta: e.fechaFin, observacion: e.observaciones ?? '',
    })
    toggleNew()
  }
  const elegirSemana = (num: number) => {
    const s = semanas.find((x) => x.num === num)
    if (s) setForm((f) => ({ ...f, semanaNum: num, desde: s.desde, hasta: s.hasta }))
  }
  const aceptar = () => {
    if (!form.tienda || !form.desde || !form.hasta) return
    const ahora = new Date().toISOString().slice(0, 19).replace('T', ' ')
    if (editId != null) {
      setFilas((prev) => prev.map((e) => e.id === editId ? {
        ...e,
        tienda: form.tienda, codigo: form.codigo || e.codigo,
        tipoCobertura: form.todas ? 'Tienda' : form.tipo,
        fechaInicio: form.desde, fechaFin: form.hasta,
        observaciones: form.observacion || null,
        fechaModificacion: ahora, modificadoPor: '—',
      } : e))
      toggleNew()
      setMsg({ tipo: 'ok', texto: 'Programación actualizada.' })
      return
    }
    const id = Math.max(0, ...filas.map((e) => e.id)) + 1
    setFilas((prev) => [
      {
        id, empresa: '—', tienda: form.tienda, codigo: form.codigo || '—', personal: '—',
        tipoCobertura: form.todas ? 'Tienda' : form.tipo,
        fechaInicio: form.desde, fechaFin: form.hasta, estado: 'Programado',
        observaciones: form.observacion || null,
        fechaCreacion: ahora, creadoPor: '—', fechaModificacion: ahora, modificadoPor: '—',
      },
      ...prev,
    ])
    toggleNew()
    setMsg({ tipo: 'ok', texto: 'Programación registrada.' })
  }

  const columns = useMemo<ColumnDef<Encargatura>[]>(() => [
    { accessorKey: 'empresa', header: 'Empresa', cell: ({ row }) => <span className="fw-semibold">{row.original.empresa}</span> },
    { accessorKey: 'tienda', header: 'Tienda' },
    { accessorKey: 'codigo', header: 'Código', cell: ({ row }) => <span className="text-primary">{row.original.codigo}</span> },
    { accessorKey: 'personal', header: 'Personal asignado', cell: ({ row }) => <span className="text-primary fw-semibold">{row.original.personal}</span> },
    { accessorKey: 'tipoCobertura', header: 'Tipo cobertura', cell: ({ row }) => <Pill s={TIPO_STYLE[row.original.tipoCobertura]} /> },
    { accessorKey: 'fechaInicio', header: 'F. inicio', cell: ({ row }) => <span className="small">{fmtFecha(row.original.fechaInicio)}</span> },
    { accessorKey: 'fechaFin', header: 'F. fin', cell: ({ row }) => <span className="small">{fmtFecha(row.original.fechaFin)}</span> },
    { accessorKey: 'estado', header: 'Estado', cell: ({ row }) => <Pill s={ESTADO_STYLE[row.original.estado]} /> },
    { accessorKey: 'observaciones', header: 'Observaciones', cell: ({ row }) => row.original.observaciones ?? <span className="text-muted">—</span> },
    { accessorKey: 'fechaCreacion', header: 'F. creación', cell: ({ row }) => <span className="small text-muted">{row.original.fechaCreacion}</span> },
    { accessorKey: 'creadoPor', header: 'Creado por', cell: ({ row }) => <span className="small">{row.original.creadoPor}</span> },
    {
      id: 'acciones',
      header: () => <span className="d-block text-center">Acciones</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-center d-inline-flex gap-1">
          <button className="btn btn-sm btn-icon btn-outline-secondary rounded-circle" onClick={() => abrirEditar(row.original)} title="Editar"><svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#edit-2`}></use></svg></button>
          <button className="btn btn-sm btn-icon btn-outline-danger rounded-circle" onClick={() => anular(row.original)} disabled={row.original.estado === 'Anulado'} title="Anular"><svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#trash-2`}></use></svg></button>
        </div>
      ),
    },
  ], [])

  const table = useReactTable({
    data: filas, columns, state: { sorting, pagination },
    onSortingChange: setSorting, onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel(),
  })

  const enEjecucion = filas.filter((e) => e.estado === 'Ejecucion').length
  const culminadas = filas.filter((e) => e.estado === 'Culminado').length
  const anuladas = filas.filter((e) => e.estado === 'Anulado').length

  const exportarCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
    const cab = ['Empresa', 'Tienda', 'Código', 'Personal', 'Tipo', 'F. inicio', 'F. fin', 'Estado', 'Observaciones', 'F. creación', 'Creado por']
    const fila = (e: Encargatura) => [e.empresa, e.tienda, e.codigo, e.personal, TIPO_STYLE[e.tipoCobertura].label, fmtFecha(e.fechaInicio), fmtFecha(e.fechaFin), ESTADO_STYLE[e.estado].label, e.observaciones ?? '', e.fechaCreacion, e.creadoPor]
    const csv = [cab.map(esc).join(','), ...filas.map((e) => fila(e).map(esc).join(','))].join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = 'encargaturas.csv'; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="content-wrapper">
      <div className="d-flex align-items-end flex-wrap gap-2 mb-4">
        <PageBreadcrumb title={'Gestión de Encargatura'} subTitle1={'Gestión'} subText={'Programaciones de cobertura en tienda'} />
        <span className="ms-auto badge bg-success-subtle text-success align-self-start">● En línea</span>
      </div>

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}><KpiCard label="Total programadas" value={filas.length} accent="var(--primary-600, #4f46e5)" icon="refresh-cw" sub="registros activos" /></Col>
        <Col sm={6} xl={3}><KpiCard label="En ejecución" value={enEjecucion} accent="#f59e0b" icon="play" sub="en curso ahora" /></Col>
        <Col sm={6} xl={3}><KpiCard label="Culminadas" value={culminadas} accent="#10b981" icon="check-circle" sub="finalizadas" /></Col>
        <Col sm={6} xl={3}><KpiCard label="Anuladas" value={anuladas} accent="#ef4444" icon="x-circle" sub="canceladas" /></Col>
      </Row>

      <Card className="mb-3">
        <Card.Body className="py-3">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <select className="form-select" style={{ maxWidth: 180 }} value={fEmpresa} onChange={(e) => setFEmpresa(e.target.value)}>
              <option value="">Todas las empresas</option>
              {empresasMock.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <select className="form-select" style={{ maxWidth: 190 }} value={fTienda} onChange={(e) => setFTienda(e.target.value)}>
              <option value="">Todas las tiendas</option>
              {tiendasMock.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <select className="form-select" style={{ maxWidth: 170 }} value={fTipo} onChange={(e) => setFTipo(e.target.value as '' | TipoCobertura)}>
              <option value="">Todos los tipos</option>
              {TIPOS.map((t) => <option key={t} value={t}>{TIPO_STYLE[t].label}</option>)}
            </select>
            <select className="form-select" style={{ maxWidth: 180 }} value={fEstado} onChange={(e) => setFEstado(e.target.value as '' | EstadoEncargatura)}>
              <option value="">Todos los estados</option>
              {ESTADOS.map((s) => <option key={s} value={s}>{ESTADO_STYLE[s].label}</option>)}
            </select>
            <div className="ms-auto d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={exportarCsv} disabled={filas.length === 0}>
                <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#download`}></use></svg>Exportar
              </button>
              <Button variant="primary" onClick={abrirNueva}>
                <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#plus`}></use></svg>Nueva Programación
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {msg && <Aviso tipo={msg.tipo} texto={msg.texto} />}
          <div className="alert alert-light border py-2 px-3 mb-3 small text-muted">
            ⚠️ Datos de ejemplo — el módulo de Encargaturas aún no tiene backend. Las acciones son locales.
          </div>
          {cargando ? (
            <div className="text-muted py-4 text-center">Cargando…</div>
          ) : (
            <>
              <div className="table-responsive">
                <DataTable table={table} emptyMessage="Sin programaciones para el filtro." />
              </div>
              <TablePagination table={table} itemsName="programaciones" />
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal: nueva programación */}
      <Modal show={showNew} onHide={toggleNew} centered className="fade" tabIndex={-1}>
        <ModalHeader className="bg-dark text-white">
          <h5 className="modal-title text-white w-100 text-center">{editId != null ? 'Editar Programación' : 'Nueva Programación'}</h5>
          <button type="button" className="btn-close btn-close-white" onClick={toggleNew}></button>
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <label className="form-label">Tienda</label>
            <select className="form-select" value={form.tienda} onChange={(e) => setForm((f) => ({ ...f, tienda: e.target.value }))}>
              <option value="">Seleccionar…</option>
              {tiendasMock.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Tipo Cobertura</label>
            <div className="d-flex align-items-center gap-3">
              <select className="form-select" disabled={form.todas} value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoCobertura }))}>
                {TIPOS.map((t) => <option key={t} value={t}>{TIPO_STYLE[t].label}</option>)}
              </select>
              <div className="form-check flex-shrink-0">
                <input className="form-check-input" type="checkbox" id="todas" checked={form.todas} onChange={(e) => setForm((f) => ({ ...f, todas: e.target.checked }))} />
                <label className="form-check-label" htmlFor="todas">Todas</label>
              </div>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Código</label>
            <div className="input-group">
              <input type="text" className="form-control" placeholder="Nro. documento…" value={form.codigo} onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))} />
              <button className="btn btn-primary" type="button" title="Buscar persona">
                <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#user`}></use></svg>
              </button>
            </div>
            {form.personal && form.personal !== '—' && (
              <div className="small fw-semibold text-muted mt-1">{form.personal}</div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Semana</label>
            <select className="form-select" value={form.semanaNum} onChange={(e) => elegirSemana(Number(e.target.value))}>
              {semanas.map((s) => <option key={s.num} value={s.num}>{s.label}</option>)}
            </select>
          </div>
          <Row className="g-3 mb-3">
            <Col xs={6}>
              <label className="form-label">Desde</label>
              <input type="date" className="form-control" value={form.desde} onChange={(e) => setForm((f) => ({ ...f, desde: e.target.value }))} />
            </Col>
            <Col xs={6}>
              <label className="form-label">Hasta</label>
              <input type="date" className="form-control" value={form.hasta} min={form.desde || undefined} onChange={(e) => setForm((f) => ({ ...f, hasta: e.target.value }))} />
            </Col>
          </Row>
          <div>
            <label className="form-label">Observación</label>
            <textarea className="form-control" rows={3} placeholder="Opcional…" value={form.observacion} onChange={(e) => setForm((f) => ({ ...f, observacion: e.target.value }))} />
          </div>
        </ModalBody>
        <ModalFooter className="justify-content-center gap-2">
          <Button variant="outline-success" onClick={aceptar} disabled={!form.tienda}>✓ Aceptar</Button>
          <Button variant="outline-danger" onClick={toggleNew}>✕ Cancelar</Button>
        </ModalFooter>
      </Modal>

      {confirmDialog}
    </div>
  )
}

export default Encargaturas
