import Modal from './Modal'

interface Props {
  onClose: () => void
}

export default function HelpModal({ onClose }: Props) {
  return (
    <Modal title="How to Play" onClose={onClose}>
      <div className="help-section">
        <h3 className="help-heading">Objective</h3>
        <p>Get all 3 of your pieces in a row — horizontally, vertically, or diagonally.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">The Board</h3>
        <p>The board has 9 points in a 3x3 grid, connected by rows, columns, and two corner-to-corner diagonals. There are 8 ways to win.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">Placement Phase</h3>
        <p>Players take turns placing one piece on any empty point until all 6 pieces are on the board. You can win during this phase if your third placement completes a row.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">Movement Phase</h3>
        <p>Once all pieces are placed, players take turns sliding one piece along a board line to an adjacent empty point.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">Strategy</h3>
        <p>Control the center — it connects to all 8 other points and is part of 4 winning lines. During placement, block any line where your opponent has 2 pieces. In the movement phase, aim for a double threat your opponent cannot block with one move.</p>
      </div>
      <div className="help-modal-footer">
        <button className="btn btn-primary" onClick={onClose}>Got it</button>
      </div>
    </Modal>
  )
}
