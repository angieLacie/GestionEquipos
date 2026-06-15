import ComponentCard from '@/components/ComponentCard.tsx'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import { getLiveFeedsChartOptions } from '@/views/dashboards/marketing/data'

const LiveFeeds = () => {
  const series = [
    {
      name: 'Target Profit',
      type: 'column',
      data: [150, 650, 200, 650, 800, 1050, 350, 750, 500, 250, 650, 250, 350, 350],
    },
    {
      name: 'Actual Profit',
      type: 'line',
      data: [50, 70, 90, 80, 300, 950, 800, 700, 650, 30, 100, 80, 30, 30],
    },
    {
      name: 'User Signups',
      type: 'line',
      data: [650, 430, 800, 350, 450, 450, 450, 470, 250, 830, 650, 250, 350, 350],
    },
  ]

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
      <div className="panel-content">
        <ApexChartClient getOptions={getLiveFeedsChartOptions} series={series} />
      </div>
    </ComponentCard>
  )
}

export default LiveFeeds
