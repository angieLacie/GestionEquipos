import { Card, Col, Row } from 'react-bootstrap'
import type { StatisticWidgetType } from '@/views/dashboards/subscription/data'

const StatisticWidget = ({ item }: { item: StatisticWidgetType }) => {
  const { title, count, prefix, percentage, changeVariant } = item
  return (
    <Card>
      <Row>
        <Col xs={6}>
          <div className="p-3">
            <p className="p-0 mb-3 text-muted text-truncate">{title}</p>
            <span className="h5 text-nowrap">
              {prefix && prefix} {count}
              <sup className={`text-success ${changeVariant}`}>{percentage}</sup>
            </span>
          </div>
        </Col>
        <Col xs={6}>
          <div className="d-flex h-100 align-items-center justify-content-end pe-3">
            <div className="width-5 height-5 bg-dark bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center">
              <item.icon className="fad fa-check-circle h4 text-primary m-0" />
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  )
}

export default StatisticWidget
