import { Fragment, type ReactNode } from 'react'
import { flexRender, type Table as TanTable } from '@tanstack/react-table'
import { basePath } from '@/helpers'

type DataTableProps<TData> = {
  table: TanTable<TData>
  emptyMessage?: ReactNode
  className?: string
}

/**
 * Tabla genérica estilo SmartAdmin sobre @tanstack/react-table.
 * Cabeceras ordenables (clic alterna asc/desc) con flecha del sprite.
 * La paginación se renderiza aparte con <TablePagination>.
 */
function DataTable<TData>({ table, emptyMessage = 'Sin resultados.', className }: DataTableProps<TData>) {
  const colCount = table.getAllLeafColumns().length

  return (
    <div className="table-responsive">
      <table className={`table st-table table-hover align-middle mb-0 ${className ?? ''}`}>
        <thead className="bg-light bg-opacity-25 thead-sm align-middle">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const sorted = header.column.getIsSorted()
                const icon = sorted === 'asc' ? 'chevron-up' : 'chevron-down'
                return (
                  <th
                    key={header.id}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    style={{ cursor: canSort ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap' }}
                  >
                    <span className="d-inline-flex align-items-center gap-1">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <svg className="sa-icon" style={{ width: 13, height: 13, opacity: sorted ? 1 : 0.4 }}>
                          <use href={`${basePath}/icons/sprite.svg#${icon}`}></use>
                        </svg>
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="text-center pt-3 text-muted">
                <div className="st-no-results alert alert-info">
                  <svg className="sa-icon sa-thin sa-icon-2x sa-bold hidden-sm"><use href={`${basePath}/icons/sprite.svg#frown`}></use></svg>
                  <h6 className="mb-0">{emptyMessage}</h6>
                </div>
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <tr>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              </Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
