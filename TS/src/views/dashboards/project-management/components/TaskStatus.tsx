import ComponentCard from '@/components/ComponentCard.tsx'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import { taskStatusChartOptions } from '@/views/dashboards/project-management/data'

const TaskStatus = () => {
  return (
    <ComponentCard
      title={
        <h2>
          Task{' '}
          <span className="fw-light">
            <i>Status</i>
          </span>
        </h2>
      }>
      <div className="panel-content">
        <ApexChartClient getOptions={taskStatusChartOptions} series={[35, 20, 15, 30]} type={'donut'} />
      </div>
    </ComponentCard>
  )
}

export default TaskStatus
