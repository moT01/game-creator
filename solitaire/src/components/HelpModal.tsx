import Modal from './Modal'
import './HelpModal.css'

interface Props {
  onClose: () => void
}

export default function HelpModal({ onClose }: Props) {
  return (
    <Modal title="How to Play" onClose={onClose}>
      <div className="help-section">
        <h3 className="help-heading">Objective</h3>
        <p>Move all 52 cards to the 4 foundation piles, one per suit, built up from Ace to King.</p>
      </div>
      <div className="help-section">
        <h3 className="help-heading">Rules</h3>
        <ul className="help-list">
          <li>Tableau columns build down in alternating colors (red on black, black on red)</li>
          <li>Only a King can be placed on an empty tableau column</li>
          <li>Foundations build up by suit, starting from Ace</li>
          <li>Click the stock pile to draw; click again when empty to reset</li>
          <li>In Draw 3, three cards are drawn but only the top card is playable</li>
        </ul>
      </div>
      <div className="help-section">
        <h3 className="help-heading">Strategy</h3>
        <ul className="help-list">
          <li>Uncover face-down cards as quickly as possible</li>
          <li>Prioritize moves that reveal new face-down cards</li>
          <li>Keep an empty tableau column open for maneuvering Kings</li>
          <li>Move Aces and 2s to foundations immediately</li>
          <li>In Draw 3, track cards buried in the waste pile</li>
        </ul>
      </div>
      <div className="help-modal-footer">
        <button className="btn btn-primary" onClick={onClose}>Got it</button>
      </div>
    </Modal>
  )
}
