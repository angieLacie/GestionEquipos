import type { ChildrenType } from '@/types'
import { ToastContainer } from 'react-toastify'
import { LayoutProvider } from '@/context/useLayoutContext'
import WavesInitializer from '@/components/client-wrappers/WaveClient.tsx'

const AppWrapper = ({ children }: ChildrenType) => {
  return (
    <LayoutProvider>
      <WavesInitializer />
      {children}
      <ToastContainer theme="colored" />
    </LayoutProvider>
  )
}

export default AppWrapper
