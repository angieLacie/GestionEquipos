import BackgroundAnimation from '@/components/BackgroundAnimation'
import { Outlet, useLocation } from 'react-router'

const AuthLayout = () => {
  // El login es una pantalla completa (overlay fixed) que tapa el fondo:
  // no renderizamos la animación WebGL ahí para no consumir GPU/CPU en vano.
  const esLogin = useLocation().pathname === '/auth/login'

  return (
    <>
      <section className="hero-section position-relative overflow-hidden">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Outlet />
        </div>
        {!esLogin && <BackgroundAnimation />}
      </section>
    </>
  )
}

export default AuthLayout
