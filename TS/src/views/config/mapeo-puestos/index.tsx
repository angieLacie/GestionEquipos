import { useEffect, useMemo, useRef, useState } from 'react'
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
import copy from 'copy-to-clipboard'
import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import KpiCard from '@/components/KpiCard.tsx'
import DataTable from '@/components/DataTable.tsx'
import TablePagination from '@/components/TablePagination.tsx'
import { useConfirm } from '@/components/ConfirmDialog.tsx'
import { basePath } from '@/helpers'
import { obtenerMapeoPuestos, guardarMapeoPuestos, type MapeoPuesto } from '@/lib/parametros'
import { listarRoster, type CategoriaRol } from '@/lib/roster'

type FilaMapeo = MapeoPuesto & { i: number }

const CATEGORIAS: CategoriaRol[] = ['GtAsesores', 'Secretarias', 'Auxiliares', 'Sastres', 'Seniors']

// Color vivo (sólido) por categoría — pills tipo INTERFAZ/NOVA del diseño.
const CAT_COLOR: Record<CategoriaRol, string> = {
  GtAsesores: '#4f46e5', // indigo
  Secretarias: '#db2777', // magenta
  Auxiliares: '#f59e0b', // ámbar
  Sastres: '#0d9488', // teal
  Seniors: '#16a34a', // verde
}

const CatBadge = ({ categoria }: { categoria: CategoriaRol }) => (
  <span className="badge fw-semibold" style={{ background: CAT_COLOR[categoria], color: '#fff' }}>
    {categoria}
  </span>
)

const Aviso = ({ tipo, texto }: { tipo: 'ok' | 'err'; texto: string }) => (
  <div className={`alert ${tipo === 'ok' ? 'alert-success' : 'alert-danger'} py-2 px-3 mb-3`}>{texto}</div>
)

