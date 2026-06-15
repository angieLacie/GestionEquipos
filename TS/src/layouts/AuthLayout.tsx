import BackgroundAnimation from '@/components/BackgroundAnimation'
import { Outlet } from 'react-router'

const AuthLayout = () => {
  return (
    <>
      <section className="hero-section position-relative overflow-hidden">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Outlet />
        </div>
        <BackgroundAnimation />
      </section>
    </>
  )
}

export default AuthLayout
