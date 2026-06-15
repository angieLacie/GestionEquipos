import ComponentCard from '@/components/ComponentCard.tsx'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import { userActivityOptions } from '@/views/dashboards/subscription/data'

const UserActivity = () => {
  const series = [
    {
      name: 'Morning',
      data: [65, 59, 90, 81, 56, 55, 40],
    },
    {
      name: 'Night',
      data: [28, 48, 40, 19, 96, 27, 100],
    },
  ]
  return (
    <ComponentCard
      title={
        <h2>
          {' '}
          User{' '}
          <span className="fw-light">
            <i>Activity</i>
          </span>
        </h2>
      }
      panelLocked>
      <div className="panel-content">
        <ApexChartClient getOptions={userActivityOptions} series={series} type={'radar'} />
      </div>
    </ComponentCard>
  )
}

export default UserActivity
