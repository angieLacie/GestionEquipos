import { useEffect, useMemo, useState } from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import KpiCard from '@/components/KpiCard.tsx'
import DataTable from '@/components/DataTable.tsx'
import TablePagination from '@/components/TablePagination.tsx'
import { basePath } from '@/helpers'
import {
  listarMarcaciones,
  zonasMock,
  tiendasMock,
  type Marcacion,
  type EstadoMarcacion,
} from '@/lib/marcaciones'

const ESTADOS: EstadoMarcacion[] = ['Completo', 'EnTienda', 'SinMarcacion', 'Descanso', 'Vacaciones']

const ESTADO_META: Record<EstadoMarcacion, { label: string; color: string }> = {
  Completo: { label: 'Completo', color: 'success' },
  EnTienda: { label: 'En tienda', color: 'primary' },
  SinMarcacion: { label: 'Sin marcación', color: 'danger' },
  Descanso: { label: 'Descanso', color: 'secondary' },
  Vacaciones: { label: 'Vacaciones', color: 'warning' },
}

/** "08:01:12" → "08:01:12 a. m." */
const fmtHora = (h: string | null) => {
  if (!h) return '—'
  const [hh, mm, ss] = h.split(':').map(Number)
  const ap = hh < 12 ? 'a. m.' : 'p. m.'
  const h12 = hh % 12 === 0 ? 12 : hh % 12
  return `${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')} ${ap}`
}

const EstadoBadge = ({ e }: { e: EstadoMarcacion }) => {
  const m = ESTADO_META[e]
  return <span className={`badge bg-${m.color}-subtle text-${m.color}`}>{m.label}</span>
}

