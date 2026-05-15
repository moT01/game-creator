import Modal from './Modal'

interface Props {
  onClose: () => void
}

export default function HelpModal({ onClose }: Props) {
  return (
    <Modal title="How to Play" onClose={onClose}>
      <div className="help-section">
        <h3 className="help-heading">Objective</h3>
        <p>Reduce your opponent to 2 or fewer pieces. Do this by forming rows of exactly 3 pieces to capture one opponent piece per turn.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">Phase 1 - Placement</h3>
        <p>Take turns placing one piece on any empty square. You cannot place a piece that would form a row of 3. Place all 12 pieces before movement begins.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">Phase 2 - Movement</h3>
        <p>Move one piece one square in any direction (up, down, left, or right). If your move creates an unbroken row of exactly 3 of your pieces, remove one opponent piece. A row of 4 does not count.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">Strategy tips</h3>
        <p>During placement, build clusters one move away from forming rows. Block opponent clusters. A broken row can be reformed later for another capture.</p>
      </div>
      <div className="help-modal-footer">
        <button className="btn btn-primary" onClick={onClose}>Got it</button>
      </div>
    </Modal>
  )
}
