import { Link } from 'react-router'
import { useLayoutContext } from '@/context/useLayoutContext'

const AppLogo = () => {
  const { navMinified } = useLayoutContext()
  return (
    <Link to="/rol" className="app-logo app-logo-text flex-shrink-0">
      <span className="app-logo-name">{navMinified ? 'GE' : 'Gestión de Equipos'}</span>
    </Link>
  )
}

export default AppLogo
