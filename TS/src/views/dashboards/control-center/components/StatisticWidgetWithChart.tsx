import type { StatisticWidgetType } from '@/views/dashboards/control-center/data'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import type { ApexOptions } from 'apexcharts'
import clsx from 'clsx'
import { FaCaretDown, FaCaretUp } from 'react-icons/fa6'

const StatisticWidgetWithChart = ({ item }: { item: StatisticWidgetType }) => {
  const { color, badge2, badge1, lineSeries, title, progress, isPositive } = item
  const chartOptions = (): ApexOptions => ({
    series: [
      {
        name: title,
        data: lineSeries,
      },
    ],
    chart: {
      height: 34,
      type: 'line',
      sparkline: { enabled: true },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 1,
    },
    tooltip: {
      enabled: false,
    },
    colors: [color],
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

  const getCircleProgressOptions = (): ApexOptions => ({
    chart: {
      type: 'radialBar',
      height: 60,
      width: 60,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        hollow: { size: '70%' },
        track: { background: '#f5f5f5', strokeWidth: '100%', margin: 0 },

        dataLabels: {
          name: {
            show: false,
          },
          value: {
            show: true,
            fontSize: '16px',
            fontWeight: 200,
            formatter: (value) => `${value}`,
            color: color,
            offsetY: 4,
          },
        },
      },
    },
    colors: [color],
    stroke: {
      lineCap: 'round',
      width: 5,
    },
    labels: ['Progress'],
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
    <div className="px-3 py-2 d-flex align-items-center">
      <div
        className="js-easy-pie-chart position-relative d-inline-flex align-items-center justify-content-center"
        style={{ color: 'var(--primary-300)' }}
        data-percent="75"
        data-piesize="50"
        data-linewidth="5"
        data-linecap="butt"
        data-scalelength="0">
        <ApexChartClient getOptions={getCircleProgressOptions} series={[progress]} type={'radialBar'} width={50} />
      </div>
      <span className="d-flex ms-2 text-muted align-items-center">
        {' '}
        {title}
        {isPositive ? <FaCaretUp className="ms-1" /> : <FaCaretDown className="text-danger ms-1" />}
      </span>
      <div className="ms-auto d-inline-flex align-items-center">
        <ApexChartClient getOptions={chartOptions} series={chartOptions().series} type={'line'} width={70} />
        <div className="d-inline-flex flex-column small ms-2">
          <span className={clsx('d-inline-block badge  opacity-75 text-center p-1 width-6', badge1.class)}>{badge1.label}</span>
          <span className={clsx('d-inline-block badge  opacity-75 text-center p-1 width-6 mt-1', badge2.class)}>{badge2.label}</span>
        </div>
      </div>
    </div>
  )
}

export default StatisticWidgetWithChart
