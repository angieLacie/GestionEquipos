import ComponentCard from '@/components/ComponentCard.tsx'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import { dataStreamChartOptions } from '@/views/dashboards/subscription/data'

const DataStream = () => {
  const series = [
    {
      name: 'Positive',
      data: [0, 25, 70, 85, 25, 0, 60],
    },
    {
      name: 'Negative',
      data: [-45, -50, -30, -25, -60, -120, 0],
    },
  ]
  return (
    <ComponentCard
      title={
        <h2>
          {' '}
          Data{' '}
          <span className="fw-light">
            <i>Stream</i>
          </span>
        </h2>
      }>
      <div className="panel-content">
        <ApexChartClient getOptions={dataStreamChartOptions} series={series} type={'bar'} />
      </div>
    </ComponentCard>
  )
}

export default DataStream
