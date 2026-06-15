import logoLight from '@/assets/img/logo-light.svg'
import { Link } from 'react-router'

const Header = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top w-100 py-3">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img src={logoLight} alt="logo" />
        </Link>

        <div className="ms-auto d-flex gap-2">
          <Link to="/auth/login" className="btn btn-link text-white border-0 text-decoration-none">
            Login
          </Link>
          <Link to="/auth/register" className="btn btn-link text-white border-0 text-decoration-none">
            Register
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Header
