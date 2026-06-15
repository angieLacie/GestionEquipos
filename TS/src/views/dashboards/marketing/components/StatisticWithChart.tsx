import type { ApexOptions } from 'apexcharts'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import { basePath } from '@/helpers'

const StatisticWithChart = () => {
  const getClickRateChartOptions = (): ApexOptions => ({
    chart: {
      type: 'radialBar',
      height: 60,
      width: 60,
    },
    colors: ['var(--success-300)', '#676a6c'],
    legend: { show: false },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    plotOptions: {
      radialBar: {
        hollow: { margin: 0, size: '45%' },
        track: { margin: 0 },
        dataLabels: { show: false },
      },
    },
  })

  const getBounceRateChartOptions = (): ApexOptions => ({
    chart: {
      type: 'radialBar',
      height: 60,
      width: 60,
    },
    colors: ['var(--danger-500)', '#676a6c'],
    legend: { show: false },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    plotOptions: {
      radialBar: {
        hollow: { margin: 0, size: '45%' },
        track: { margin: 0 },
        dataLabels: { show: false },
      },
    },
  })
  return (
    <div className="ms-auto d-none d-sm-flex align-items-center ">
      <div className="d-flex align-items-center">
        <div className="d-none d-md-inline-flex">
          <ApexChartClient getOptions={getClickRateChartOptions} series={[70]} />
        </div>
        <div className="d-inline-flex flex-column justify-content-center ms-2">
          <span className="fw-500 fs-xs d-block">
            <small>Click Rate</small>
          </span>
          <span className="fw-500 fs-xl d-flex align-items-center text-success">
            {' '}
            70%{' '}
            <svg className="sa-icon sa-bold sa-icon-success ms-1">
              <use href={`${basePath}/icons/sprite.svg#trending-up`}></use>
            </svg>
          </span>
        </div>
      </div>
      <div className="d-flex align-items-center border-faded border-dashed border-top-0 border-bottom-0 border-end-0 ms-3 ps-3">
        <div className="d-none d-md-inline-flex">
          <ApexChartClient getOptions={getBounceRateChartOptions} series={[10]} />
        </div>
        <div className="d-inline-flex flex-column justify-content-center ms-2">
          <span className="fw-500 fs-xs d-block">
            <small>Bounce Rate</small>
          </span>
          <span className="fw-500 fs-xl d-flex align-items-center text-danger">
            {' '}
            10%{' '}
            <svg className="sa-icon sa-bold ms-1 sa-icon-danger">
              <use href={`${basePath}/icons/sprite.svg#trending-down`}></use>
            </svg>
          </span>
        </div>
      </div>
    </div>
  )
}

export default StatisticWithChart
