import { useState } from 'react'
import ComponentCard from '@/components/ComponentCard.tsx'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import { teamWorkloadChartOptions } from '@/views/dashboards/project-management/data'

const TeamWorkload = () => {
  const [filter, setFilter] = useState<'week' | 'month'>('week')

  const teamMembers = [
    'Alex Johnson',
    'Sarah Williams',
    'Michael Chen',
    'Olivia Smith',
    'David Rodriguez',
    'Emma Wilson',
    'James Lee',
    'Sophia Martinez',
  ]

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  function generateData(count: number, min: number, max: number) {
    const days = filter === 'week' ? daysOfWeek : daysOfWeek
    return Array.from({ length: count }, (_, i) => ({
      name: teamMembers[i],
      data: days.map((day) => ({
        x: day,
        y: Math.floor(Math.random() * (max - min + 1)) + min,
      })),
    }))
  }

  // 👇 Use your exact logic
  let newData
  if (filter === 'week') {
    newData = generateData(teamMembers.length, 0, 10)
  } else if (filter === 'month') {
    newData = generateData(teamMembers.length, 10, 40)
  }

  const handleFilterChange = (newFilter: 'week' | 'month') => {
    setFilter(newFilter)
  }

  return (
    <ComponentCard
      title={
        <h2>
          Team{' '}
          <span className="fw-light">
            <i>Workload</i>
          </span>
        </h2>
      }
      toolbar={
        <div className="btn-group team-workload-filters">
          <button
            type="button"
            className={`btn waves-effect btn-xs btn-outline-default ${filter === 'week' ? 'active' : ''}`}
            onClick={() => handleFilterChange('week')}>
            Weekly
          </button>
          <button
            type="button"
            className={`btn btn-xs waves-effect btn-outline-default ${filter === 'month' ? 'active' : ''}`}
            onClick={() => handleFilterChange('month')}>
            Monthly
          </button>
        </div>
      }>
      <div className="panel-content">
        <ApexChartClient getOptions={teamWorkloadChartOptions} series={newData} type="heatmap" />
      </div>
    </ComponentCard>
  )
}

export default TeamWorkload
