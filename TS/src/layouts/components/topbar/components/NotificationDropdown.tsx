import { useMemo, useState } from 'react'
import { Dropdown, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { Link } from 'react-router'
import { notifications as notificationData, type NotificationType } from '@/layouts/components/topbar/data'
import clsx from 'clsx'
import { basePath } from '@/helpers'

import SimplebarClient from '@/components/client-wrappers/SimplebarClient'

const NotificationDropdown = () => {
  const [items, setItems] = useState<NotificationType[]>(notificationData)

  const noLeidas = useMemo(() => items.filter((n) => n.unread).length, [items])

  const removeNotification = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const marcarTodas = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  return (
    <Dropdown className="align-self-stretch d-flex align-items-stretch">
      <DropdownToggle
        as={'a'}
        type="button"
        className="btn btn-system no-arrow d-inline-flex align-items-center justify-content-center h-100"
        style={{ lineHeight: 1 }}
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="Abrir notificaciones">
        <span className="position-relative d-inline-flex">
          {noLeidas > 0 && (
            <span
              className="badge rounded-pill bg-danger position-absolute"
              style={{ top: -6, right: -8, fontSize: '0.625rem', lineHeight: 1, padding: '0.2em 0.4em' }}>
              {noLeidas}
            </span>
          )}
          <svg className="sa-icon sa-icon-2x">
            <use href={`${basePath}/icons/sprite.svg#bell`}></use>
          </svg>
        </span>
      </DropdownToggle>

      <DropdownMenu className="dropdown-menu-animated dropdown-xl dropdown-menu-end p-0 shadow-lg border-0">
        <div className="notification-header rounded-top">
          <h4 className="m-0">
            {noLeidas} nuevas <small className="mb-0 opacity-80">Notificaciones</small>
          </h4>
        </div>

        <SimplebarClient className="tab-notification">
          <ul className="notification">
            {items.map((item, idx) => (
              <li key={idx} className={clsx('alert alert-dismissable', { unread: item.unread })}>
                <Link to={item.to ?? ''} className="d-flex align-items-center text-reset">
                  <span
                    className={clsx(
                      'd-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0 me-3',
                      `bg-${item.variant}-100 text-${item.variant}`,
                    )}
                    style={{ width: 44, height: 44 }}>
                    <svg className="sa-icon sa-icon-lg">
                      <use href={`${basePath}/icons/sprite.svg#${item.icon}`}></use>
                    </svg>
                  </span>
                  <span className="d-flex flex-column flex-1">
                    <span className="name">{item.name}</span>
                    <span className="msg-a fs-sm">{item.description}</span>
                    <span className="fs-nano text-muted mt-1">{item.time}</span>
                  </span>
                </Link>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="alert"
                  onClick={() => removeNotification(idx)}
                  aria-label="Descartar"></button>
              </li>
            ))}
          </ul>

          <div className="notification-empty-msg">
            <svg className="sa-icon sa-icon-5x sa-icon-primary">
              <use href={`${basePath}/icons/sprite.svg#check-circle`}></use>
            </svg>
            <span>Sin notificaciones pendientes</span>
          </div>
        </SimplebarClient>

        <div className="py-2 px-3 d-flex align-items-center justify-content-between rounded-bottom border-top">
          {noLeidas > 0 ? (
            <button type="button" className="btn btn-link p-0 fs-xs fw-500 text-decoration-none" onClick={marcarTodas}>
              Marcar todas como leídas
            </button>
          ) : (
            <span />
          )}
          <Link to="" className="fs-xs fw-500">
            Ver todas las notificaciones
          </Link>
        </div>
      </DropdownMenu>
    </Dropdown>
  )
}

export default NotificationDropdown
