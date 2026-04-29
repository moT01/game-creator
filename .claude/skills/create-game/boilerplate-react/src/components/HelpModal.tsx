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
    </Modal>
  )
}
