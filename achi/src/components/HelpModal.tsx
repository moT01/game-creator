import Modal from './Modal'

interface Props {
  onClose: () => void
}

export default function HelpModal({ onClose }: Props) {
  return (
    <Modal title="How to Play" onClose={onClose}>
      <div className="help-section">
        <h3 className="help-heading">Objective</h3>
        <p>Get 3 of your pieces in a row - horizontally, vertically, or diagonally.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">How to Play</h3>
        <ol className="help-list">
          <li>Players take turns placing their 4 pieces on any empty spot.</li>
          <li>Once all 8 pieces are placed, take turns sliding one piece to an adjacent empty spot along a line.</li>
          <li>First to line up 3 in a row wins.</li>
        </ol>
      </div>
      <div className="help-section">
        <h3 className="help-heading">Strategy</h3>
        <ul className="help-list">
          <li>The center connects to all 8 spots - control it early.</li>
          <li>During placement, build two threats at once to force your opponent to choose which to block.</li>
          <li>In the movement phase, keep your pieces flexible - avoid clustering in one corner.</li>
        </ul>
      </div>
      <div className="help-section">
        <h3 className="help-heading">Tips</h3>
        <ul className="help-list">
          <li>If your opponent has 2 in a row with an empty third spot, block it immediately.</li>
          <li>Try to create a fork - two winning threats at the same time.</li>
        </ul>
      </div>
      <div className="help-modal-footer">
        <button className="btn btn-primary" onClick={onClose}>Got it</button>
      </div>
    </Modal>
  )
}
