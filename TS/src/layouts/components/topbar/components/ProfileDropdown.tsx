import { Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import adminAvatar from '@/assets/img/avatar-admin.png'

import { Link } from 'react-router'

const ProfileDropdown = () => {
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dropdown>
      <DropdownToggle
        as={'a'}
        type="button"
        data-bs-toggle="dropdown"
        title="drlantern@gotbootstrap.com"
        className="btn-system bg-transparent d-flex flex-shrink-0 align-items-center justify-content-center no-arrow"
        aria-label="Open Profile Dropdown">
        <img src={adminAvatar} className="profile-image profile-image-md rounded-circle" alt="Sunny A." />
      </DropdownToggle>

      <DropdownMenu className="dropdown-menu-animated dropdown-menu-end">
        <div className="notification-header rounded-top mb-2">
          <div className="d-flex flex-row align-items-center mt-1 mb-1 color-white">
            <span className="status status-success d-inline-block me-2">
              <img src={adminAvatar} className="profile-image rounded-circle" alt="Sunny A." />
            </span>
            <div className="info-card-text">
              <div className="fs-lg text-truncate text-truncate-lg">Sunny A.</div>
              <span className="text-truncate text-truncate-md opacity-80 fs-sm">sunnya@sadim.com</span>
            </div>
          </div>
        </div>
        <DropdownDivider className="m-0"></DropdownDivider>
        <DropdownItem as={Link} to="">
          <span>Reset Layout</span>
        </DropdownItem>
        <DropdownItem as={Link} to="">
          <span>Settings</span>
        </DropdownItem>
        <DropdownDivider className="m-0"></DropdownDivider>
        <DropdownItem className="dropdown-item d-flex justify-content-between align-items-center" onClick={handleFullscreen}>
          <span>Fullscreen</span>
          <b className="text-muted fs-nano px-2 rounded font-monospace align-self-center border">F11</b>
        </DropdownItem>
        <DropdownItem className="dropdown-item d-flex justify-content-between align-items-center" onClick={handlePrint}>
          <span>Print</span>
          <span className="text-muted fs-nano px-2 rounded font-monospace align-self-center border">
            <svg width="15" height="15">
              <path
                d="M4.505 4.496h2M5.505 5.496v5M8.216 4.496l.055 5.993M10 7.5c.333.333.5.667.5 1v2M12.326 4.5v5.996M8.384 4.496c1.674 0 2.116 0 2.116 1.5s-.442 1.5-2.116 1.5M3.205 9.303c-.09.448-.277 1.21-1.241 1.203C1 10.5.5 9.513.5 8V7c0-1.57.5-2.5 1.464-2.494.964.006 1.134.598 1.24 1.342M12.553 10.5h1.953"
                strokeWidth="1.2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="square"></path>
            </svg>{' '}
            + P
          </span>
        </DropdownItem>
        <div className="dropdown-divider m-0"></div>
        <DropdownItem className="py-3 fw-500 d-flex justify-content-between" as={Link} to="/auth/login">
          <span className="text-danger">Logout</span>
          <span className="d-block text-truncate text-truncate-sm">@sunnyahmed</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default ProfileDropdown
