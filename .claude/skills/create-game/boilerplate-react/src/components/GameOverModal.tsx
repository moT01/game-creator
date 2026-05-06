import Modal from './Modal'
import './GameOverModal.css'

type ResultType = 'win' | 'loss' | 'draw'

interface Props {
  result: string
  resultType?: ResultType
  note?: string
  onPlayAgain: () => void
  onHome: () => void
}

export default function GameOverModal({ result, resultType = 'win', note, onPlayAgain, onHome }: Props) {
  return (
    <Modal onClose={onHome}>
      <p className={`game-over-result game-over-result-${resultType}`}>{result}</p>
      {note && <p className="game-over-note">{note}</p>}
      <div className="game-over-stats">
        {/* REPLACE: show score, moves, time, etc. */}
      </div>
      <div className="game-over-actions">
        <button className="btn btn-secondary" onClick={onHome}>Home</button>
        <button className="btn btn-primary" onClick={onPlayAgain}>Play Again</button>
      </div>
    </Modal>
  )
}
