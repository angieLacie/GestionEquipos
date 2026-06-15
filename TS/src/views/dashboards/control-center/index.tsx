import React from 'react'
import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import { Col, Row } from 'react-bootstrap'
import LiveFeeds from '@/views/dashboards/control-center/components/LiveFeeds'
import GroupChat from '@/views/dashboards/control-center/components/GroupChat'
import GlobalView from '@/views/dashboards/control-center/components/GlobalView'
import Subscriptions from '@/views/dashboards/control-center/components/Subscriptions'
import SessionScale from '@/views/dashboards/control-center/components/SessionScale'
import Calendar from '@/views/dashboards/control-center/components/Calendar'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import type { ApexOptions } from 'apexcharts'

const ControlCenterDashboard: React.FC = () => {
  const apexChartOptions = (): ApexOptions => ({
    series: [
      {
        name: 'Series 1',
        data: [3, 4, 3, 6, 7, 3, 3, 6, 2, 6, 4],
      },
    ],
    chart: {
      type: 'bar',
      height: 40,
      width: 100,
      sparkline: {
        enabled: true,
      },
    },
    colors: ['var(--primary-500)'],
    plotOptions: {
      bar: {
        columnWidth: '85%',
      },
    },
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
  const profitChartOptions = (): ApexOptions => ({
    series: [
      {
        name: 'Series 1',
        data: [1, 4, 3, 6, 5, 3, 9, 6, 5, 9, 7],
      },
    ],
    chart: {
      type: 'bar',
      height: 40,
      width: 100,
      sparkline: {
        enabled: true,
      },
    },
    colors: ['var(--danger-500)'],
    plotOptions: {
      bar: {
        columnWidth: '85%',
      },
    },
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
    <div className="content-wrapper">
      <div className="d-flex align-items-end mb-5">
        <PageBreadcrumb title={'Control Center'} subTitle1={'Insights'} subTitle2={'Dashboards\n'} />

        <div className="ms-auto d-none d-sm-flex align-items-center ">
          <div className="d-flex align-items-center">
            <div className="d-inline-flex flex-column justify-content-center me-2">
              <span className="fw-500 fs-xs d-block">
                <small>EXPENSES</small>
              </span>
              <span className="fw-500 fs-xl d-block text-primary"> $47,000 </span>
            </div>
            <div className="d-none d-md-inline-flex">
              <ApexChartClient getOptions={apexChartOptions} series={apexChartOptions().series} type={'bar'} width={85} />
            </div>
          </div>
          <div className="d-flex align-items-center border border-top-0 border-bottom-0 border-end-0 ms-3 ps-3">
            <div className="d-inline-flex flex-column justify-content-center me-2">
              <span className="fw-500 fs-xs d-block">
                <small>PROFIT</small>
              </span>
              <span className="fw-500 fs-xl d-block text-danger"> $38,500 </span>
            </div>
            <div className="d-none d-md-inline-flex">
              <ApexChartClient getOptions={profitChartOptions} series={profitChartOptions().series} type={'bar'} width={85} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Row>
          <Col xl={12}>
            <LiveFeeds />
          </Col>

          <Col xl={6}>
            <GroupChat />
            <Calendar />
          </Col>

          <Col xl={6}>
            <GlobalView />
            <Subscriptions />
            <SessionScale />
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default ControlCenterDashboard
