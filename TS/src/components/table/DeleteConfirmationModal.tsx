import type { ReactNode } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'react-bootstrap'

type DeleteConfirmationModalProps = {
  show: boolean
  onHide: () => void
  onConfirm: () => void
  selectedCount: number
  itemName?: string
  confirmButtonVariant?: string
  cancelButtonVariant?: string
  modalTitle?: string
  confirmButtonText?: string
  cancelButtonText?: string
  children?: ReactNode
}

const DeleteConfirmationModal = ({
  show,
  onHide,
  onConfirm,
  selectedCount,
  itemName = 'row',
  confirmButtonVariant = 'danger',
  cancelButtonVariant = 'light',
  modalTitle = 'Delete record',
  confirmButtonText = 'Yes, delete',
  cancelButtonText = 'No, cancel',
  children,
}: DeleteConfirmationModalProps) => {
  const getConfirmationMessage = () => {
    if (children) return children

    if (selectedCount > 1) {
      return `Are you sure you want to delete these records ${selectedCount} ${itemName}s?`
    }
    return (
      <>
        Are you sure you want to delete record <span className="fw-600 text-danger"> [{itemName}] </span> ?
      </>
    )
  }

  return (
    <Modal show={show} centered onHide={onHide} contentClassName="bg-dark bg-opacity-50 shadow-5 translucent-dark" tabIndex={-1} aria-hidden="true">
      <ModalHeader className="modal-header border-bottom-0" closeButton>
        <ModalTitle as={'h4'} className="text-white d-flex align-items-center">
          {modalTitle}
        </ModalTitle>
      </ModalHeader>
      <ModalBody>
        <div className="alert alert-danger bg-danger border-danger text-light border-opacity-50 bg-opacity-10 mb-0">
          {getConfirmationMessage()}
          <br />
          This action cannot be undone.
        </div>
      </ModalBody>
      <ModalFooter className="border-top-0">
        <Button variant={cancelButtonVariant} type="button" onClick={onHide}>
          {cancelButtonText}
        </Button>
        <Button variant={confirmButtonVariant} type="button" onClick={onConfirm}>
          {confirmButtonText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default DeleteConfirmationModal
