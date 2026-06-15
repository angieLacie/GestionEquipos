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
import {
  obtenerParametrosPuesto,
  guardarParametrosPuesto,
  PARAMETROS_PUESTO_DEFAULT,
  type ParametroPuesto,
} from '@/lib/parametros'

type FilaParam = ParametroPuesto & { i: number }

/** Campos numéricos editables (clave → etiqueta + unidad). */
type CampoNum = Exclude<keyof ParametroPuesto, 'puesto'>
const CAMPOS: { key: CampoNum; label: string; unidad: string; step: number }[] = [
  { key: 'diasDescansoMax', label: 'Descanso máx./sem.', unidad: 'días', step: 1 },
  { key: 'diasTrabajoMax', label: 'Trabajo máx./sem.', unidad: 'días', step: 1 },
  { key: 'horasPartTime', label: 'Part time / día', unidad: 'hr', step: 0.5 },
  { key: 'horasFullTime', label: 'Full time / día', unidad: 'hr', step: 0.1 },
  { key: 'horaRefrigerio', label: 'Refrigerio / día', unidad: 'hr', step: 0.5 },
]

const Aviso = ({ tipo, texto }: { tipo: 'ok' | 'err'; texto: string }) => (
  <div className={`alert ${tipo === 'ok' ? 'alert-success' : 'alert-danger'} py-2 px-3 mb-3`}>{texto}</div>
)

