import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import { Card, CardBody, Row } from 'react-bootstrap'

import { systemIcons } from './data.ts'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { useLayoutContext } from '@/context/useLayoutContext.tsx'
import { getColor } from '@/utils/getColor.ts'
import { basePath } from '@/helpers'

const SystemIcons = () => {
  const { theme } = useLayoutContext()
  const [search, setSearch] = useState('')
  const [weight, setWeight] = useState('sa-thin')
  const [noFill, setNoFill] = useState(false)

  const filteredIcons = useMemo(() => {
    return systemIcons.filter((icon) => icon.toLowerCase().includes(search.toLowerCase()))
  }, [search, systemIcons])

  const handleCopy = (icon: string, weight: string, noFill: boolean) => {
    const classAttr = `sa-icon ${weight} ${noFill ? ' sa-nofill' : ''}`
    const svg = `<svg className="${classAttr}"><use href={\`\${basePath}/icons/sprite.svg#${icon}\`}></use></svg>`

    navigator.clipboard.writeText(svg).then(() => {
      toast.success(
        <div className="d-flex align-items-center gap-2 smart-icon-copied">
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={classAttr}
            style={{ height: 60, width: 60, stroke: getColor('primary', 500), fill: 'rgb(172 203 211 / 30%)' }}>
            <use href={`${basePath}/icons/sprite.svg#${icon}`} />
          </svg>
          <span className="fw-bold ms-2">
            <span className="disabled">'#{icon}'</span> ✔ copied
          </span>
        </div>,
        {
          icon: false,
          autoClose: 1500,
          hideProgressBar: true,
          theme: theme,
        },
      )
    })
  }

  return (
    <div className="content-wrapper">
      <PageBreadcrumb
        title={'System Icons'}
        subTitle1={'Icons'}
        subTitle2={'Design'}
        subText={'Fully customizable system icons with a variety of weights, colors, and styles.'}
      />

      <div className="main-content">
        <Card>
          <CardBody style={{ minHeight: 'calc(100vh - 340px)' }}>
            <div className="input-group mb-3">
              <input
                type="text"
                id="searchIcons"
                className="form-control form-control-lg"
                placeholder="Search icons..."
                autoComplete="off"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                id="iconSetSelect"
                className="form-select pe-2 ps-3"
                style={{ maxWidth: '110px' }}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}>
                <option value="sa-thin">Thin</option>
                <option value="sa-regular">Normal</option>
                <option value="sa-medium">Medium</option>
                <option value="sa-bold">Bold</option>
              </select>

              <div className="input-group-text px-3">
                <input
                  type="checkbox"
                  id="fillIcons"
                  className="form-check-input mt-0"
                  checked={noFill}
                  onChange={(e) => setNoFill(e.target.checked)}
                />
                <label htmlFor="fillIcons" className="form-check-label ps-2">
                  No Fill
                </label>
              </div>
            </div>

            <Row className="mb-3">
              <div className="search-history col-sm-6 d-flex flex-wrap gap-2"></div>
              <p className="results-count text-muted mb-0 col-sm-6 text-sm-end">
                Showing {filteredIcons.length} of {systemIcons.length} icons
              </p>
            </Row>

            <ul className="list-unstyled row g-4">
              {filteredIcons.map((icon, idx) => (
                <li
                  className="col-4 col-sm-3 col-md-3 col-lg-2 col-xl-2 col-xxl-1 d-flex justify-content-center align-items-center mb-g"
                  key={idx}
                  data-icon-name={icon}>
                  <a
                    onClick={(e) => {
                      e.preventDefault()
                      handleCopy(icon, weight, noFill)
                    }}
                    className="js-showcase-icon rounded color-fusion-300 p-0 m-0 d-flex flex-column w-100 shadow-hover-2 has-svg cursor-pointer">
                    <div className="icon-preview rounded-top w-100 position-relative">
                      <div className="icon-container rounded-top d-flex align-items-center justify-content-center w-100 pt-3 pb-3 pe-2 ps-2 position-absolute">
                        <svg className={`sa-icon ${weight} ${noFill ? 'sa-nofill' : ''}`} style={{ height: 40, width: 40 }}>
                          <use href={`${basePath}/icons/sprite.svg#${icon}`}></use>
                        </svg>
                      </div>
                    </div>
                    <div className="rounded-bottom p-1 w-100 d-flex justify-content-center align-items-center text-center mt-auto">
                      <span className="nav-link-text small text-muted text-truncate">{icon}</span>
                    </div>
                  </a>
                </li>
              ))}
              {filteredIcons.length === 0 && (
                <div className="no-results-msg pt-3">
                  <h5 className="mb-4">No icons found. Try searching with different keywords</h5>
                </div>
              )}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default SystemIcons