const Marcaciones = () => {
  const [filas, setFilas] = useState<Marcacion[]>([])
  const [cargando, setCargando] = useState(true)

  // Filtros
  const [fFecha, setFFecha] = useState('')
  const [fZona, setFZona] = useState('')
  const [fTienda, setFTienda] = useState('')
  const [fEstado, setFEstado] = useState<'' | EstadoMarcacion>('')
  const [busqueda, setBusqueda] = useState('')

  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const cargar = () => {
    setCargando(true)
    listarMarcaciones({
      zona: fZona || undefined,
      tienda: fTienda || undefined,
      estado: fEstado || undefined,
      busqueda: busqueda || undefined,
    })
      .then(setFilas)
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [fZona, fTienda, fEstado, busqueda])

  const limpiar = () => {
    setFFecha('')
    setFZona('')
    setFTienda('')
    setFEstado('')
    setBusqueda('')
  }

  const columns = useMemo<ColumnDef<Marcacion>[]>(() => [
    {
      accessorKey: 'id',
      header: '#',
      cell: ({ row }) => <span className="text-muted">{row.original.id}</span>,
    },
    {
      accessorKey: 'empleado',
      header: 'Empleado',
      cell: ({ row }) => <span className="fw-semibold">{row.original.empleado}</span>,
    },
    { accessorKey: 'dni', header: 'DNI' },
    { accessorKey: 'puesto', header: 'Puesto' },
    {
      accessorKey: 'zona',
      header: 'Zona',
      cell: ({ row }) => <span className="text-primary">{row.original.zona}</span>,
    },
    { accessorKey: 'tienda', header: 'Tienda' },
    {
      accessorKey: 'horaIngreso',
      header: 'H. Ingreso',
      cell: ({ row }) =>
        row.original.horaIngreso
          ? <span className="text-success font-monospace small">{fmtHora(row.original.horaIngreso)}</span>
          : <span className="text-muted">—</span>,
    },
    {
      accessorKey: 'horaSalida',
      header: 'H. Salida',
      cell: ({ row }) =>
        row.original.horaSalida
          ? <span className="text-danger font-monospace small">{fmtHora(row.original.horaSalida)}</span>
          : <span className="text-muted">—</span>,
    },
    {
      accessorKey: 'estado',
      header: () => <span className="d-block text-end">Estado</span>,
      cell: ({ row }) => <div className="text-end"><EstadoBadge e={row.original.estado} /></div>,
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

  // KPIs
  const completas = filas.filter((m) => m.estado === 'Completo').length
  const enTienda = filas.filter((m) => m.estado === 'EnTienda').length
  const sinMarcacion = filas.filter((m) => m.estado === 'SinMarcacion').length
  const totalMarcaciones = completas + enTienda

  const exportarCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
    const cab = ['Empleado', 'DNI', 'Puesto', 'Zona', 'Tienda', 'H. Ingreso', 'H. Salida', 'Estado']
    const fila = (m: Marcacion) => [
      m.empleado, m.dni, m.puesto, m.zona, m.tienda,
      m.horaIngreso ? fmtHora(m.horaIngreso) : '', m.horaSalida ? fmtHora(m.horaSalida) : '',
      ESTADO_META[m.estado].label,
    ]
    const csv = [cab.map(esc).join(','), ...filas.map((m) => fila(m).map(esc).join(','))].join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'marcaciones.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="content-wrapper">
      <div className="d-flex align-items-end flex-wrap gap-2 mb-4">
        <PageBreadcrumb
          title={'Marcaciones'}
          subTitle1={'Gestión'}
          subText={'Bitácora de marcaciones biométricas realizadas en tienda'}
        />
        <span className="ms-auto badge bg-success-subtle text-success align-self-start">● En línea</span>
      </div>

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <KpiCard label="Total marcaciones" value={totalMarcaciones} accent="var(--primary-600, #4f46e5)" icon="clock" sub="hoy" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Completas" value={completas} accent="#10b981" icon="check-circle" sub="ingreso + salida" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="En tienda" value={enTienda} accent="#0ea5e9" icon="log-in" sub="solo ingreso" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Sin marcación" value={sinMarcacion} accent={sinMarcacion ? '#ef4444' : '#10b981'} icon="alert-triangle" sub="activos sin marcar" />
        </Col>
      </Row>

      <Card className="mb-3">
        <Card.Body className="py-3">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <input type="date" className="form-control" style={{ maxWidth: 160 }} value={fFecha} onChange={(e) => setFFecha(e.target.value)} />
            <select className="form-select" style={{ maxWidth: 180 }} value={fZona} onChange={(e) => setFZona(e.target.value)}>
              <option value="">Todas las zonas</option>
              {zonasMock.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
            <select className="form-select" style={{ maxWidth: 180 }} value={fTienda} onChange={(e) => setFTienda(e.target.value)}>
              <option value="">Todas las tiendas</option>
              {tiendasMock.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="form-select" style={{ maxWidth: 180 }} value={fEstado} onChange={(e) => setFEstado(e.target.value as '' | EstadoMarcacion)}>
              <option value="">Todos los estados</option>
              {ESTADOS.map((s) => <option key={s} value={s}>{ESTADO_META[s].label}</option>)}
            </select>
            <div className="input-group flex-nowrap" style={{ maxWidth: 260 }}>
              <span className="input-group-text px-2">
                <svg className="sa-icon sa-bold"><use href={`${basePath}/icons/sprite.svg#search`}></use></svg>
              </span>
              <input type="text" className="form-control" placeholder="Buscar empleado o DNI" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} autoComplete="off" />
            </div>

            <div className="ms-auto d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={limpiar}>
                <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#x`}></use></svg>Limpiar
              </button>
              <button className="btn btn-outline-success" onClick={exportarCsv} disabled={filas.length === 0}>
                <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#download`}></use></svg>Exportar Excel
              </button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <div className="alert alert-light border py-2 px-3 mb-3 small text-muted">
            ⚠️ Datos de ejemplo — la fuente real de marcaciones biométricas (RMS / dispositivo) aún no está conectada.
          </div>
          {cargando ? (
            <div className="text-muted py-4 text-center">Cargando…</div>
          ) : (
            <>
              <DataTable table={table} emptyMessage="Sin marcaciones para el filtro." />
              <TablePagination table={table} itemsName="marcaciones" />
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default Marcaciones
