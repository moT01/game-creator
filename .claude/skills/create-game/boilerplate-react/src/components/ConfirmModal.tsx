import Modal from './Modal'

interface Props {
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal title="Are you sure?" onClose={onCancel}>
      <p className="confirm-message">{message}</p>
      <div className="confirm-actions">
        <button className="btn btn--primary" onClick={onConfirm}>{confirmLabel}</button>
        <button className="btn btn--secondary" onClick={onCancel}>{cancelLabel}</button>
      </div>
    </Modal>
  )
}
