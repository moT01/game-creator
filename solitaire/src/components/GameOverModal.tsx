import Modal from './Modal'
import StatsRow from './StatsRow'
import './GameOverModal.css'

type ResultType = 'win' | 'loss' | 'draw'

interface Props {
  result: string
  resultType?: ResultType
  note?: string
  stats?: { label: string; value: string | number }[]
  onPlayAgain: () => void
  onHome: () => void
  onDismiss?: () => void
}

export default function GameOverModal({ result, resultType = 'win', note, stats, onPlayAgain, onHome, onDismiss }: Props) {
  return (
    <Modal onClose={onDismiss ?? onHome}>
      <p className={`game-over-result game-over-result-${resultType}`}>{result}</p>
      {note && <p className="game-over-note">{note}</p>}
      {stats && stats.length > 0 && (
        <div className="game-over-stats">
          <StatsRow stats={stats} />
        </div>
      )}
      <div className="game-over-actions">
        <button className="btn btn-secondary" onClick={onHome}>Home</button>
        <button className="btn btn-primary" onClick={onPlayAgain}>Play Again</button>
      </div>
    </Modal>
  )
}
