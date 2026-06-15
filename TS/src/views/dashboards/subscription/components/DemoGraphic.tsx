import ComponentCard from '@/components/ComponentCard.tsx'
import ApexChartClient from '@/components/client-wrappers/ApexChartClient.tsx'
import {demoGraphicChartOptions} from '@/views/dashboards/subscription/data'

const DemoGraphic = () => {
    return (
        <ComponentCard
            title={
                <h2>
                    {' '}
                    Demographic{' '}
                    <span className="fw-light">
            <i>Marketing</i>
          </span>
                </h2>
            }>
            <div className="panel-content">
                <ApexChartClient getOptions={demoGraphicChartOptions} series={[25, 30, 15, 10, 20]} type={'pie'}/>
            </div>
        </ComponentCard>
    )
}

export default DemoGraphic
