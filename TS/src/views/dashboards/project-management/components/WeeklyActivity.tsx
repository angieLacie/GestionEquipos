import ComponentCard from '@/components/ComponentCard.tsx'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import { weeklyActivityChartOptions } from '@/views/dashboards/project-management/data'

const WeeklyActivity = () => {
  const series = [
    {
      name: 'Completed Tasks',
      data: [18, 25, 20, 30, 22, 5, 2],
    },
    {
      name: 'New Tasks',
      data: [12, 15, 30, 20, 25, 8, 0],
    },
  ]
  return (
    <ComponentCard
      title={
        <h2>
          Weekly{' '}
          <span className="fw-light">
            <i>Activity</i>
          </span>
        </h2>
      }>
      <div className="panel-content">
        <ApexChartClient getOptions={weeklyActivityChartOptions} series={series} type={'bar'} />
      </div>
    </ComponentCard>
  )
}

export default WeeklyActivity
