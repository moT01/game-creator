import type { ReactNode } from 'react'
import Modal from './Modal'

interface Props {
  onClose: () => void
  children: ReactNode
}

export default function HelpModal({ onClose, children }: Props) {
  return (
    <Modal title="How to Play" onClose={onClose}>
      {children}
      <div className="help-modal-footer">
        <button className="btn btn-primary" onClick={onClose}>Got it</button>
      </div>
    </Modal>
  )
}
