import ComponentCard from '@/components/ComponentCard.tsx'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import { getEfficiencyMetricsChartOptions, metricStatistics } from '@/views/dashboards/marketing/data'
import { Col, Row } from 'react-bootstrap'
import MetricWithChart from '@/views/dashboards/marketing/components/MatricWithChart'

const EfficiencyMetrics = () => {
  const series = [
    {
      name: 'Sessions',
      data: [20000, 25000, 40000, 50000, 60000, 150000, 190000, 180000, 200000, 100000, 100000, 90000],
    },
    {
      name: 'New Sessions',
      data: [15000, 30000, 35000, 60000, 80000, 110000, 230000, 200000, 180000, 230000, 160000, 100000],
    },
    {
      name: 'Bounce Rate',
      data: [10000, 15000, 20000, 25000, 30000, 40000, 60000, 80000, 100000, 120000, 140000, 160000],
    },
    {
      name: 'Clickthrough',
      data: [5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 60000, 70000, 80000, 90000],
    },
  ]
  return (
    <ComponentCard
      title={
        <h2>
          {' '}
          Efficiency{' '}
          <span className="fw-light">
            <i>Metrics</i>
          </span>
        </h2>
      }
      isRefreshable>
      <div className="panel-content">
        <div className="p-3">
          <Row>
            {metricStatistics.map((item, idx) => (
              <Col xs={6} xl={6} xxl={3} className="d-sm-flex align-items-center mb-3" key={idx}>
                <MetricWithChart data={item.data} variant={item.variant} label={item.label} value={item.value} />
              </Col>
            ))}
          </Row>
        </div>
        <ApexChartClient getOptions={getEfficiencyMetricsChartOptions} series={series} type={'area'} />
      </div>
    </ComponentCard>
  )
}

export default EfficiencyMetrics
