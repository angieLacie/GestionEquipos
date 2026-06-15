import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import { Col, Row } from 'react-bootstrap'
import { useState } from 'react'
import { createColumnHelper, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { users, type UserType } from '@/views/tanstack-tables/data'
import DataTable from '@/components/table/DataTable.tsx'
import { basePath, currency } from '@/helpers'
import { toPascalCase } from '@/helpers/casing.ts'
import TablePagination from '@/components/table/TablePagination.tsx'

const columnHelper = createColumnHelper<UserType>()
const TableWithSearch = () => {
  const columns = [
    columnHelper.accessor('id', {
      header: 'ID',
      enableSorting: false,
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      enableSorting: false,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      enableSorting: false,
    }),
    columnHelper.accessor('phone', {
      header: 'Phone',
      enableSorting: false,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => (
        <span className={`badge bg-${row.original.status === 'disable' ? 'danger' : row.original.status === 'pending' ? 'warning' : 'success'}`}>
          {toPascalCase(row.original.status)}
        </span>
      ),
    }),
    columnHelper.accessor('amount', {
      header: 'Due',
      enableSorting: false,
      cell: ({ row }) => (
        <>
          {currency}
          {row.original.amount}
        </>
      ),
    }),
  ]

  const [data, _setData] = useState<UserType[]>(() => [...users])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, pagination },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
    enableColumnFilters: true,
    enableRowSelection: true,
  })

  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const totalItems = table.getFilteredRowModel().rows.length

  const start = pageIndex * pageSize + 1
  const end = Math.min(start + pageSize - 1, totalItems)

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title={'TanStack Table with Search'}
        subTitle1={'Data Visualization'}
        subTitle2={'Tanstack Table'}
        subText={'Loading the table with minimal settings & static data.'}
      />
      <div className="main-content">
        <Row>
          <Col lg={12}>
            <div className="st-wrapper">
              <div className="st-toolbar row mb-4">
                <Col xs={12} sm={6} lg={6} xl={5} xxl={4} className="order-1 order-sm-0 mt-4 mt-sm-0">
                  <div className="st-search-wrapper">
                    <div className="input-group flex-nowrap" role="search">
                      <span className="input-group-text px-2">
                        <svg className="sa-icon sa-bold">
                          <use href={`${basePath}/icons/sprite.svg#search`}></use>
                        </svg>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search..."
                        aria-label="Search input"
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        aria-describedby="search-icon"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </Col>
                <div className="col d-flex justify-content-end gap-2"></div>
              </div>
              <DataTable<UserType> table={table} emptyMessage="No records found" />
              <TablePagination
                totalItems={totalItems}
                start={start}
                end={end}
                itemsName="entries"
                showInfo
                previousPage={table.previousPage}
                canPreviousPage={table.getCanPreviousPage()}
                pageCount={table.getPageCount()}
                pageIndex={table.getState().pagination.pageIndex}
                setPageIndex={table.setPageIndex}
                nextPage={table.nextPage}
                canNextPage={table.getCanNextPage()}
                pageSize={table.getState().pagination.pageSize}
                onPageSizeChange={table.setPageSize}
                showPageLimit
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default TableWithSearch
