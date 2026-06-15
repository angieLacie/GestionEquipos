import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import { Col, Row } from 'react-bootstrap'
import ProjectStatisticWidget from '@/views/dashboards/project-management/components/ProjectStatisticWidget'
import { projectStatisticsData } from '@/views/dashboards/project-management/data'
import DevelopmentPhases from '@/views/dashboards/project-management/components/DevelopmentPhases'
import ProjectProgress from '@/views/dashboards/project-management/components/ProjectProgress'
import TaskStatus from '@/views/dashboards/project-management/components/TaskStatus'
import TeamPerformance from '@/views/dashboards/project-management/components/TeamPerformance'
import WeeklyActivity from '@/views/dashboards/project-management/components/WeeklyActivity'
import TeamWorkload from '@/views/dashboards/project-management/components/TeamWorkload'
import ProjectTimeline from '@/views/dashboards/project-management/components/ProjectTimeline'
import { basePath } from '@/helpers'

const page = () => {
  return (
    <div className="content-wrapper">
      <div className="d-flex align-items-end mb-4">
        <PageBreadcrumb title={'Project Management'} subTitle1={'Insights'} subTitle2={'Dashboards'} />
        <div className="ms-auto d-none d-sm-flex align-items-center">
          <div className="d-flex align-items-center">
            <div className="d-inline-flex flex-column justify-content-center me-2">
              <span className="fw-500 fs-xs d-block">
                <small>COMPLETION RATE</small>
              </span>
              <span className="fw-500 fs-xl d-flex align-items-center text-success">
                {' '}
                80%{' '}
                <svg className="sa-icon sa-bold sa-icon-success ms-1">
                  <use href={`${basePath}/icons/sprite.svg#trending-up`}></use>
                </svg>
              </span>
            </div>
          </div>
          <div className="d-flex align-items-center border-faded border-dashed border-top-0 border-bottom-0 border-end-0 ms-3 ps-3">
            <div className="d-inline-flex flex-column justify-content-center me-2">
              <span className="fw-500 fs-xs d-block">
                <small>TASKS DUE TODAY</small>
              </span>
              <span className="fw-500 fs-xl d-flex align-items-center text-danger">
                {' '}
                12{' '}
                <svg className="sa-icon sa-bold ms-1 sa-icon-danger">
                  <use href={`${basePath}/icons/sprite.svg#alert-circle`}></use>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <Row className="sortable-off">
          {projectStatisticsData.map((item, idx) => (
            <Col md={6} lg={3} xl={3} key={idx}>
              <ProjectStatisticWidget item={item} />
            </Col>
          ))}
        </Row>

        <Row>
          <Col xl={12}>
            <DevelopmentPhases />
          </Col>

          <Col xl={8}>
            <ProjectProgress />
          </Col>
          <Col xl={4}>
            <TaskStatus />
          </Col>
        </Row>

        <Row>
          <Col xl={4}>
            <TeamPerformance />
          </Col>
          <Col xl={8}>
            <WeeklyActivity />
          </Col>
        </Row>

        <Row>
          <Col xl={6}>
            <TeamWorkload />
          </Col>

          <Col xl={6}>
            <ProjectTimeline />
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default page
