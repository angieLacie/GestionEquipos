import ComponentCard from '@/components/ComponentCard.tsx'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import { developmentPhasesChartOptions, developmentPhasesSeries } from '@/views/dashboards/project-management/data'
import { useMemo, useState } from 'react'

const DevelopmentPhases = () => {
  const [filter, setFilter] = useState('all')

  const filteredSeries = useMemo(() => {
    if (filter === 'all') return developmentPhasesSeries
    return developmentPhasesSeries.filter((series) => series.name === filter)
  }, [filter])
  return (
    <ComponentCard
      title={
        <h2>
          Development{' '}
          <span className="fw-light">
            <i>Phases</i>
          </span>
        </h2>
      }>
      <div className="panel-content">
        <div className="chart-controls development-phases-filters d-flex justify-content-center gap-1">
          {['all', 'Frontend Team', 'Backend Team', 'QA Team', 'DevOps Team'].map((team) => (
            <button key={team} className="btn btn-xs btn-outline-default" onClick={() => setFilter(team)}>
              {team === 'all' ? 'All Teams' : team.replace(' Team', '')}
            </button>
          ))}
        </div>
        <ApexChartClient getOptions={developmentPhasesChartOptions} series={filteredSeries} type={'rangeBar'} />
      </div>
    </ComponentCard>
  )
}

export default DevelopmentPhases
