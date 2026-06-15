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
  listarCampania,
  cargarCampania,
  eliminarCampania,
  type SemanaCampania,
} from '@/lib/campania'
import { listarEmpresas, type Empresa } from '@/lib/feriados'

const anioActual = new Date().getFullYear()
const ANIOS = [anioActual - 1, anioActual, anioActual + 1, anioActual + 2]

const fmtFecha = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/** Días (inclusive) de un rango — informativo. */
const dias = (desde: string, hasta: string) =>
  Math.round((new Date(hasta).getTime() - new Date(desde).getTime()) / 86400000) + 1

const Aviso = ({ tipo, texto }: { tipo: 'ok' | 'err'; texto: string }) => (
  <div className={`alert ${tipo === 'ok' ? 'alert-success' : 'alert-danger'} py-2 px-3 mb-3`}>{texto}</div>
)

const Campania = () => {
  const [filas, setFilas] = useState<SemanaCampania[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [cargando, setCargando] = useState(true)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)

  // Filtros
  const [fAnio, setFAnio] = useState(anioActual)
  const [fEmpresa, setFEmpresa] = useState('')

  // Modal alta
  const [showAdd, toggleAdd] = useToggle()
  const [form, setForm] = useState({ idEmpresa: '', desde: '', hasta: '' })
  const [guardando, setGuardando] = useState(false)

  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const { confirm, dialog: confirmDialog } = useConfirm()

  const cargar = () => {
    setCargando(true)
    listarCampania({ anio: fAnio, idEmpresa: fEmpresa || undefined })
      .then(setFilas)
      .catch((e) => setMsg({ tipo: 'err', texto: e?.message ?? 'No se pudo cargar.' }))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [fAnio, fEmpresa])

  useEffect(() => {
    listarEmpresas().then(setEmpresas).catch(() => {})
  }, [])

  const empresaNombre = (cod: string) => empresas.find((e) => e.codigo === cod)?.nombre ?? cod

  const abrirAgregar = () => {
    setForm({ idEmpresa: fEmpresa || '', desde: '', hasta: '' })
    toggleAdd()
  }

  const rangoInvalido = !!form.desde && !!form.hasta && form.hasta < form.desde
  const formValido = !!form.idEmpresa && !!form.desde && !!form.hasta && !rangoInvalido

  const guardar = async () => {
    if (!formValido) return
    setGuardando(true)
    setMsg(null)
    try {
      await cargarCampania(form.idEmpresa, [{ desde: form.desde, hasta: form.hasta }])
      toggleAdd()
      setMsg({ tipo: 'ok', texto: 'Semana de campaña registrada.' })
      cargar()
    } catch (e) {
      setMsg({ tipo: 'err', texto: (e as Error)?.message ?? 'No se pudo registrar.' })
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (s: SemanaCampania) => {
    const ok = await confirm({
      title: 'Eliminar semana de campaña',
      message: <>¿Eliminar el rango <strong>{fmtFecha(s.desde)} → {fmtFecha(s.hasta)}</strong> de {empresaNombre(s.idEmpresa)}?</>,
      confirmText: 'Eliminar',
      variant: 'danger',
    })
    if (!ok) return
    try {
      await eliminarCampania(s.id)
      setMsg({ tipo: 'ok', texto: 'Semana eliminada.' })
      cargar()
    } catch (e) {
      setMsg({ tipo: 'err', texto: (e as Error)?.message ?? 'No se pudo eliminar.' })
    }
  }

  const columns = useMemo<ColumnDef<SemanaCampania>[]>(() => [
    {
      accessorKey: 'idEmpresa',
      header: 'Empresa',
      cell: ({ row }) => <span className="fw-semibold">{empresaNombre(row.original.idEmpresa)}</span>,
    },
    {
      accessorKey: 'desde',
      header: 'Desde',
      cell: ({ row }) => fmtFecha(row.original.desde),
    },
    {
      accessorKey: 'hasta',
      header: 'Hasta',
      cell: ({ row }) => fmtFecha(row.original.hasta),
    },
    {
      id: 'dias',
      header: 'Días',
      enableSorting: false,
      cell: ({ row }) => <span className="badge bg-light text-dark border">{dias(row.original.desde, row.original.hasta)}</span>,
    },
    {
      id: 'acciones',
      header: () => <span className="d-block text-center">Acciones</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-center">
          <button className="btn btn-sm btn-icon btn-outline-danger rounded-circle" onClick={() => eliminar(row.original)} title="Eliminar">
            <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#trash-2`}></use></svg>
          </button>
        </div>
      ),
    },
  ], [empresas])

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

  const totalDias = filas.reduce((s, f) => s + dias(f.desde, f.hasta), 0)
  const empresasConCampania = new Set(filas.map((f) => f.idEmpresa)).size

  return (
    <div className="content-wrapper">
      <div className="d-flex align-items-end flex-wrap gap-2 mb-4">
        <PageBreadcrumb
          title={'Semanas de Campaña'}
          subTitle1={'Configuración'}
          subText={'Rangos de alta demanda que excluyen o flexibilizan fechas de compensación'}
        />
      </div>

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <KpiCard label="Rangos del año" value={filas.length} accent="var(--primary-600, #4f46e5)" icon="calendar" sub={String(fAnio)} />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Días en campaña" value={totalDias} accent="#f59e0b" icon="trending-up" sub="alta demanda" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Empresas" value={empresasConCampania} accent="#0ea5e9" icon="briefcase" sub="con campaña" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Catálogo" value={empresas.length} accent="#8b5cf6" icon="layers" sub="empresas" />
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {msg && <Aviso tipo={msg.tipo} texto={msg.texto} />}

          <div className="alert alert-light border py-2 px-3 mb-3 small text-muted">
            Las semanas de campaña / alta demanda se cargan de forma anticipada por empresa (RN-MAES-21).
            Los módulos consumidores las leen para <strong>excluir</strong> esos rangos como fechas de
            compensación (RN-DESC-11/12) o <strong>flexibilizar</strong> restricciones de días no permitidos
            (RN-DESC-15).
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <select className="form-select" style={{ maxWidth: 130 }} value={fAnio} onChange={(e) => setFAnio(Number(e.target.value))}>
              {ANIOS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <select className="form-select" style={{ maxWidth: 200 }} value={fEmpresa} onChange={(e) => setFEmpresa(e.target.value)}>
              <option value="">Todas las empresas</option>
              {empresas.map((e) => <option key={e.codigo} value={e.codigo}>{e.nombre}</option>)}
            </select>

            <div className="ms-auto">
              <button className="btn btn-outline-primary" onClick={abrirAgregar}>
                <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#plus`}></use></svg>Nueva semana
              </button>
            </div>
          </div>

          {cargando ? (
            <div className="text-muted py-4 text-center">Cargando…</div>
          ) : (
            <>
              <DataTable table={table} emptyMessage="Sin semanas de campaña para el filtro. Agrega una arriba." />
              <TablePagination table={table} itemsName="rangos" />
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal: alta de rango */}
      <Modal show={showAdd} onHide={toggleAdd} centered className="fade" tabIndex={-1}>
        <ModalHeader>
          <h5 className="modal-title">Nueva semana de campaña</h5>
          <button type="button" className="btn-close" onClick={toggleAdd}></button>
        </ModalHeader>
        <ModalBody>
          <Row className="g-3">
            <Col xs={12}>
              <label className="form-label">Empresa <span className="text-danger">*</span></label>
              <select className="form-select" value={form.idEmpresa} onChange={(e) => setForm((f) => ({ ...f, idEmpresa: e.target.value }))}>
                <option value="">Selecciona empresa…</option>
                {empresas.map((e) => <option key={e.codigo} value={e.codigo}>{e.nombre}</option>)}
              </select>
            </Col>
            <Col xs={6}>
              <label className="form-label">Desde <span className="text-danger">*</span></label>
              <input type="date" className="form-control" value={form.desde} onChange={(e) => setForm((f) => ({ ...f, desde: e.target.value }))} />
            </Col>
            <Col xs={6}>
              <label className="form-label">Hasta <span className="text-danger">*</span></label>
              <input
                type="date"
                className={`form-control ${rangoInvalido ? 'is-invalid' : ''}`}
                min={form.desde || undefined}
                value={form.hasta}
                onChange={(e) => setForm((f) => ({ ...f, hasta: e.target.value }))}
              />
              {rangoInvalido && <div className="invalid-feedback">La fecha fin no puede ser anterior a la de inicio.</div>}
            </Col>
            {formValido && (
              <Col xs={12}>
                <div className="small text-muted">Rango de <strong>{dias(form.desde, form.hasta)}</strong> día(s).</div>
              </Col>
            )}
          </Row>
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-default" onClick={toggleAdd}>Cancelar</button>
          <Button variant="primary" onClick={guardar} disabled={!formValido || guardando}>
            {guardando ? 'Guardando…' : 'Registrar'}
          </Button>
        </ModalFooter>
      </Modal>

      {confirmDialog}
    </div>
  )
}

export default Campania
