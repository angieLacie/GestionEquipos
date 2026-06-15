import ComponentCard from '@/components/ComponentCard.tsx'
import { Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, FormControl, Row } from 'react-bootstrap'
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { salesPerformanceData, type SalesPerformanceType } from '@/views/dashboards/marketing/data'
import { BsEye, BsEyeSlash } from 'react-icons/bs'
import DataTable from '@/components/table/DataTable.tsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import TablePagination from '@/components/table/TablePagination.tsx'

import { exportCSV, exportJSON, exportXML } from '@/utils/fileExport.ts'
import { basePath } from '@/helpers'

const columnHelper = createColumnHelper<SalesPerformanceType>()

const SalesPerformance = () => {
  const [cvvMap, setCvvMap] = useState<{ [key: string]: boolean }>({})

  const isMounted = useRef(false)
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const safeSetCvvMap = useCallback((updater: (prev: typeof cvvMap) => typeof cvvMap) => {
    if (isMounted.current) {
      setCvvMap(updater)
    }
  }, [])

  const columns = [
    columnHelper.accessor('customerId', {
      header: 'ID',
    }),
    columnHelper.accessor('name', {
      header: 'Full Name',
    }),
    columnHelper.accessor('purchaseDate', {
      header: 'Purchase Date',
    }),
    columnHelper.accessor('customerCvv', {
      header: 'CVV',
      cell: ({ row }) => {
        const id = row.original.customerId
        const isVisible = cvvMap[id] ?? false

        const toggle = () => {
          safeSetCvvMap((prev) => ({
            ...prev,
            [id]: !prev[id],
          }))
        }
        return (
          <div className="d-flex align-items-center">
            <span>{isVisible ? row.original.customerCvv : '***'}</span>
            <button className="btn btn-link btn-sm p-0 ms-2" onClick={toggle}>
              {isVisible ? <BsEyeSlash size={16} /> : <BsEye size={16} />}
            </button>
          </div>
        )
      },
    }),
    columnHelper.accessor('country', {
      header: 'Country',
      cell: ({ row }) => (
        <div className="d-flex align-items-center">
          <img
            src={`https://lipis.github.io/flag-icons/flags/4x3/${row.original.countryCode}.svg`}
            alt="au"
            className="d-inline-block me-1 border-faded"
            width={20}
            height={15}
            style={{ width: '20px', height: 'auto' }}
          />
          <span>{row.original.country}</span>
        </div>
      ),
    }),
    columnHelper.accessor('invoiceAmount', {
      header: 'Invoice Amount',
    }),
    columnHelper.accessor('customerEmail', {
      header: 'Email',
    }),
  ]

  const [data, _setData] = useState<SalesPerformanceType[]>(() => [...salesPerformanceData])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
    <ComponentCard
      title={
        <h2>
          {' '}
          Sales{' '}
          <span className="fw-light">
            <i>Performance</i>
          </span>
        </h2>
      }>
      <div className="panel-content">
        <div className="st-wrapper">
          <Row className="st-toolbar mb-4">
            <Col xs={12} sm={6} lg={6} xl={5} xxl={4} className="order-1 order-sm-0 mt-4 mt-sm-0">
              <div className="st-search-wrapper">
                <div className="input-group flex-nowrap" role="search">
                  <span className="input-group-text px-2" id="search-icon">
                    <svg className="sa-icon sa-bold">
                      <use href={`${basePath}/icons/sprite.svg#search`}></use>
                    </svg>
                  </span>
                  <FormControl
                    type="text"
                    placeholder="Search..."
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    aria-label="Search input"
                    autoComplete="off"
                  />
                </div>
              </div>
            </Col>
            <Col className="d-flex justify-content-end gap-2">
              <button className="btn btn-sm btn-outline-secondary btn-icon h-100 order-1 px-3 fs-xl" type="button" aria-label="Print table">
                <i className="sa sa-printer"></i>
              </button>
              <Dropdown className="btn-group">
                <DropdownToggle as={'a'} className="btn btn-sm btn-outline-primary d-flex align-items-center" type="button">
                  Export
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={() => exportCSV(data)}>CSV</DropdownItem>
                  <DropdownItem onClick={() => exportJSON(data)}>JSON</DropdownItem>
                  <DropdownItem onClick={() => exportXML(data)}>XML</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </Col>
          </Row>
          <DataTable<SalesPerformanceType> table={table} emptyMessage="No records found" />
          <TablePagination
            totalItems={totalItems}
            start={start}
            end={end}
            itemsName="orders"
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
      </div>
    </ComponentCard>
  )
}

export default SalesPerformance
