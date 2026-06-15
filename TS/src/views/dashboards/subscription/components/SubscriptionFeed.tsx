import ComponentCard from '@/components/ComponentCard.tsx'
import { Col, ProgressBar, Row } from 'react-bootstrap'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import { getSubscriptionChartOptions } from '@/views/dashboards/subscription/data'

type Metric = {
  label: string
  value: number
  variant?: string
}

const SubscriptionFeed = () => {
  const metrics: Metric[] = [
    { label: 'Conversion Rate', value: 65 },
    { label: 'Completion Rate', value: 50 },
    { label: 'Retention Rate', value: 75 },
    { label: 'Engagement Rate', value: 84 },
    { label: 'Marketing Budget', value: 97, variant: 'danger' },
  ]

  return (
    <ComponentCard
      title={
        <h2>
          {' '}
          Subscription{' '}
          <span className="fw-light">
            <i>Feed</i>
          </span>
        </h2>
      }
      panelLocked
      containerClass="border-faded border-start-0 border-end-0 border-bottom-0">
      <div className=" panel-content p-0">
        <Row className="row-grid g-0">
          <Col sm={4} className="p-3" style={{ background: 'var(--app-nav-item-active-bg)' }}>
            {metrics.map((metric) => (
              <div key={metric.label} className="mb-4">
                <div className="d-flex mt-3">
                  <span className="h6 m-0 fw-light">{metric.label}</span>
                  <span className="h6 ms-auto">{metric.value}%</span>
                </div>
                <ProgressBar
                  now={metric.value}
                  striped
                  variant={metric.variant || 'primary'}
                  aria-label={`${metric.value}%`}
                  aria-valuenow={metric.value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            ))}
          </Col>
          <Col sm={8} className="p-3 bg-subtlelight-fade">
            <ApexChartClient getOptions={getSubscriptionChartOptions} series={getSubscriptionChartOptions().series} />
          </Col>
        </Row>
      </div>
    </ComponentCard>
  )
}

export default SubscriptionFeed
