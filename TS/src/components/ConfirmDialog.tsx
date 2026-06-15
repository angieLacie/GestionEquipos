import { type ReactNode, useCallback, useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'react-bootstrap'

type ConfirmOpts = {
  title?: string
  message: ReactNode
  confirmText?: string
  cancelText?: string
  /** Color del botón de confirmar. 'danger' para acciones destructivas. */
  variant?: 'danger' | 'primary' | 'warning'
}

type Pending = { opts: ConfirmOpts; resolve: (ok: boolean) => void }

/**
 * Confirmación reutilizable basada en promesa.
 * Uso:
 *   const { confirm, dialog } = useConfirm()
 *   if (await confirm({ message: '¿Eliminar?', variant: 'danger' })) { ... }
 *   return (<>... {dialog}</>)
 * El modal se monta con z-index alto (1100) para quedar sobre overlays custom.
 */
export function useConfirm() {
  const [pending, setPending] = useState<Pending | null>(null)

  const confirm = useCallback(
    (opts: ConfirmOpts) => new Promise<boolean>((resolve) => setPending({ opts, resolve })),
    [],
  )

  const cerrar = (ok: boolean) => {
    pending?.resolve(ok)
    setPending(null)
  }

  const o = pending?.opts
  const dialog = pending ? (
    <Modal show centered onHide={() => cerrar(false)} backdropClassName="nova-confirm-bd" style={{ zIndex: 1100 }}>
      <ModalHeader>
        <h5 className="modal-title">{o?.title ?? 'Confirmar'}</h5>
        <button type="button" className="btn-close" onClick={() => cerrar(false)} />
      </ModalHeader>
      <ModalBody>{o?.message}</ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-default" onClick={() => cerrar(false)}>
          {o?.cancelText ?? 'Cancelar'}
        </button>
        <Button variant={o?.variant ?? 'primary'} onClick={() => cerrar(true)} autoFocus>
          {o?.confirmText ?? 'Confirmar'}
        </Button>
      </ModalFooter>
    </Modal>
  ) : null

  return { confirm, dialog }
}
