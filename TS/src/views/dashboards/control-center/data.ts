import type { ApexOptions } from 'apexcharts'
import { getColor } from '@/utils/getColor.ts'

export type StatisticWidgetType = {
  title: string
  color: string
  badge1: { label: string; class: string }
  badge2: { label: string; class: string }
  lineSeries: number[]
  progress: number
  isPositive?: boolean
}

export const getSubscriptionsChartOptions = (): ApexOptions => ({
  chart: {
    height: 200,
    width: '100%',
    type: 'bar',
    toolbar: {
      show: false,
    },
    sparkline: {
      enabled: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '70%',
      borderRadius: 0,
    },
  },
  colors: [getColor('success', 500), getColor('bootstrapVars', 'bodyColor', 'rgba', 0.7)],
  dataLabels: {
    enabled: false,
  },
  grid: {
    show: true,
    borderColor: getColor('bootstrapVars', 'bodyColor', 'rgba', 0.08),
    strokeDashArray: 5,
    position: 'back',
    padding: {
      left: -5,
      right: 0,
      top: -20,
      bottom: -5,
    },
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: false,
      },
    },
  },
  xaxis: {
    type: 'category',
    labels: {
      style: {
        colors: '#8e8da4',
        fontSize: '10px',
      },
      show: true,
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    min: 0,
    max: 50000,
    tickAmount: 4,
    labels: {
      style: {
        colors: '#8e8da4',
        fontSize: '10px',
      },
      formatter: function (value) {
        return '$' + Math.floor(value / 1000) + 'k'
      },
      show: true,
      offsetX: -15,
      align: 'left',
    },
  },
  tooltip: {
    enabled: true,
    followCursor: true,
    theme: 'dark',
    y: {
      formatter: function (value) {
        return '$' + value.toLocaleString()
      },
    },
  },
  legend: {
    show: false,
  },
})

const populationData = [
  { label: 'Current Usage', value: 4119630000, color: getColor('primary', 500) },
  { label: 'Net Usage', value: 590950000, color: getColor('info', 500) },
  { label: 'Users Blocked', value: 1012960000, color: getColor('warning', 500) },
  { label: 'Custom Cases', value: 95100000, color: getColor('danger', 500) },
  { label: 'Test Logs', value: 727080000, color: getColor('success', 500) },
  { label: 'Uptime Records', value: 344120000, color: getColor('bootstrapVars', 'bodyColor', 'rgba', 0.7) },
]

const total = populationData.reduce((sum, item) => sum + item.value, 0)
export const getSessionScaleChartOptions = (): ApexOptions => ({
  series: populationData.map((item) => item.value),
  chart: {
    type: 'donut',
    height: '100%',
    width: '100%',
  },
  colors: populationData.map((item) => item.color),
  plotOptions: {
    pie: {
      donut: {
        size: '50%',
      },
    },
  },
  labels: populationData.map((item) => item.label),
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false,
  },
  tooltip: {
    enabled: false,
    y: {
      formatter: function (value) {
        // Calculate percentage
        const percentage = ((value / total) * 100).toFixed(1)
        // Format the population number with commas
        const population = value.toLocaleString()
        return `${percentage}% (${population})`
      },
    },
  },
  stroke: {
    width: 0,
  },
})

export const getLiveFeedsChartOptions = (): ApexOptions => ({
  chart: {
    type: 'area',
    height: 300,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    animations: {
      enabled: false,
    },
    parentHeightOffset: 0,
    sparkline: {
      enabled: false,
    },
  },
  colors: [getColor('primary', 500)],
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    enabled: true,
    followCursor: true,
  },
  stroke: {
    curve: 'straight',
    width: 1.5,
    colors: [getColor('primary', 500)],
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [0, 95, 100],
      colorStops: [
        {
          offset: 0,
          color: getColor('primary', 500),
          opacity: 0.4,
        },
        {
          offset: 100,
          color: getColor('primary', 500),
          opacity: 0.1,
        },
      ],
    },
  },
  grid: {
    show: true,
    borderColor: getColor('bootstrapVars', 'bodyColor', 'rgba', 0.08),
    strokeDashArray: 5,
    position: 'back',
    padding: {
      left: -5,
      right: 0,
      top: -20,
      bottom: -5,
    },
    xaxis: {
      lines: {
        show: false,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  xaxis: {
    type: 'numeric',
    tickAmount: 10,
    labels: {
      style: {
        colors: getColor('bootstrapVars', 'bodyColor', 'rgba', 0.5),
        fontSize: '10px',
      },
      show: true,
      offsetX: 10,
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    min: 0,
    max: 100,
    tickAmount: 5,
    show: true,
    labels: {
      style: {
        colors: getColor('bootstrapVars', 'bodyColor', 'rgba', 0.5),
        fontSize: '10px',
      },
      formatter: function (value) {
        return value.toString()
      },
      show: true,
      offsetX: -15,
      align: 'left',
    },
  },
  legend: {
    show: false,
  },
})

export const statisticsData: StatisticWidgetType[] = [
  {
    title: 'SERVER LOAD',
    progress: 75,
    color: 'var(--primary-500)',
    lineSeries: [5, 6, 5, 3, 8, 6, 9, 7, 4, 2],
    badge1: { label: '97%', class: 'bg-success' },
    badge2: { label: '44%', class: 'bg-fusion-300' },
    isPositive: true,
  },
  {
    title: 'DISK SPACE',
    progress: 79,
    color: 'var(--success-500)',
    lineSeries: [5, 9, 7, 3, 5, 2, 5, 3, 9, 6],
    badge1: { label: '76%', class: 'bg-info' },
    badge2: { label: '3%', class: 'bg-warning-300' },
  },
  {
    title: 'DATA TTF',
    progress: 23,
    color: 'var(--info-500)',
    lineSeries: [3, 5, 2, 5, 3, 9, 6, 5, 9, 7],
    badge1: { label: '10GB', class: 'bg-fusion-500' },
    badge2: { label: '10%', class: 'bg-fusion-300' },
    isPositive: true,
  },
  {
    title: 'TEMP.',
    progress: 36,
    color: 'var(--danger-500)',
    lineSeries: [5, 3, 9, 6, 5, 9, 7, 3, 5, 2],
    badge1: { label: '124', class: 'bg-danger' },
    badge2: { label: '40F', class: 'bg-info text-light' },
    isPositive: true,
  },
]
