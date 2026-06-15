import { getColor } from '@/utils/getColor.ts'
import BaseVectorMap from '@/components/BaseVectorMap.tsx'
import { currency } from '@/helpers'

const GlobalView = () => {
  const rawGdpData: Record<string, number> = {
    af: 16.63,
    al: 0,
    dz: 158.97,
    ao: 85.81,
    ag: 1.1,
    ar: 351.02,
    am: 8.83,
    au: 1219.72,
    at: 366.26,
    az: 52.17,
    bs: 7.54,
    bh: 21.73,
    bd: 105.4,
    us: 4624.18,
    in: 1430.02,
    cn: 5745.13,
    gb: 2258.57,
    jp: 5390.9,
  }

  const gdpData: Record<string, number> = Object.fromEntries(Object.entries(rawGdpData).map(([k, v]) => [k.toUpperCase(), v]))

  const options = {
    map: 'world_merc',
    backgroundColor: 'transparent',
    zoomButtons: true,
    zoomOnScroll: true,
    showTooltip: true,
    responsive: true,
    regionsSelectable: true,
    regionsSelectableOne: true,
    regionStyle: {
      initial: { fill: '#9c99a130', stroke: getColor('bootstrapVars', 'bodyColor', 'rgba', 0.7), strokeWidth: 0.5, strokeOpacity: 0.8 },
      hover: { fill: getColor('success', 400), stroke: getColor('bootstrapVars', 'bodyColor', 'rgba', 0.8), strokeWidth: 1, cursor: 'pointer' },
      selected: { fill: getColor('success', 300), stroke: getColor('bootstrapVars', 'bodyColor', 'hex'), strokeWidth: 1.5 },
    },
    visualizeData: {
      scale: [getColor('primary', 100), getColor('primary', 700)],
      values: gdpData,
    },
  }

  return (
    <div id="panel-4" className="panel panel-icon">
      <div className="panel-hdr">
        <h2>
          {' '}
          Global{' '}
          <span className="fw-light">
            <i>View</i>
          </span>
        </h2>
      </div>
      <div className="panel-container">
        <div className="panel-content">
          <BaseVectorMap id="gdpMap" options={options} style={{ height: '350px' }} />
        </div>
        <div className="panel-content jvm-bg-ocean">
          <div className="d-flex align-items-center">
            <img
              className="d-inline-block js-jqvmap-flag me-3 border-faded"
              alt="flag"
              src="https://lipis.github.io/flag-icons/flags/4x3/us.svg"
              style={{ width: '55px', height: 'auto' }}
            />
            <div className="h4 d-inline-block fw-300 m-0 opacity-75 fs-lg">
              Monthly Sales Volume:
              <small className="js-jqvmap-country mb-0 fw-500">US - {currency}4,624.18</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlobalView
