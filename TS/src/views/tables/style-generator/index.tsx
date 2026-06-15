import React, { type ChangeEvent, Fragment, useState } from 'react'
import type {
  CaptionPosition,
  ColumnDisplay,
  HeaderAccent,
  TableAccent,
  TableSize,
  TableState,
  TableStyle,
  TableTheme,
  UserRow,
} from '@/types/table.ts'
import { COLUMN_LAYOUTS, DEFAULT_STATE, ROW_EXAMPLES } from '@/views/tables/style-generator/data'
import { Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap'
import TableSettingPanel from '@/views/tables/style-generator/components/TableSettingPanel'
import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'

const ROWS_DEFAULT: UserRow[] = ROW_EXAMPLES.map(({ rowClass, ...rest }) => ({ ...rest }))

function getGeneratedClasses(state: TableState): string {
  const classList: string[] = ['table']
  if (state.tableTheme) classList.push(state.tableTheme)
  if (state.tableSize) classList.push(state.tableSize)
  if (state.tableAccent && !state.tableTheme) classList.push(state.tableAccent)
  if (state.tableStyles.includes('table-striped')) classList.push('table-striped')
  if (state.tableStyles.includes('table-hover')) classList.push('table-hover')
  if (state.tableStyles.includes('table-bordered')) classList.push('table-bordered')
  if (state.tableStyles.includes('table-borderless')) classList.push('table-borderless')
  if (state.tableStyles.includes('table-responsive')) classList.push('table-responsive')
  return classList.join(' ')
}

function buildCodeSnippet(state: TableState): string {
  const tableClasses = getGeneratedClasses(state)
  const captionTag = `<caption${state.captionPosition ? ` class="${state.captionPosition}"` : ''}>List of users and their details</caption>`
  const theadClass = state.headerAccent ? ` class="${state.headerAccent}"` : ''
  return `<table class="${tableClasses}">
    ${captionTag}
    <thead${theadClass}>
        <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <!-- more columns -->
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">1</th>
            <td>John Doe</td>
            <td>john.doe@example.com</td>
            <!-- more cells -->
        </tr>
        <!-- more rows -->
    </tbody>
</table>`
}

const TableStyleGenerator: React.FC = () => {
  const [state, setState] = useState<TableState>(DEFAULT_STATE)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, id, checked } = e.target as any
    if (name === 'tableTheme') {
      setState((prev) => ({
        ...prev,
        tableTheme: value as TableTheme,
        tableAccent: value ? '' : prev.tableAccent,
      }))
    } else if (name === 'tableStyle') {
      setState((prev) => {
        let newStyles = [...prev.tableStyles]
        if (checked) {
          newStyles.push(value as TableStyle)
        } else {
          newStyles = newStyles.filter((v) => v !== value)
        }
        // Borderless and bordered are exclusive
        if (value === 'table-borderless' && checked) {
          newStyles = newStyles.filter((v) => v !== 'table-bordered')
        }
        if (value === 'table-bordered' && checked) {
          newStyles = newStyles.filter((v) => v !== 'table-borderless')
        }
        return { ...prev, tableStyles: newStyles }
      })
    } else if (name === 'tableSize') {
      setState((prev) => ({ ...prev, tableSize: value as TableSize }))
    } else if (id === 'tableAccent') {
      setState((prev) => ({ ...prev, tableAccent: value as TableAccent }))
    } else if (id === 'headerAccent') {
      setState((prev) => ({ ...prev, headerAccent: value as HeaderAccent }))
    } else if (name === 'captionPosition') {
      setState((prev) => ({
        ...prev,
        captionPosition: value as CaptionPosition,
      }))
    } else if (id === 'showRowClasses') {
      setState((prev) => ({ ...prev, showRowClasses: checked }))
    } else if (name === 'columnsDisplay') {
      setState((prev) => ({ ...prev, columnsDisplay: id as ColumnDisplay }))
    }
  }

  const showMoreColumns = state.columnsDisplay === 'expandColumnsBtn'
  const columns = [
    { label: '#', dataKey: 'id' },
    { label: 'Name', dataKey: 'name' },
    { label: 'Email', dataKey: 'email' },
    { label: 'Phone', dataKey: 'phone' },
    ...(showMoreColumns
      ? [
          { label: 'Address', dataKey: 'address' },
          { label: 'City', dataKey: 'city' },
          { label: 'State', dataKey: 'state' },
          { label: 'Country', dataKey: 'country' },
        ]
      : []),
    { label: 'Action', dataKey: 'action' },
  ]
  const captionClass = state.captionPosition ? state.captionPosition : undefined
  const theadAccent = state.headerAccent ? state.headerAccent : undefined
  const rows = state.showRowClasses ? ROW_EXAMPLES : ROWS_DEFAULT
  const codeSnippet = buildCodeSnippet(state)

  return (
    <>
      <div className="content-wrapper">
        <PageBreadcrumb
          title={'Tables Style Generator'}
          subTitle1={'Design'}
          subTitle2={'Tables'}
          subText={'Create custom Bootstrap table styles with live preview.'}
        />
        <div className="main-content">
          <div className="info-container mb-4">
            This tool helps you generate Bootstrap table styles by selecting different styling options. The table updates in real-time as you make
            selections. Copy the generated classes to use in your project.
          </div>
          <Row>
            <Col sm={12}>
              <Card className="shadow-0 mb-g">
                <CardHeader className="d-flex justify-content-between align-items-center">
                  <div className="card-title">Table Preview</div>
                  <div className="btn-group btn-group-sm" role="group" aria-label="Column display options">
                    {COLUMN_LAYOUTS.map((opt) => (
                      <Fragment key={opt.id}>
                        <input
                          type="radio"
                          className="btn-check"
                          name="columnsDisplay"
                          id={opt.id}
                          autoComplete="off"
                          checked={state.columnsDisplay === opt.id}
                          onChange={handleChange}
                        />
                        <label className="btn btn-outline-secondary" htmlFor={opt.id}>
                          {opt.label}
                        </label>
                      </Fragment>
                    ))}
                  </div>
                </CardHeader>
                <CardBody>
                  <div className={state.tableStyles.includes('table-responsive') ? 'table-responsive' : ''}>
                    <table className={getGeneratedClasses(state)}>
                      <caption className={captionClass}>List of users and their details</caption>
                      <thead className={theadAccent}>
                        <tr>
                          {columns.map((col, idx) => (
                            <th scope="col" key={idx}>
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((user) => (
                          <tr key={user.id} className={state.showRowClasses ? user.rowClass : ''}>
                            <th scope="row">{user.id}</th>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            {showMoreColumns && (
                              <>
                                <td className="d-md-table-cell">{user.address}</td>
                                <td className="d-md-table-cell">{user.city}</td>
                                <td className="d-md-table-cell">{user.state}</td>
                                <td className="d-md-table-cell">{user.country}</td>
                              </>
                            )}
                            <td>
                              <a href="#">Edit</a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3">
                    <h6>Configuration Code</h6>
                    <pre className="body-bg p-3 border rounded">
                      <code>{codeSnippet}</code>
                    </pre>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      <TableSettingPanel state={state} setState={setState} handleChange={handleChange} codeClasses={getGeneratedClasses(state)} />
    </>
  )
}

export default TableStyleGenerator
