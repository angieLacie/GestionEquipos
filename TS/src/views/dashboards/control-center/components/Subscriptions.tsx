import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import { getSubscriptionsChartOptions } from '@/views/dashboards/control-center/data'
import ComponentCard from '@/components/ComponentCard.tsx'

const Subscriptions = () => {
  const today = [
    { x: '3am', y: 0 },
    { x: '4am', y: 0 },
    { x: '5am', y: 5000 },
    { x: '6am', y: 7500 },
    { x: '7am', y: 12000 },
    { x: '8am', y: 22500 },
    { x: '9am', y: 27000 },
    { x: '10am', y: 37500 },
    { x: '11am', y: 35000 },
    { x: '12m', y: 37500 },
    { x: '1pm', y: 9500 },
    { x: '2pm', y: 0 },
    { x: '3pm', y: 0 },
    { x: '4pm', y: 0 },
    { x: '5pm', y: 0 },
  ]

  const yesterday = [
    { x: '3am', y: 0 },
    { x: '4am', y: 0 },
    { x: '5am', y: 0 },
    { x: '6am', y: 5500 },
    { x: '7am', y: 15000 },
    { x: '8am', y: 20000 },
    { x: '9am', y: 35000 },
    { x: '10am', y: 30500 },
    { x: '11am', y: 35000 },
    { x: '12m', y: 27500 },
    { x: '1pm', y: 42500 },
    { x: '2pm', y: 32500 },
    { x: '3pm', y: 37500 },
    { x: '4pm', y: 27500 },
    { x: '5pm', y: 17500 },
  ]

  const series = [
    {
      name: 'Today',
      data: today,
    },
    {
      name: 'Yesterday',
      data: yesterday,
    },
  ]
  return (
    <ComponentCard
      title={
        <h2>
          {' '}
          Subscriptions{' '}
          <span className="fw-light">
            <i>Hourly</i>
          </span>
        </h2>
      }>
      <div className="panel-content">
        <ApexChartClient getOptions={getSubscriptionsChartOptions} series={series} height={200} type={'bar'} />
      </div>
    </ComponentCard>
  )
}

export default Subscriptions
