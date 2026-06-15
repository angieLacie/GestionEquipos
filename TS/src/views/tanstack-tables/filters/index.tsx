import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import { Col, Row } from 'react-bootstrap'
import { useState } from 'react'
import { createColumnHelper, type FilterFn, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table'
import { users, type UserType } from '@/views/tanstack-tables/data'
import DataTable from '@/components/table/DataTable.tsx'
import { basePath, currency } from '@/helpers'
import { toPascalCase } from '@/helpers/casing.ts'
import TablePagination from '@/components/table/TablePagination.tsx'

const dueAmountRangeFilterFn: FilterFn<any> = (row, columnId, value) => {
  const price = row.getValue<number>(columnId)
  if (!value) return true

  if (value === '400+') return price >= 500

  const [min, max] = value.split('-').map(Number)
  return price >= min && price <= max
}

const columnHelper = createColumnHelper<UserType>()
const TableWithFilters = () => {
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
      filterFn: dueAmountRangeFilterFn,
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
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
    enableColumnFilters: true,
    enableRowSelection: true,
    filterFns: {
      priceRange: dueAmountRangeFilterFn,
    },
  })

  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const totalItems = table.getFilteredRowModel().rows.length

  const start = pageIndex * pageSize + 1
  const end = Math.min(start + pageSize - 1, totalItems)

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title={'TanStack Table with Filters'}
        subTitle1={'Data Visualization'}
        subTitle2={'Tanstack Table'}
        subText={'Loading the table with minimal settings & static data.'}
      />
      <div className="main-content">
        <Row>
          <Col lg={12}>
            <div className="st-wrapper">
              <div className="st-toolbar row mb-4">
                <Col xs={12} sm={6} lg={6} xl={5} xxl={4} className=" mt-4 mt-sm-0">
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
                <div className="col-sm-3 col-lg-2  ms-auto d-flex justify-content-end gap-2">
                  <select
                    className="form-select form-control my-1 my-md-0"
                    value={(table.getColumn('status')?.getFilterValue() as string) ?? 'All'}
                    onChange={(e) => table.getColumn('status')?.setFilterValue(e.target.value === 'All' ? undefined : e.target.value)}>
                    <option value="All">Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="disable">Disable</option>
                  </select>
                </div>
                <div className="col-sm-3 col-lg-2  d-flex justify-content-end gap-2">
                  <select
                    className="form-select form-control my-1 my-md-0"
                    value={(table.getColumn('amount')?.getFilterValue() as string) ?? ''}
                    onChange={(e) => table.getColumn('amount')?.setFilterValue(e.target.value || undefined)}>
                    <option value="">Price Range</option>
                    <option value="0-50">$0 - $50</option>
                    <option value="51-150">$51 - $150</option>
                    <option value="151-400">$151 - $400</option>
                    <option value="400+">$400+</option>
                  </select>
                </div>
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

export default TableWithFilters
