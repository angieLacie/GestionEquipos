import ComponentCard from '@/components/ComponentCard.tsx'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import { projectProgressChartOptions } from '@/views/dashboards/project-management/data'

const ProjectProgress = () => {
  return (
    <ComponentCard
      title={
        <h2>
          Project{' '}
          <span className="fw-light">
            <i>Progress</i>
          </span>
        </h2>
      }
      panelLocked>
      <div className="panel-content">
        <ApexChartClient getOptions={projectProgressChartOptions} series={projectProgressChartOptions().series} />
      </div>
    </ComponentCard>
  )
}

export default ProjectProgress
