import type { MetricStatsType } from '@/views/dashboards/marketing/data'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import type { ApexOptions } from 'apexcharts'

const MetricWithChart = ({ label, variant, value, data }: MetricStatsType) => {
  const chartOptions = (): ApexOptions => ({
    series: [
      {
        name: 'Series 1',
        data: data,
      },
    ],
    chart: {
      type: 'bar',
      height: 27,
      width: 27,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: '80%',
        borderRadius: 1,
      },
    },
    colors: ['#fff'],
    tooltip: {
      enabled: false,
    },
    xaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: false,
    },
    grid: {
      show: false,
    },
  })

  return (
    <>
      <div className={`p-2 me-2 me-xl-3 me-xxl-3 bg-${variant}-300 rounded`}>
        <ApexChartClient getOptions={chartOptions} series={chartOptions().series} type={'bar'} width={27} />
      </div>
      <div className="d-flex flex-column align-items-start justify-content-center">
        <label className="fs-xs mb-0">{label}</label>
        <h5 className="fw-bold mb-0">{value}</h5>
      </div>
    </>
  )
}

export default MetricWithChart
