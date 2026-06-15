import ComponentCard from '@/components/ComponentCard.tsx'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import { teamPerformanceChartOptions } from '@/views/dashboards/project-management/data'

const TeamPerformance = () => {
  return (
    <ComponentCard
      title={
        <h2>
          Team{' '}
          <span className="fw-light">
            <i>Performance</i>
          </span>
        </h2>
      }>
      <div className="panel-content">
        <ApexChartClient getOptions={teamPerformanceChartOptions} series={teamPerformanceChartOptions().series} type={'radar'} />
      </div>
    </ComponentCard>
  )
}

export default TeamPerformance
