import type { Table as TanTable } from '@tanstack/react-table'

type TablePaginationProps<TData> = {
  table: TanTable<TData>
  itemsName?: string
  pageSizes?: number[]
}

/**
 * Barra de paginación para una instancia de @tanstack/react-table.
 * Muestra rango "x–y de N", navegación y selector de tamaño de página.
 */
function TablePagination<TData>({ table, itemsName = 'registros', pageSizes = [10, 15, 25, 50, 100] }: TablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const total = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()
  const start = total === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min(start + pageSize - 1, total)

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-3">
      <div className="d-flex align-items-center gap-1">
        <button className="btn btn-sm btn-outline-secondary px-2 py-1" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} title="Primera página">«</button>
        <button className="btn btn-sm btn-outline-secondary px-2 py-1" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>‹</button>
        <span className="small text-muted text-nowrap px-2">{start}–{end} de {total} {itemsName}</span>
        <button className="btn btn-sm btn-outline-secondary px-2 py-1" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>›</button>
        <button className="btn btn-sm btn-outline-secondary px-2 py-1" onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()} title="Última página">»</button>
      </div>
      <select className="form-select form-select-sm w-auto" value={pageSize} onChange={(e) => table.setPageSize(Number(e.target.value))}>
        {pageSizes.map((s) => <option key={s} value={s}>{s} por pág.</option>)}
      </select>
    </div>
  )
}

export default TablePagination
