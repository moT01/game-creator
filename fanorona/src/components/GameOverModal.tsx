import Modal from './Modal'
import './GameOverModal.css'

type ResultType = 'win' | 'loss' | 'draw'

interface Stat {
  label: string
  value: number | string
}

interface Props {
  result: string
  resultType?: ResultType
  note?: string
  stats?: Stat[]
  onPlayAgain: () => void
  onHome: () => void
}

export default function GameOverModal({ result, resultType = 'win', note, stats, onPlayAgain, onHome }: Props) {
  return (
    <Modal onClose={onHome}>
      <p className={`game-over-result game-over-result-${resultType}`}>{result}</p>
      {note && <p className="game-over-note">{note}</p>}
      <div className="game-over-stats">
        {stats?.map(s => (
          <div key={s.label} className="game-over-stat">
            <span className="game-over-stat-value">{s.value}</span>
            <span className="game-over-stat-label">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="game-over-actions">
        <button className="btn btn-secondary" onClick={onHome}>Home</button>
        <button className="btn btn-primary" onClick={onPlayAgain}>Play Again</button>
      </div>
    </Modal>
  )
}