const ParametrosPuestos = () => {
  const [filas, setFilas] = useState<ParametroPuesto[]>([])
  // Ref a las filas vigentes → evita closures stale en celdas memoizadas.
  const filasRef = useRef<ParametroPuesto[]>([])
  filasRef.current = filas
  const [cargando, setCargando] = useState(true)
  const [estado, setEstado] = useState<'idle' | 'guardando' | 'guardado' | 'error'>('idle')
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)

  // Modal "Agregar puesto"
  const [showAdd, toggleAdd] = useToggle()
  const [nuevo, setNuevo] = useState<ParametroPuesto>({
    puesto: '',
    diasDescansoMax: 1,
    diasTrabajoMax: 6,
    horasPartTime: 4,
    horasFullTime: 8,
    horaRefrigerio: 1.5,
  })

  const [busqueda, setBusqueda] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const { confirm, dialog: confirmDialog } = useConfirm()

  useEffect(() => {
    let vivo = true
    obtenerParametrosPuesto()
      .then((lista) => vivo && setFilas(lista))
      .catch((e) => vivo && setMsg({ tipo: 'err', texto: e?.message ?? 'No se pudo cargar.' }))
      .finally(() => vivo && setCargando(false))
    return () => { vivo = false }
  }, [])

  const filasFiltradas = useMemo<FilaParam[]>(() => {
    const q = busqueda.trim().toLowerCase()
    return filas
      .map((f, i) => ({ ...f, i }))
      .filter((f) => !q || f.puesto.toLowerCase().includes(q))
  }, [filas, busqueda])

  // Aplica un cambio en memoria + persiste (auto-guardado, nueva versión).
  const aplicar = async (next: ParametroPuesto[]) => {
    setFilas(next)
    setEstado('guardando')
    setMsg(null)
    try {
      await guardarParametrosPuesto(next)
      setEstado('guardado')
    } catch (e) {
      setEstado('error')
      setMsg({ tipo: 'err', texto: (e as Error)?.message ?? 'No se pudo guardar el cambio.' })
    }
  }

  const setCampo = (i: number, key: CampoNum, valor: number) =>
    aplicar(filasRef.current.map((x, j) => (j === i ? { ...x, [key]: valor } : x)))

  const eliminar = async (i: number, puesto: string) => {
    const ok = await confirm({
      title: 'Quitar puesto',
      message: <>¿Quitar <strong>{puesto}</strong> de la Tabla de Puestos?</>,
      confirmText: 'Quitar',
      variant: 'danger',
    })
    if (ok) aplicar(filasRef.current.filter((_, j) => j !== i))
  }

  const restaurar = async () => {
    const ok = await confirm({
      title: 'Restaurar valores por defecto',
      message: <>Esto reemplaza toda la tabla con los valores de la especificación. ¿Continuar?</>,
      confirmText: 'Restaurar',
      variant: 'danger',
    })
    if (ok) aplicar(PARAMETROS_PUESTO_DEFAULT)
  }

  const columns = useMemo<ColumnDef<FilaParam>[]>(() => [
    {
      accessorKey: 'puesto',
      header: 'Puesto',
      cell: ({ row }) => <span className="fw-semibold">{row.original.puesto}</span>,
    },
    ...CAMPOS.map<ColumnDef<FilaParam>>((c) => ({
      accessorKey: c.key,
      header: () => (
        <span className="d-block">{c.label} <span className="text-muted fw-normal">({c.unidad})</span></span>
      ),
      cell: ({ row }) => (
        <div className="input-group input-group-sm" style={{ maxWidth: 130 }}>
          <input
            type="number"
            min={0}
            step={c.step}
            className="form-control text-end"
            value={row.original[c.key]}
            onChange={(e) => {
              const v = e.target.valueAsNumber
              if (!Number.isNaN(v) && v >= 0) setCampo(row.original.i, c.key, v)
            }}
          />
          <span className="input-group-text">{c.unidad}</span>
        </div>
      ),
    })),
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
    setNuevo({ puesto: '', diasDescansoMax: 1, diasTrabajoMax: 6, horasPartTime: 4, horasFullTime: 8, horaRefrigerio: 1.5 })
    toggleAdd()
  }

  const yaExiste = useMemo(
    () => filas.some((f) => f.puesto.trim().toLowerCase() === nuevo.puesto.trim().toLowerCase()),
    [filas, nuevo.puesto],
  )

  const agregar = () => {
    if (!nuevo.puesto.trim() || yaExiste) return
    aplicar([...filasRef.current, { ...nuevo, puesto: nuevo.puesto.trim() }])
    toggleAdd()
  }

  // ── Exportar / copiar (respeta búsqueda) ──────────────
  const cab = ['Puesto', ...CAMPOS.map((c) => `${c.label} (${c.unidad})`)]
  const fila = (f: ParametroPuesto) => [f.puesto, ...CAMPOS.map((c) => String(f[c.key]))]

  const copiar = () => {
    const tsv = [cab.join('\t'), ...filasFiltradas.map((f) => fila(f).join('\t'))].join('\n')
    try {
      copy(tsv)
      setMsg({ tipo: 'ok', texto: `${filasFiltradas.length} fila(s) copiadas al portapapeles.` })
    } catch {
      setMsg({ tipo: 'err', texto: 'No se pudo copiar (permiso del navegador).' })
    }
  }

  const exportarCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
    const csv = [cab.map(esc).join(','), ...filasFiltradas.map((f) => fila(f).map(esc).join(','))].join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'parametros-puestos.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const maxFull = filas.length ? Math.max(...filas.map((f) => f.horasFullTime)) : 0

  return (
    <div className="content-wrapper">
      <div className="d-flex align-items-end flex-wrap gap-2 mb-4">
        <PageBreadcrumb
          title={'Tabla de Puestos'}
          subTitle1={'Configuración'}
          subText={'Límites de descanso/trabajo por semana y jornada (horas) por puesto'}
        />
      </div>

      {/* ── KPIs ─────────────────────────────────────────────── */}
      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <KpiCard label="Puestos configurados" value={filas.length} accent="var(--primary-600, #4f46e5)" icon="briefcase" sub="en la tabla" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Con 2 descansos" value={filas.filter((f) => f.diasDescansoMax >= 2).length} accent="#0ea5e9" icon="coffee" sub="máx. semanal" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Jornada full máx." value={maxFull} accent="#8b5cf6" icon="clock" sub="horas / día" />
        </Col>
        <Col sm={6} xl={3}>
          <KpiCard label="Parámetros / puesto" value={CAMPOS.length} accent="#10b981" icon="sliders" sub="editables" />
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {msg && <Aviso tipo={msg.tipo} texto={msg.texto} />}

          <div className="alert alert-light border py-2 px-3 mb-3 small text-muted">
            Define por puesto los días máximos de descanso/trabajo por semana y las horas de jornada
            (part time, full time y refrigerio). Son los <strong>valores por defecto</strong> (RN-DESC-02);
            cada empresa o tienda puede sobrescribirlos. Cada cambio se guarda automáticamente como nueva
            versión del parámetro (con vigencia y auditoría).
          </div>

          {/* ── Toolbar ──────────── */}
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

            <div className="ms-auto d-flex flex-wrap align-items-center gap-2">
              <button className="btn btn-outline-secondary" onClick={restaurar} title="Restaurar valores por defecto">
                <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#refresh-cw`}></use></svg>Restaurar
              </button>
              <button className="btn btn-outline-secondary" onClick={copiar} disabled={filasFiltradas.length === 0} title="Copiar al portapapeles">
                <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#copy`}></use></svg>Copiar
              </button>
              <button className="btn btn-outline-success" onClick={exportarCsv} disabled={filasFiltradas.length === 0} title="Descargar CSV (Excel)">
                <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#download`}></use></svg>Excel
              </button>
              <button className="btn btn-outline-primary" onClick={abrirAgregar}>
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
                emptyMessage={filas.length === 0 ? 'Sin puestos. Agrega uno arriba.' : 'Sin resultados para la búsqueda.'}
              />
              <TablePagination table={table} itemsName="puestos" />
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
            <label className="form-label">Puesto <span className="text-danger">*</span></label>
            <input
              type="text"
              className={`form-control ${yaExiste ? 'is-invalid' : ''}`}
              value={nuevo.puesto}
              onChange={(e) => setNuevo((n) => ({ ...n, puesto: e.target.value }))}
              placeholder="Ej. Cajero"
            />
            {yaExiste && <div className="invalid-feedback">Ese puesto ya está en la tabla.</div>}
          </div>
          <Row className="g-3">
            {CAMPOS.map((c) => (
              <Col xs={6} key={c.key}>
                <label className="form-label">{c.label} <span className="text-muted">({c.unidad})</span></label>
                <input
                  type="number"
                  min={0}
                  step={c.step}
                  className="form-control"
                  value={nuevo[c.key]}
                  onChange={(e) => {
                    const v = e.target.valueAsNumber
                    setNuevo((n) => ({ ...n, [c.key]: Number.isNaN(v) ? 0 : v }))
                  }}
                />
              </Col>
            ))}
          </Row>
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-default" onClick={toggleAdd}>Cancelar</button>
          <Button variant="primary" onClick={agregar} disabled={!nuevo.puesto.trim() || yaExiste}>Agregar</Button>
        </ModalFooter>
      </Modal>

      {confirmDialog}
    </div>
  )
}

export default ParametrosPuestos
