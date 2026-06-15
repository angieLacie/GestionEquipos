import { Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { useNavigate } from 'react-router'
import { basePath } from '@/helpers'
import { useAuth } from '@/lib/auth'

const ProfileDropdown = () => {
  const navigate = useNavigate()
  const usuario = useAuth((s) => s.usuario)
  const roles = useAuth((s) => s.roles)
  const logout = useAuth((s) => s.logout)

  const nombre = usuario?.nombreUsuario ?? 'Usuario'
  const iniciales = nombre.slice(0, 2).toUpperCase()

  const handleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen()
    else document.exitFullscreen()
  }

  const handleLogout = () => {
    logout()
    navigate('/auth/login', { replace: true })
  }

  return (
    <Dropdown className="align-self-stretch d-flex align-items-stretch">
      <DropdownToggle
        as={'a'}
        type="button"
        data-bs-toggle="dropdown"
        title={nombre}
        className="btn-system bg-transparent d-flex flex-shrink-0 align-items-center justify-content-center no-arrow h-100"
        aria-label="Abrir menú de perfil">
        <span
          className="profile-image profile-image-md rounded-circle d-inline-flex align-items-center justify-content-center bg-primary text-white fw-600"
          style={{ width: 38, height: 38, fontSize: '0.85rem' }}>
          {iniciales}
        </span>
      </DropdownToggle>

      <DropdownMenu className="dropdown-menu-animated dropdown-menu-end shadow-lg border-0">
        <div className="notification-header rounded-top mb-2">
          <div className="d-flex flex-row align-items-center mt-1 mb-1 color-white">
            <span
              className="status status-success d-inline-flex align-items-center justify-content-center rounded-circle me-2 bg-white bg-opacity-25 text-white fw-600"
              style={{ width: 44, height: 44 }}>
              {iniciales}
            </span>
            <div className="info-card-text">
              <div className="fs-lg text-truncate text-truncate-lg">{nombre}</div>
              <span className="text-truncate text-truncate-md opacity-80 fs-sm">
                {roles.length ? roles.join(', ') : 'Sin rol asignado'}
              </span>
            </div>
          </div>
        </div>

        <DropdownDivider className="m-0" />

        <DropdownItem className="py-2 fw-500 d-flex align-items-center gap-2 text-danger" onClick={handleLogout}>
          <svg className="sa-icon">
            <use href={`${basePath}/icons/sprite.svg#log-out`}></use>
          </svg>
          <span>Cerrar sesión</span>
        </DropdownItem>

        <DropdownDivider className="m-0" />

        <DropdownItem className="d-flex align-items-center gap-2" onClick={handleFullscreen}>
          <svg className="sa-icon">
            <use href={`${basePath}/icons/sprite.svg#maximize`}></use>
          </svg>
          <span>Pantalla completa</span>
          <b className="text-muted fs-nano px-2 rounded font-monospace ms-auto border">F11</b>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default ProfileDropdown
