import {
  ACCENT_OPTIONS,
  CAPTION_POSITIONS,
  DEFAULT_STATE,
  HEADER_ACCENTS,
  TABLE_SIZES,
  TABLE_STYLES,
  TABLE_THEMES,
} from '@/views/tables/style-generator/data.ts'
import { type ChangeEvent, type Dispatch, Fragment, type SetStateAction, useState } from 'react'
import type { TableState, TableStyle } from '@/types/table.ts'

const TableSettingPanel = ({
  state,
  setState,
  handleChange,
  codeClasses,
}: {
  codeClasses: string
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  state: TableState
  setState: Dispatch<SetStateAction<TableState>>
}) => {
  const [copied, setCopied] = useState(false)
  const [headerClassCopied, setHeaderClassCopied] = useState(false)

  const handleReset = () => {
    setState(DEFAULT_STATE)
    setCopied(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeClasses)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch (e) {
      setCopied(false)
    }
  }

  const handleHeaderClassCopy = async () => {
    try {
      await navigator.clipboard.writeText(state.headerAccent)
      setHeaderClassCopied(true)
      setTimeout(() => setHeaderClassCopied(false), 1200)
    } catch (e) {
      setHeaderClassCopied(false)
    }
  }

  return (
    <div className="content-wrapper-right">
      <div className="right-content bg-faded d-flex flex-column h-100 pt-4">
        <div className="flex-grow-1 p-3">
          <form id="tableStyleForm" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
            <div className="mod-status primary-mod mt-1 pt-4 pb-3" data-prefix="Table Theme">
              <div className="btn-group btn-group-sm w-100" role="group" aria-label="Table theme options">
                {TABLE_THEMES.map((opt) => (
                  <Fragment key={opt.label}>
                    <input
                      type="radio"
                      className="btn-check"
                      name="tableTheme"
                      id={`theme${opt.label}`}
                      value={opt.value}
                      checked={state.tableTheme === opt.value}
                      onChange={handleChange}
                    />
                    <label className="btn btn-outline-secondary" htmlFor={`theme${opt.label}`}>
                      {opt.label}
                    </label>
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="mod-status primary-mod mt-1 pt-4 pb-3" data-prefix="Table Styles">
              <div className="mb-2">
                {TABLE_STYLES.map((opt) => (
                  <div key={opt.value} className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="tableStyle"
                      id={opt.id}
                      value={opt.value}
                      checked={state.tableStyles.includes(opt.value as TableStyle)}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor={opt.id}>
                      {opt.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mod-status primary-mod mt-1 pt-4 pb-3" data-prefix="Size Options">
              <div className="btn-group btn-group-sm w-100" role="group" aria-label="Table size options">
                {TABLE_SIZES.map((opt) => (
                  <Fragment key={opt.label}>
                    <input
                      type="radio"
                      className="btn-check"
                      name="tableSize"
                      id={`size${opt.label}`}
                      value={opt.value}
                      checked={state.tableSize === opt.value}
                      onChange={handleChange}
                    />
                    <label className="btn btn-outline-secondary" htmlFor={`size${opt.label}`}>
                      {opt.label}
                    </label>
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="mod-status primary-mod mt-1 pt-4 pb-3" data-prefix="Table Accent">
              <select className="form-select" id="tableAccent" value={state.tableAccent} onChange={handleChange} disabled={state.tableTheme !== ''}>
                {ACCENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="form-text fs-nano">Table theme must be set default to use this option.</div>
            </div>

            <div className="mod-status primary-mod mt-1 pt-4 pb-3" data-prefix="Header Accent (thead)">
              <select className="form-select" id="headerAccent" value={state.headerAccent} onChange={handleChange}>
                {HEADER_ACCENTS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mod-status primary-mod mt-1 pt-4 pb-3" data-prefix="Caption Position">
              <div className="btn-group btn-group-sm w-100" role="group" aria-label="Caption position options">
                {CAPTION_POSITIONS.map((opt) => (
                  <Fragment key={opt.label}>
                    <input
                      type="radio"
                      className="btn-check"
                      name="captionPosition"
                      id={`caption${opt.label}`}
                      value={opt.value}
                      checked={state.captionPosition === opt.value}
                      onChange={handleChange}
                    />
                    <label className="btn btn-outline-secondary" htmlFor={`caption${opt.label}`}>
                      {opt.label}
                    </label>
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="mod-status primary-mod mt-1 pt-4 pb-3" data-prefix="Row Styling">
              <div className="form-text mb-2">Show example rows with contextual classes</div>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="showRowClasses" checked={state.showRowClasses} onChange={handleChange} />
                <label className="form-check-label" htmlFor="showRowClasses">
                  Show row contextual classes
                </label>
              </div>
            </div>
          </form>

          <div className="mt-4">
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-bold">Table Class:</span>
            </div>
            <code className="d-block p-2 body-bg border rounded" id="generatedClasses">
              {codeClasses}
              <button className="btn btn-xs btn-success ms-auto d-block" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </code>
          </div>
          {state.headerAccent && (
            <div className="mt-4">
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold">Header Class:</span>
              </div>
              <code className="d-block p-2 body-bg border rounded" id="generatedClasses">
                {state.headerAccent}
                <button className="btn btn-xs btn-success ms-auto d-block" onClick={handleHeaderClassCopy}>
                  {headerClassCopied ? 'Copied!' : 'Copy'}
                </button>
              </code>
            </div>
          )}
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="btn btn-primary mt-4 flex-grow-1" id="resetStylesBtn" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TableSettingPanel
