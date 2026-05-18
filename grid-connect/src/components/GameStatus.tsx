import type { Mode, Player } from '../gameLogic'
import './GameStatus.css'

interface Props {
  phase: 'playing' | 'over'
  currentTurn: Player
  winner: Player | null
  isDraw: boolean
  mode: Mode
  playerSide: Player
  onPlayAgain: () => void
}

export function GameStatus({ phase, currentTurn, winner, isDraw, mode, playerSide, onPlayAgain }: Props) {
  const isVsComputer = mode === 'vs-computer'

  if (phase === 'over') {
    let message: string
    if (isDraw) {
      message = 'Draw'
    } else if (winner) {
      if (isVsComputer) {
        message = winner === playerSide ? 'You win!' : 'Computer wins'
      } else {
        message = winner === 'Red' ? 'Player 1 wins!' : 'Player 2 wins!'
      }
    } else {
      message = ''
    }
    return (
      <div className="game-status">
        <p className="game-status__message">{message}</p>
        <button className="game-status__play-again" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    )
  }

  let turnText: string
  if (isVsComputer) {
    turnText = currentTurn === playerSide ? 'Your turn' : 'Thinking...'
  } else {
    turnText = currentTurn === 'Red' ? "Player 1's turn" : "Player 2's turn"
  }

  return (
    <div className="game-status">
      <p className={`game-status__turn game-status__turn--${currentTurn.toLowerCase()}`}>
        {turnText}
      </p>
    </div>
  )
}
