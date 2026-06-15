import type { ChildrenType } from '@/types'
import clsx from 'clsx'
import { type ReactNode, useState } from 'react'
import { useToggle } from 'usehooks-ts'
import { Collapse, Modal, ModalBody, ModalFooter, ModalHeader, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { basePath } from '@/helpers'

type componentCardProps = {
  panelLocked?: boolean
  title: ReactNode
  containerClass?: string
  toolbar?: ReactNode
  toolbox?: boolean
  isRefreshable?: boolean
} & ChildrenType

const ComponentCard = ({ children, panelLocked, title, containerClass, toolbar, toolbox, isRefreshable }: componentCardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [showModal, modalToggle] = useToggle(false)
  const [fullShow, fullToggle] = useToggle(false)
  const [isRefreshing, refreshToggle] = useToggle(false)
  const handleClose = () => {
    setIsVisible(false)
  }
  const handleToggle = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleRefresh = () => {
    refreshToggle()
    setTimeout(() => {
      refreshToggle()
    }, 2000)
  }

  if (!isVisible) return null
  return (
    <div
      id="panel-2"
      className={clsx(`panel panel-icon ${fullShow && 'panel-fullscreen'} `, { 'panel-locked': panelLocked }, { 'panel-refreshing': isRefreshing })}>
      <div className="panel-hdr">
        {title}

        {isRefreshable && (
          <div className="panel-toolbar">
            <button
              type="button"
              className="btn btn-xs btn-outline-default waves-effect waves-themed"
              data-action="panel-refresh"
              data-refresh-duration="2000"
              data-refresh-callback="loadRandomGraph"
              onClick={handleRefresh}>
              Refresh
            </button>
          </div>
        )}

        {toolbox && (
          <div className="panel-toolbar">
            <OverlayTrigger overlay={<Tooltip>Toggle</Tooltip>}>
              <button type="button" onClick={handleToggle} className="btn btn-panel" data-action="panel-collapse">
                <svg className="sa-icon">
                  {isCollapsed ? (
                    <use className="panel-expand-icon d-block" href={`${basePath}/icons/sprite.svg#plus-circle`} />
                  ) : (
                    <use className="panel-collapsed-icon" href={`${basePath}/icons/sprite.svg#minus-circle`} />
                  )}
                </svg>
              </button>
            </OverlayTrigger>

            <OverlayTrigger overlay={<Tooltip>Fullscreen</Tooltip>}>
              <button type="button" onClick={fullToggle} className="btn btn-panel" data-action="panel-fullscreen">
                <svg className="sa-icon">
                  <use href={`${basePath}/icons/sprite.svg#stop-circle`} />
                </svg>
              </button>
            </OverlayTrigger>
            <OverlayTrigger overlay={<Tooltip>Close</Tooltip>}>
              <button type="button" onClick={modalToggle} className="btn btn-panel" data-action="panel-close">
                <svg className="sa-icon">
                  <use href={`${basePath}/icons/sprite.svg#x-circle`} />
                </svg>
              </button>
            </OverlayTrigger>
          </div>
        )}
        {toolbar && <div className="panel-toolbar">{toolbar}</div>}
      </div>
      <Collapse in={!isCollapsed}>
        <div className={clsx('panel-container', containerClass)}>{children}</div>
      </Collapse>

      <Modal
        show={showModal}
        contentClassName={'bg-dark bg-opacity-50 shadow-5 translucent-dark'}
        centered
        onHide={modalToggle}
        className="bg-dark bg-opacity-50 shadow-5 translucent-dark"
        id="panelDeleteModal"
        tabIndex={-1}
        aria-hidden="true">
        <ModalHeader className="border-bottom-0">
          <h4 className="modal-title text-white d-flex align-items-center">Delete Panel?</h4>
          <button type="button" className="btn btn-system btn-system-light ms-auto" data-bs-dismiss="modal" aria-label="Close">
            <svg className="sa-icon sa-icon-2x">
              <use href={`${basePath}/icons/sprite.svg#x`} />
            </svg>
          </button>
        </ModalHeader>
        <ModalBody>
          <div className="alert alert-danger bg-danger border-danger text-white border-opacity-50 bg-opacity-10 mb-0">
            Are you sure you want to delete this panel?
          </div>
        </ModalBody>
        <ModalFooter className="border-top-0">
          <button type="button" onClick={modalToggle} className="btn btn-light" data-bs-dismiss="modal">
            No, cancel
          </button>
          <button type="button" onClick={handleClose} className="btn btn-danger" id="confirmPanelDelete">
            Yes, delete
          </button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default ComponentCard
