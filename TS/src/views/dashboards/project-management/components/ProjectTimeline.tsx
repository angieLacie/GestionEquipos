import { useState } from 'react'
import ComponentCard from '@/components/ComponentCard.tsx'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import { projectTimelineChartOptions } from '@/views/dashboards/project-management/data'

const ProjectTimeline = () => {
  const [view, setView] = useState<'tasks' | 'phases'>('tasks')

  const seriesTasks = [
    {
      name: 'Frontend',
      data: [
        { x: 'Design', y: [new Date('2023-03-05').getTime(), new Date('2023-03-15').getTime()] },
        { x: 'Testing', y: [new Date('2023-03-25').getTime(), new Date('2023-04-05').getTime()] },
        { x: 'Integration Testing', y: [new Date('2023-04-05').getTime(), new Date('2023-04-20').getTime()] },
      ],
    },
    {
      name: 'Backend',
      data: [
        { x: 'Development', y: [new Date('2023-03-10').getTime(), new Date('2023-03-30').getTime()] },
        { x: 'API Design', y: [new Date('2023-03-08').getTime(), new Date('2023-03-20').getTime()] },
        { x: 'Implementation', y: [new Date('2023-03-20').getTime(), new Date('2023-04-05').getTime()] },
      ],
    },
    {
      name: 'Database',
      data: [
        { x: 'Schema Design', y: [new Date('2023-03-10').getTime(), new Date('2023-03-25').getTime()] },
        { x: 'Data Migration', y: [new Date('2023-03-25').getTime(), new Date('2023-04-10').getTime()] },
        { x: 'Performance Testing', y: [new Date('2023-04-10').getTime(), new Date('2023-04-25').getTime()] },
      ],
    },
  ]

  const seriesPhases = [
    {
      name: 'Project Phases',
      data: [
        {
          x: 'Research',
          y: [new Date('2023-03-01').getTime(), new Date('2023-03-05').getTime()],
          fillColor: '#4FC3F7',
        },
        {
          x: 'Design',
          y: [new Date('2023-03-06').getTime(), new Date('2023-03-10').getTime()],
          fillColor: '#4DB6AC',
        },
        {
          x: 'Development',
          y: [new Date('2023-03-11').getTime(), new Date('2023-03-25').getTime()],
          fillColor: '#FFB74D',
        },
        {
          x: 'Testing',
          y: [new Date('2023-03-26').getTime(), new Date('2023-04-10').getTime()],
          fillColor: '#F06292',
        },
        {
          x: 'Deployment',
          y: [new Date('2023-04-11').getTime(), new Date('2023-04-25').getTime()],
          fillColor: '#9575CD',
        },
      ],
    },
  ]

  const series = view === 'tasks' ? seriesTasks : seriesPhases

  return (
    <ComponentCard
      title={
        <h2>
          Project{' '}
          <span className="fw-light">
            <i>Timeline</i>
          </span>
        </h2>
      }
      toolbar={
        <div className="btn-group project-timeline-filters">
          <button
            type="button"
            className={`btn waves-effect btn-xs btn-outline-default ${view === 'tasks' ? 'active' : ''}`}
            onClick={() => setView('tasks')}
            data-timeline-view="tasks">
            Tasks
          </button>
          <button
            type="button"
            className={`btn btn-xs waves-effect btn-outline-default ${view === 'phases' ? 'active' : ''}`}
            onClick={() => setView('phases')}
            data-timeline-view="phases">
            Project Phases
          </button>
        </div>
      }>
      <div className="panel-content">
        <ApexChartClient getOptions={projectTimelineChartOptions} series={series} type="rangeBar" />
      </div>
    </ComponentCard>
  )
}

export default ProjectTimeline
