import { Alert, Col, ProgressBar, Row } from 'react-bootstrap'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import { getSessionScaleChartOptions } from '@/views/dashboards/control-center/data'
import { basePath } from '@/helpers'
import { useToggle } from 'usehooks-ts'

const SessionScale = () => {
  const [showAlert, toggleAlert] = useToggle(true)
  const progressData = [
    { label: 'Current Usage', variant: 'primary', value: 70 },
    { label: 'Net Usage', variant: 'info', value: 30 },
    { label: 'Users blocked', variant: 'warning', value: 40 },
    { label: 'Custom cases', variant: 'danger', value: 15 },
    { label: 'Test logs', variant: 'success', value: 25 },
    { label: 'Uptime records', variant: 'dark', value: 10 },
  ]

  return (
    <div id="panel-6" className="panel panel-icon">
      <div className="panel-hdr">
        <h2>
          {' '}
          Secession{' '}
          <span className="fw-light">
            <i>Scale</i>
          </span>
        </h2>
      </div>
      <div className="panel-container">
        <div className="panel-content p-0 mb-g">
          <Alert
            onClose={toggleAlert}
            show={showAlert}
            className="bg-success bg-opacity-10 fade show border-faded border-start-0 border-end-0 rounded-0 m-0 d-flex align-items-center py-2 fs-sm"
            role="alert">
            <p className="m-0">
              Last update was on <span className="js-get-date">Friday, May 2, 2025</span>- Your logs are all up to date.
            </p>
            <button type="button" className="btn btn-system ms-auto" onClick={toggleAlert}>
              <svg className="sa-icon sa-icon-2x sa-icon-dark">
                <use href={`${basePath}/icons/sprite.svg#x`}></use>
              </svg>
            </button>
          </Alert>
        </div>
        <div className="panel-content">
          <Row className="mb-g">
            <Col md={6}>
              <ApexChartClient getOptions={getSessionScaleChartOptions} series={getSessionScaleChartOptions().series} type={'donut'} />
            </Col>
            <Col md={6} lg={5} className="me-lg-auto">
              {progressData.map((item, index) => (
                <div key={index} className="mb-3">
                  <div className={`d-flex mt-2 mb-1 fs-xs text-${item.variant}`}>{item.label}</div>
                  <ProgressBar now={item.value} variant={item.variant} label={`${item.value}%`} style={{ height: '4px' }} visuallyHidden />
                </div>
              ))}
            </Col>
          </Row>
        </div>
      </div>
    </div>
  )
}

export default SessionScale
