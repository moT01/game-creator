import Modal from './Modal'

interface Props {
  onClose: () => void
}

export default function HelpModal({ onClose }: Props) {
  return (
    <Modal title="How to Play" onClose={onClose}>
      <div className="help-section">
        <h3 className="help-heading">Objective</h3>
        <p>Capture all of your opponent's pieces, or leave them with no legal moves.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">Movement</h3>
        <p>Pieces move to adjacent intersections along the lines. Diagonal moves are only possible at intersections where the dot pattern allows it.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">Capturing</h3>
        <p><strong>Approach</strong> - move toward an enemy group. All consecutive enemy pieces in that direction are removed.</p>
        <p><strong>Withdrawal</strong> - move away from an enemy group. All consecutive enemy pieces behind your starting square are removed.</p>
        <p>If a move enables both, you must choose one. When you can capture, you must.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">Capture Chains</h3>
        <p>After capturing, your piece must keep capturing if possible. It cannot reuse the same direction or its reverse, and cannot revisit any square from this turn.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">Paika</h3>
        <p>A non-capturing move to any adjacent intersection. Only legal when you have no captures available at all.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">Tips</h3>
        <p>Always check withdrawal before approach. Withdrawal often captures more pieces since it hits the ones behind your starting square.</p>
      </div>
      <div className="help-modal-footer">
        <button className="btn btn-primary" onClick={onClose}>Got it</button>
      </div>
    </Modal>
  )
}
