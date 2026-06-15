import type { ApexOptions } from 'apexcharts'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useLayoutContext } from '@/context/useLayoutContext'
import Loader from '@/components/Loader'
import { getColor } from '@/utils/getColor'
import merge from 'lodash.merge'
import { initializeColorMap } from '@/utils/colorInit'

import ReactApexChart from 'react-apexcharts'

type PropsType = {
  type?: ApexChart['type']
  height?: number | string
  width?: number | string
  getOptions: () => ApexOptions
  series: ApexOptions['series']
  className?: string
}

const ApexChartClient = ({ type = 'line', height, width = '100%', getOptions, series, className }: PropsType) => {
  const [isReady, setIsReady] = useState(false)
  const { theme, selectedTheme } = useLayoutContext()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const check = () => {
      if (window.colorMap?.bootstrapVars?.bodyColor) {
        setIsReady(true)
      }
    }
    check()
    const interval = setInterval(check, 0)
    return () => clearInterval(interval)
  }, [])

  initializeColorMap()

  const getDefaultChartOptions = (): Partial<ApexOptions> => {
    return {
      chart: {
        fontFamily: 'inherit',
      },
      title: {
        style: {
          color: getColor('bootstrapVars', 'bodyColor', 'hex'),
        },
      },
      subtitle: {
        style: {
          color: getColor('bootstrapVars', 'bodyColor', 'rgba', 0.5),
        },
      },
      grid: {
        borderColor: getColor('bootstrapVars', 'bodyColor', 'rgba', 0.2),
      },
      xaxis: {
        labels: {
          style: {
            colors: getColor('bootstrapVars', 'bodyColor', 'hex'),
          },
        },
        title: {
          style: {
            color: getColor('bootstrapVars', 'bodyColor', 'hex'),
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: getColor('bootstrapVars', 'bodyColor', 'hex'),
          },
        },
        title: {
          style: {
            color: getColor('bootstrapVars', 'bodyColor', 'hex'),
          },
        },
      },
      tooltip: {
        theme: 'dark',
      },
      legend: {
        labels: {
          colors: getColor('bootstrapVars', 'bodyColor', 'hex'),
        },
      },
    }
  }

  const memoGetOptions = useCallback(getOptions, [theme, selectedTheme])
  const memoDefaultOptions = useCallback(getDefaultChartOptions, [theme, selectedTheme])

  const options = useMemo(() => {
    return merge({}, memoDefaultOptions(), memoGetOptions())
  }, [memoGetOptions, theme, selectedTheme])

  return (
    <Suspense fallback={<Loader />}>
      {isReady && options ? (
        <ReactApexChart
          type={options.chart?.type || type}
          height={options.chart?.height || height}
          width={options.chart?.width || width}
          options={options}
          series={series}
          className={className}
        />
      ) : (
        <Loader />
      )}
    </Suspense>
  )
}

export default ApexChartClient
