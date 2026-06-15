import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import { getReturningTargetChartOptions } from '@/views/dashboards/marketing/data'
import type { ApexOptions } from 'apexcharts'
import ComponentCard from '@/components/ComponentCard.tsx'
import { basePath } from '@/helpers'

const ReturningTarget = () => {
  const series = [
    {
      name: 'Returning Customer',
      data: [140, 120, 95, 80, 60, 95, 70, 50],
    },
    {
      name: 'New Customer',
      data: [110, 90, 70, 55, 50, 75, 50, 30],
    },
  ]

  const outerChartOptions = (): ApexOptions => ({
    chart: {
      type: 'radialBar',
      height: 120,
      width: 120,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        track: {
          background: '#eee',
          strokeWidth: '100%',
        },
        dataLabels: {
          show: false,
        },

        hollow: {
          margin: 0,
          size: '50%',
          background: 'transparent',
        },
      },
    },
    fill: {
      type: 'solid',
      colors: ['#a084e8'],
    },
    labels: ['Outer'],
  })

  const innerChartOptions = (): ApexOptions => ({
    chart: {
      height: 80,
      width: 80,
      type: 'radialBar',
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        track: {
          background: '#f3f3f3',
          strokeWidth: '100%',
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: '18px',
            color: '#00d2c6',
            offsetY: 5,
            show: true,
            formatter: () => '78%',
          },
        },
        hollow: {
          margin: 0,
          size: '50%',
          background: 'transparent',
        },
      },
    },
    fill: {
      type: 'solid',
      colors: ['#00d2c6'],
    },

    labels: ['Inner'],
  })

  return (
    <ComponentCard
      title={
        <h2>
          {' '}
          Returning{' '}
          <span className="fw-light">
            <i>Target</i>
          </span>
        </h2>
      }
      toolbox>
      <div className="panel-content position-relative">
        <div className="p-1 position-absolute end-0 top-0 mt-5 me-3 z-1 d-flex align-items-center justify-content-center">
          <div className="border-faded border-top-0 border-start-0 border-bottom-0 py-2 pe-4 me-3 hidden-sm-down">
            <div className="text-end fw-500 l-h-n d-flex flex-column">
              <div className="h5 m-0 d-flex align-items-center justify-content-end">
                $44.34 GE
                <svg className="sa-icon sa-bold sa-icon-success ms-1">
                  <use href={`${basePath}/icons/sprite.svg#trending-up`}></use>
                </svg>
              </div>
              <span className="m-0 fs-xs text-muted">Redux margins and estimates</span>
            </div>
          </div>
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <div style={{ position: 'absolute', top: 0, left: 0 }}>
              <ApexChartClient getOptions={outerChartOptions} series={[35]} type="radialBar" />
            </div>
            <div style={{ position: 'absolute', top: 20, left: 20 }}>
              <ApexChartClient getOptions={innerChartOptions} series={[65]} type="radialBar" />
            </div>
          </div>
          {/*<div*/}
          {/*    className="js-easy-pie-chart position-relative d-inline-flex align-items-center justify-content-center"*/}
          {/*    data-percent="35" data-piesize="95" data-linewidth="10" data-scalelength="5"*/}
          {/*    style="color: var(--primary-300);">*/}
          {/*    <div*/}
          {/*        className="js-easy-pie-chart color-success-400 position-relative position-absolute translate-middle top-50 start-50 d-flex align-items-center justify-content-center"*/}
          {/*        data-percent="65" data-piesize="60" data-linewidth="5"*/}
          {/*        data-scalelength="1" data-scalecolor="#fff"*/}
          {/*        style="color: var(--success-300);">*/}
          {/*        <div*/}
          {/*            className="position-absolute translate-middle top-50 start-50 d-flex align-items-center justify-content-center fw-500 fs-xl">78%*/}
          {/*        </div>*/}
          {/*    </div>*/}
          {/*</div>*/}
        </div>
        <ApexChartClient getOptions={getReturningTargetChartOptions} series={series} type={'area'} />
      </div>
    </ComponentCard>
  )
}

export default ReturningTarget
