import React from 'react'
import { Modal, Button } from 'react-bootstrap'

interface InfoModalProps {
  show: boolean
  title: string
  children: React.ReactNode
  size?: 'sm' | 'lg' | 'xl'
  onClose: () => void
}

const InfoModal: React.FC<InfoModalProps> = ({ show, title, children, size, onClose }) => {
  return (
    <Modal show={show} onHide={onClose} centered size={size}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default InfoModal
