import ComponentCard from '@/components/ComponentCard.tsx'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import { getLiveFeedsChartOptions, statisticsData } from '@/views/dashboards/control-center/data'
import { useEffect, useRef, useState } from 'react'
import { Col, ProgressBar, Row } from 'react-bootstrap'
import StatisticWidgetWithChart from '@/views/dashboards/control-center/components/StatisticWidgetWithChart'

const generateData = (count: number) => {
  const data = []
  let value = 50 // Start from middle
  for (let i = 0; i < count; i++) {
    // Create more natural movements with smaller changes
    const change = (Math.random() - 0.5) * 8 // Smaller random changes
    value = Math.min(Math.max(value + change, 10), 90) // Keep within bounds
    data.push(Math.round(value))
  }
  return data
}

const LiveFeeds = () => {
  const [series, setSeries] = useState([
    {
      name: 'Activity',
      data: generateData(180),
    },
  ])
  const [live, setLive] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (live) {
      intervalRef.current = setInterval(() => {
        setSeries((prevSeries) => {
          const currentData = prevSeries[0].data
          const lastValue = currentData[currentData.length - 1]
          const change = (Math.random() - 0.5) * 8
          const newValue = Math.round(Math.min(Math.max(lastValue + change, 10), 90))
          const newData = [...currentData.slice(1), newValue]
          return [{ name: 'Activity', data: newData }]
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [live])
  return (
    <ComponentCard
      title={
        <h2>
          {' '}
          Live{' '}
          <span className="fw-light">
            <i>Feeds</i>
          </span>
        </h2>
      }
      panelLocked>
      <div className="panel-content border-faded border-end-0 border-start-0 border-top-0 pt-0">
        <Row className="g-0">
          <Col lg={7} xl={8}>
            <div className="form-check form-switch position-absolute z-1" style={{ top: '1.5rem', left: '3.5rem' }}>
              <input className="form-check-input" type="checkbox" id="liveUpdateCheck" checked={live} onChange={(e) => setLive(e.target.checked)} />
              <label className="form-check-label" htmlFor="liveUpdateCheck">
                Live Update
              </label>
            </div>
            <ApexChartClient getOptions={getLiveFeedsChartOptions} series={series} type={'area'} />
          </Col>
          <Col lg={5} xl={4} className="ps-lg-3">
            <div className="d-flex mt-2">
              My Tasks
              <span className="d-inline-block ms-auto">130 / 500</span>
            </div>
            <ProgressBar now={65} variant="fusion-400" className="progress-sm mb-4" />

            <div className="d-flex">
              Transferred
              <span className="d-inline-block ms-auto">440 TB</span>
            </div>
            <ProgressBar now={34} variant="success" className="progress-sm mb-4" />

            <div className="d-flex">
              Resolved Issues
              <span className="d-inline-block ms-auto">77%</span>
            </div>
            <ProgressBar now={77} variant="info" className="progress-sm mb-4" />

            <div className="d-flex">
              Testing Progress
              <span className="d-inline-block ms-auto">7 days</span>
            </div>
            <ProgressBar now={84} variant="primary" className="progress-sm mb-4" />
            <Row className="no-gutters">
              <Col xs={6} className="pe-1">
                <a href="#" className="btn btn-default btn-block waves-effect waves-themed">
                  Generate PDF
                </a>
              </Col>
              <Col xs={6} className="ps-1">
                <a href="#" className="btn btn-default btn-block waves-effect waves-themed">
                  Report a Bug
                </a>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
      <div className="panel-content p-0">
        <Row className="row-grid g-0">
          {statisticsData.map((item, idx) => (
            <Col sm={12} md={6} lg={6} xl={6} xxl={3} key={idx}>
              <StatisticWidgetWithChart item={item} />
            </Col>
          ))}
        </Row>
      </div>
    </ComponentCard>
  )
}

export default LiveFeeds
