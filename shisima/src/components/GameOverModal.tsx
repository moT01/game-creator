import type { ReactNode } from 'react'
import Modal from './Modal'
import './GameOverModal.css'

type ResultType = 'win' | 'loss' | 'draw'

interface Props {
  result: string
  resultType?: ResultType
  note?: string
  stats?: ReactNode
  onPlayAgain: () => void
  onHome: () => void
}

export default function GameOverModal({ result, resultType = 'win', note, stats, onPlayAgain, onHome }: Props) {
  return (
    <Modal onClose={onHome}>
      <p className={`game-over-result game-over-result-${resultType}`}>{result}</p>
      {note && <p className="game-over-note">{note}</p>}
      {stats && <div className="game-over-stats">{stats}</div>}
      <div className="game-over-actions">
        <button className="btn btn-secondary" onClick={onHome}>Home</button>
        <button className="btn btn-primary" onClick={onPlayAgain}>Play Again</button>
      </div>
    </Modal>
  )
}