const MapeoPuestos = () => {
  const [filas, setFilas] = useState<MapeoPuesto[]>([])
  // Ref a las filas vigentes → evita closures stale en celdas memoizadas y
  // permite enviar la lista completa al auto-guardar.
  const filasRef = useRef<MapeoPuesto[]>([])
  filasRef.current = filas
  const [puestosRoster, setPuestosRoster] = useState<string[]>([])
  const [cargando, setCargando] = useState(true)
  const [estado, setEstado] = useState<'idle' | 'guardando' | 'guardado' | 'error'>('idle')
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)
  // Modal "Agregar puesto"
  const [showAdd, toggleAdd] = useToggle()
  const [nuevoPuesto, setNuevoPuesto] = useState('')
  const [nuevaCat, setNuevaCat] = useState<CategoriaRol>('GtAsesores')

  // Filtros de la grilla
  const [busqueda, setBusqueda] = useState('')
  const [fCategoria, setFCategoria] = useState('')

  // Orden + paginación (gestionados por @tanstack/react-table)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  // Confirmación para acciones destructivas
  const { confirm, dialog: confirmDialog } = useConfirm()

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

  // Filas según búsqueda + filtro (conserva índice real para editar). El orden
  // y la paginación los aplica tanstack sobre estas filas.
  const filasFiltradas = useMemo<FilaMapeo[]>(() => {
    const q = busqueda.trim().toLowerCase()
    return filas
      .map((f, i) => ({ ...f, i }))
      .filter((f) => (!q || f.puesto.toLowerCase().includes(q)) && (!fCategoria || f.categoria === fCategoria))
  }, [filas, busqueda, fCategoria])

  // Aplica un cambio en memoria + lo persiste (auto-guardado, nueva versión).
  const aplicar = async (next: MapeoPuesto[]) => {
    setFilas(next)
    setEstado('guardando')
    setMsg(null)
    try {
      await guardarMapeoPuestos(next)
      setEstado('guardado')
    } catch (e) {
      setEstado('error')
      setMsg({ tipo: 'err', texto: (e as Error)?.message ?? 'No se pudo guardar el cambio.' })
    }
  }

  const setCategoria = (i: number, categoria: CategoriaRol) =>
    aplicar(filasRef.current.map((x, j) => (j === i ? { ...x, categoria } : x)))

  const eliminar = async (i: number, puesto: string) => {
    const ok = await confirm({
      title: 'Quitar puesto',
      message: <>¿Quitar <strong>{puesto}</strong> del mapeo?</>,
      confirmText: 'Quitar',
      variant: 'danger',
    })
    if (ok) aplicar(filasRef.current.filter((_, j) => j !== i))
  }

  // Columnas de la grilla (Puesto/Categoría ordenables; Reasignar/Acciones no).
  const columns = useMemo<ColumnDef<FilaMapeo>[]>(() => [
    {
      accessorKey: 'puesto',
      header: 'Puesto (RMS)',
      cell: ({ row }) => <span className="fw-semibold">{row.original.puesto}</span>,
    },
    {
      accessorKey: 'categoria',
      header: 'Categoría',
      cell: ({ row }) => <CatBadge categoria={row.original.categoria} />,
    },
    {
      id: 'reasignar',
      header: 'Reasignar',
      enableSorting: false,
      cell: ({ row }) => (
        <select
          className="form-select form-select-sm"
          style={{ maxWidth: 200 }}
          value={row.original.categoria}
          onChange={(e) => setCategoria(row.original.i, e.target.value as CategoriaRol)}
        >
          {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      ),
    },
    {
      id: 'acciones',
      header: () => <span className="d-block text-center">Acciones</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-center">
          <button className="btn btn-sm btn-icon btn-outline-danger rounded-circle" onClick={() => eliminar(row.original.i, row.original.puesto)} title="Quitar">
            <svg className="sa-icon"><use href={`${basePath}/icons/sprite.svg#trash-2`}></use></svg>
          </button>
        </div>
      ),
    },
  ], [])

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

  const abrirAgregar = () => {
    setNuevoPuesto('')
    setNuevaCat('GtAsesores')
    toggleAdd()
  }

  const agregar = () => {
    if (!nuevoPuesto) return
    aplicar([...filasRef.current, { puesto: nuevoPuesto, categoria: nuevaCat }])
    toggleAdd()
  }

  // ── Exportar / copiar (respeta filtros actuales) ──────────────
  const copiar = () => {
    const tsv = ['Puesto\tCategoría', ...filasFiltradas.map((f) => `${f.puesto}\t${f.categoria}`)].join('\n')
    try {
      copy(tsv)
      setMsg({ tipo: 'ok', texto: `${filasFiltradas.length} fila(s) copiadas al portapapeles.` })
    } catch {
      setMsg({ tipo: 'err', texto: 'No se pudo copiar (permiso del navegador).' })
    }
  }

  const exportarCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
    const csv = ['Puesto,Categoría', ...filasFiltradas.map((f) => `${esc(f.puesto)},${esc(f.categoria)}`)].join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mapeo-puestos.csv'
    a.click()
    URL.revokeObjectURL(url)
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

      {/* ── KPIs ─────────────────────────────────────────────── */}
      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <KpiCard label="Puestos mapeados" value={filas.length} accent="var(--primary-600, #4f46e5)" icon="git-merge"
            badge={{ text: `${CATEGORIAS.length} categorías`, variant: 'primary' }} sub="configurados" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Puestos en RMS" value={puestosRoster.length} accent="#0ea5e9" icon="users" sub="roster vigente" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Sin mapear" value={sinMapear.length} accent={sinMapear.length ? '#f59e0b' : '#10b981'} icon="alert-triangle"
            badge={sinMapear.length ? { text: '→ GtAsesores', variant: 'warning' } : { text: 'completo', variant: 'success' }} />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Categorías" value={CATEGORIAS.length} accent="#8b5cf6" icon="layers"
            sub={CATEGORIAS.join(' · ')} />
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {msg && <Aviso tipo={msg.tipo} texto={msg.texto} />}

          <div className="alert alert-light border py-2 px-3 mb-3 small text-muted">
            La categoría <strong>Seniors</strong> normalmente se determina por el indicador de empleado
            senior; este mapeo cubre el puesto base. Cada cambio se guarda automáticamente
            como nueva versión del parámetro (con vigencia y auditoría), sin tocar código.
          </div>

          {/* ── Toolbar: búsqueda + filtro + agregar ──────────── */}
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <div className="input-group flex-nowrap" style={{ maxWidth: 280 }}>
              <span className="input-group-text px-2">
                <svg className="sa-icon sa-bold"><use href={`${basePath}/icons/sprite.svg#search`}></use></svg>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar puesto…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                autoComplete="off"
              />
            </div>
            <select className="form-select" style={{ maxWidth: 200 }} value={fCategoria} onChange={(e) => setFCategoria(e.target.value)}>
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <div className="ms-auto d-flex flex-wrap align-items-center gap-2">
              <button className="btn btn-outline-secondary" onClick={copiar} disabled={filasFiltradas.length === 0} title="Copiar al portapapeles">
                <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#copy`}></use></svg>Copiar
              </button>
              <button className="btn btn-outline-success" onClick={exportarCsv} disabled={filasFiltradas.length === 0} title="Descargar CSV (Excel)">
                <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#download`}></use></svg>Excel
              </button>
              <button className="btn btn-outline-primary" onClick={abrirAgregar} disabled={sinMapear.length === 0}>
                <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#plus`}></use></svg>Nuevo puesto
              </button>
              {estado !== 'idle' && (
                <span className={`small fw-semibold d-inline-flex align-items-center gap-1 ${estado === 'error' ? 'text-danger' : estado === 'guardando' ? 'text-muted' : 'text-success'}`}>
                  <svg className="sa-icon" style={{ width: 14, height: 14 }}>
                    <use href={`${basePath}/icons/sprite.svg#${estado === 'error' ? 'alert-triangle' : estado === 'guardando' ? 'refresh-cw' : 'check'}`}></use>
                  </svg>
                  {estado === 'guardando' ? 'Guardando…' : estado === 'error' ? 'Error al guardar' : 'Guardado'}
                </span>
              )}
            </div>
          </div>

          {cargando ? (
            <div className="text-muted py-4 text-center">Cargando…</div>
          ) : (
            <>
              <DataTable
                table={table}
                emptyMessage={filas.length === 0 ? 'Sin mapeos. Agrega uno arriba.' : 'Sin resultados para el filtro.'}
              />

              <TablePagination table={table} itemsName="puestos" />

              {sinMapear.length > 0 && (
                <div className="small text-muted mt-2">
                  ⚠ {sinMapear.length} puesto(s) del roster sin mapear → caen a <strong>GtAsesores</strong> por defecto.
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* ── Modal: agregar puesto ──────────────────────────── */}
      <Modal show={showAdd} onHide={toggleAdd} centered className="fade" tabIndex={-1}>
        <ModalHeader>
          <h5 className="modal-title">Agregar puesto</h5>
          <button type="button" className="btn-close" onClick={toggleAdd}></button>
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <label className="form-label">Puesto (RMS) <span className="text-danger">*</span></label>
            <select className="form-select" value={nuevoPuesto} onChange={(e) => setNuevoPuesto(e.target.value)}>
              <option value="">Selecciona un puesto…</option>
              {sinMapear.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="form-text">Solo se listan puestos del roster aún sin mapear.</div>
          </div>
          <div className="mb-1">
            <label className="form-label">Categoría del rol</label>
            <select className="form-select" value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value as CategoriaRol)}>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="mt-2"><CatBadge categoria={nuevaCat} /></div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-default" onClick={toggleAdd}>Cancelar</button>
          <Button variant="primary" onClick={agregar} disabled={!nuevoPuesto}>Agregar</Button>
        </ModalFooter>
      </Modal>

      {confirmDialog}
    </div>
  )
}

export default MapeoPuestos
