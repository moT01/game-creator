import type { Color } from '../gameLogic'

interface WinModalProps {
  winner: Color
  mode: 'vs-ai' | 'two-player' | null
  onPlayAgain: () => void
  onMainMenu: () => void
}

export function WinModal({ winner, mode, onPlayAgain, onMainMenu }: WinModalProps) {
  let label: string
  if (mode === 'vs-ai') {
    label = winner === 'light' ? 'You win!' : 'Computer wins'
  } else {
    label = winner === 'light' ? 'Player 1 wins!' : 'Player 2 wins!'
  }

  return (
    <div className="modal-backdrop" onClick={onMainMenu}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{label}</h2>
        <div className="modal-actions">
          <button className="secondary-btn" onClick={onMainMenu}>Menu</button>
          <button className="primary-btn" onClick={onPlayAgain}>Play Again</button>
        </div>
      </div>
    </div>
  )
}
