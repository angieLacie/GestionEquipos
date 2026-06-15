import { Card, CardBody } from 'react-bootstrap'
import type { StatisticCardType } from '@/views/dashboards/marketing/data'
import { basePath } from '@/helpers'

const StatisticCard = ({ item }: { item: StatisticCardType }) => {
  const { change, count, totalChange, suffix, subtitle, title, prefix, variant } = item
  return (
    <Card className="mb-g">
      <CardBody>
        <h6 className="text-muted text-uppercase mt-0">{title}</h6>
        <h2 className={`text-${variant || ''}`}>
          {' '}
          {prefix || ''}
          {count} {suffix || ''}
        </h2>
        <div className="d-flex align-items-center gap-2">
          {change && <span className="badge bg-primary">{change} </span>}
          <span className="text-muted">{subtitle}</span>
          {totalChange && (
            <div className="ms-auto d-flex gap-2 align-items-center">
              <svg className="sa-icon sa-bold sa-icon-success ms-1">
                <use href={`${basePath}/icons/sprite.svg#trending-up`}></use>
              </svg>
              {totalChange}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

export default StatisticCard
