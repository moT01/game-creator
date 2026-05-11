import Modal from './Modal'

interface Props {
  onClose: () => void
}

export default function HelpModal({ onClose }: Props) {
  return (
    <Modal title="How to Play" onClose={onClose}>
      <div className="help-section">
        <h3 className="help-heading">Objective</h3>
        <p>Get all 3 of your pieces in a straight line through the center of the board.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">The Board</h3>
        <p>The board is an octagon with 8 outer points and 1 center point. Each point connects to its neighbors on the ring and to the center.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">How to Move</h3>
        <p>On your turn, tap one of your pieces, then tap an adjacent empty point to slide it there. There are no jumps or captures.</p>
        <p>The only winning lines pass through the center. You must control the center point to win.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">Winning and Drawing</h3>
        <p>Win by placing all 3 of your pieces on one of the 4 diameter lines - each runs from an outer point, through the center, to the opposite outer point.</p>
        <p>The game is a draw if the same board position repeats 3 times.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">Strategy</h3>
        <p>The center connects to every other point - whoever holds it controls the board. If your opponent has 2 pieces on a diameter line, block the third point immediately.</p>
      </div>
      <div className="help-modal-footer">
        <button className="btn btn-primary" onClick={onClose}>Got it</button>
      </div>
    </Modal>
  )
}
