import { Suspense, useEffect, useState } from 'react'
import Footer from '@/layouts/components/Footer'
import SettingsDrawer from '@/layouts/components/SettingsDrawer'
import Sidenav from '@/layouts/components/sidenav'
import Topbar from '@/layouts/components/topbar'
import Loader from '@/components/Loader'
import { Outlet } from 'react-router'

const MainLayout = () => {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return <Loader height="100vh" />

  return (
    <div className="app-wrap">
      <Topbar />
      <Sidenav />
      <main className="app-body">
        <div className="app-content">
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </div>
        <Footer />
      </main>

      <SettingsDrawer />
    </div>
  )
}

export default MainLayout
