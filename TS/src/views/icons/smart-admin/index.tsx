import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import { Card, CardBody, Row } from 'react-bootstrap'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { useLayoutContext } from '@/context/useLayoutContext.tsx'
import { smartAdminIcons, smartAdminBaseIcons } from '@/views/icons/smart-admin/data'

const SmartAdminIcons = () => {
  const { theme } = useLayoutContext()
  const [search, setSearch] = useState('')
  const [iconSet, setIconSet] = useState<'smart-admin' | 'sa-base'>('smart-admin')

  const currentIconList = iconSet === 'smart-admin' ? smartAdminIcons : smartAdminBaseIcons
  const filteredIcons = useMemo(() => {
    return currentIconList.filter((icon) => icon.toLowerCase().includes(search.toLowerCase()))
  }, [search, currentIconList])

  const handleCopy = (icon: string) => {
    const classAttribute = `sa sa-${icon}`

    navigator.clipboard.writeText(classAttribute).then(() => {
      toast.success(
        <div className="d-flex align-items-center gap-2">
          <i className={clsx('display-1 m-0 me-2 text-primary', classAttribute)} />
          <span className="fw-bold">
            <span className="disabled">'{icon}'</span> ✔ copied
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
        title={'SmartAdmin Icons'}
        subTitle1={'Design'}
        subTitle2={'Iconography'}
        subText={'An extreamly lightweight icon set, to meet your basic needs.'}
      />

      <div className="main-content">
        <Card>
          <CardBody style={{ minHeight: 'calc(100vh - 340px)' }}>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Search icons..."
                autoComplete="off"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="form-select pe-2 ps-3"
                style={{ maxWidth: '140px' }}
                value={iconSet}
                onChange={(e) => setIconSet(e.target.value as 'smart-admin' | 'sa-base')}>
                <option value="smart-admin">Smart Admin</option>
                <option value="sa-base">Base</option>
              </select>
              <span className="input-group-text px-3">
                <i className="sa sa-magnifier"></i>
              </span>
            </div>

            <Row className="mb-3">
              <div className="col-sm-6 d-flex flex-wrap gap-2"></div>
              <p className="results-count text-muted mb-0 col-sm-6 text-sm-end">
                Showing {filteredIcons.length} of {currentIconList.length} icons
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
                      handleCopy(icon)
                    }}
                    className="js-showcase-icon rounded color-fusion-300 p-0 m-0 d-flex flex-column w-100 shadow-hover-2 has-svg cursor-pointer">
                    <div className="icon-preview rounded-top w-100 position-relative">
                      <div className="icon-container rounded-top d-flex align-items-center justify-content-center w-100 pt-3 pb-3 pe-2 ps-2 position-absolute">
                        <i className={`sa sa-${icon}`}></i>
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

export default SmartAdminIcons
