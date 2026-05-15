import { useState, useEffect } from 'react'
import Header from './components/Header'
import GameBoard from './GameBoard'
import ConfirmModal from './components/ConfirmModal'
import GameOverModal from './components/GameOverModal'
import StatsRow from './components/StatsRow'
import { useGame } from './hooks/useGame'
import type { GameState, Player } from './hooks/useGame'
import type { GameOptions } from './HomeOptions'
import './GameScreen.css'

interface Props {
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  onHelp: () => void
  onClose: () => void
  options: GameOptions
  onGameOver: () => void
  onPlayAgain: () => void
}

function getStatus(state: GameState, options: GameOptions): string {
  const computerSide: Player | null = options.opponent === 'computer' ? options.side : null
  if (state.phase === 'placement') {
    if (computerSide && state.currentPlayer === computerSide) return 'Computer placing...'
    const left = 12 - state.piecesPlaced[state.currentPlayer]
    return `Place a piece (${left} left)`
  }
  if (computerSide && state.currentPlayer === computerSide) return 'Computer thinking...'
  if (state.moveSubPhase === 'select-piece') return 'Select a piece to move'
  if (state.moveSubPhase === 'select-destination') return 'Select where to move'
  return 'Select a piece to capture'
}

function getGameOverProps(state: GameState, options: GameOptions) {
  const computerSide: Player | null = options.opponent === 'computer' ? options.side : null
  const loser: Player | null = state.winner ? (state.winner === 'r' ? 'b' : 'r') : null
  const note = loser && state.pieceCounts[loser] <= 2 ? 'reduced to 2 pieces' : 'no moves remaining'
  if (options.opponent === 'computer') {
    if (state.winner === computerSide) return { result: 'Computer wins', resultType: 'loss' as const, note }
    return { result: 'You win!', resultType: 'win' as const, note }
  }
  return {
    result: state.winner === 'r' ? 'Red wins!' : 'Black wins!',
    resultType: 'win' as const,
    note,
  }
}

export default function GameScreen({ theme, onThemeToggle, onHelp, onClose, options, onGameOver, onPlayAgain }: Props) {
  const { state, handleClick, quit } = useGame(options)
  const [showConfirm, setShowConfirm] = useState(false)
  const [gameOverDismissed, setGameOverDismissed] = useState(false)
  const showGameOver = state.gameOver && !gameOverDismissed

  useEffect(() => {
    if (state.gameOver) onGameOver()
  }, [state.gameOver])

  const gameOverProps = getGameOverProps(state, options)

  return (
    <div className="card">
      <Header
        variant="game"
        theme={theme}
        onThemeToggle={onThemeToggle}
        onHelp={onHelp}
        onClose={() => state.gameOver ? setGameOverDismissed(false) : setShowConfirm(true)}
        center={getStatus(state, options)}
      />
      <div className="game-content">
        <GameBoard state={state} onCellClick={handleClick} />
        <StatsRow stats={[
          { label: 'Red', value: state.pieceCounts.r },
          { label: 'Black', value: state.pieceCounts.b },
        ]} />
      </div>
      {showConfirm && (
        <ConfirmModal
          message="Return to the main menu? You can resume your game from there."
          confirmLabel="Quit"
          cancelLabel="Cancel"
          onConfirm={() => { quit(); onClose() }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {showGameOver && (
        <GameOverModal
          result={gameOverProps.result}
          resultType={gameOverProps.resultType}
          note={gameOverProps.note}
          onDismiss={() => setGameOverDismissed(true)}
          onPlayAgain={onPlayAgain}
          onHome={onClose}
        />
      )}
    </div>
  )
}
