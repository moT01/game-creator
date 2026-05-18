import { useState, useEffect } from 'react'
import Header from './components/Header'
import GameBoard from './GameBoard'
import ConfirmModal from './components/ConfirmModal'
import GameOverModal from './components/GameOverModal'
import StatsRow from './components/StatsRow'
import { useGame } from './hooks/useGame'
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

export default function GameScreen({ theme, onThemeToggle, onHelp, onClose, options, onGameOver, onPlayAgain }: Props) {
  const { state, humanPlayer, handlePointClick, hasNoMoves } = useGame(options)
  const [showConfirm, setShowConfirm] = useState(false)
  const [gameOverDismissed, setGameOverDismissed] = useState(false)

  const isComputerTurn = options.opponent === 'computer' && state.currentPlayer !== humanPlayer
  const isHumanTurn = options.opponent === '2player' || state.currentPlayer === humanPlayer
  const isGameOver = state.phase === 'over'
  const showGameOver = isGameOver && !gameOverDismissed

  useEffect(() => {
    if (isGameOver) onGameOver()
  }, [isGameOver]) // eslint-disable-line react-hooks/exhaustive-deps

  function getGameOverResult(): string {
    if (state.winner === null) return 'Draw'
    if (options.opponent === 'computer') {
      return state.winner === humanPlayer ? 'You win!' : 'Computer wins'
    }
    return state.winner === 1 ? 'Player 1 wins!' : 'Player 2 wins!'
  }

  function getStatusText(): string {
    if (isGameOver) return getGameOverResult()
    if (hasNoMoves) return 'No moves - turn skipped'
    if (isComputerTurn) return 'Thinking...'
    if (state.phase === 'placing') {
      if (options.opponent === '2player') {
        return state.currentPlayer === 1 ? 'Player 1: place a piece' : 'Player 2: place a piece'
      }
      return 'Place a piece'
    }
    if (options.opponent === '2player') {
      return state.currentPlayer === 1 ? "Player 1's turn" : "Player 2's turn"
    }
    return 'Your turn'
  }

  function getResultType(): 'win' | 'loss' | 'draw' {
    if (state.winner === null) return 'draw'
    if (options.opponent === 'computer' && state.winner !== humanPlayer) return 'loss'
    return 'win'
  }

  function getNote(): string {
    if (state.winner === null) return 'Same position repeated 3 times.'
    return '3 in a row'
  }

  return (
    <div className="card">
      <Header
        variant="game"
        theme={theme}
        onThemeToggle={onThemeToggle}
        onHelp={onHelp}
        onClose={() => isGameOver ? setGameOverDismissed(false) : setShowConfirm(true)}
        center={
          <span aria-live="polite" className={hasNoMoves ? 'status-no-moves' : undefined}>
            {getStatusText()}
          </span>
        }
      />
      <div className="game-content">
        <GameBoard
          board={state.board}
          selectedPoint={state.selectedPoint}
          validMoves={state.validMoves}
          currentPlayer={state.currentPlayer}
          phase={state.phase}
          isHumanTurn={isHumanTurn}
          onPointClick={handlePointClick}
        />
      </div>
      {showConfirm && (
        <ConfirmModal
          message="Return to the main menu? You can resume your game from there."
          confirmLabel="Quit"
          cancelLabel="Cancel"
          onConfirm={onClose}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {showGameOver && (
        <GameOverModal
          result={getGameOverResult()}
          resultType={getResultType()}
          note={getNote()}
          stats={<StatsRow stats={[{ label: 'Moves', value: state.moveCount }]} />}
          onDismiss={() => setGameOverDismissed(true)}
          onPlayAgain={onPlayAgain}
          onHome={onClose}
        />
      )}
    </div>
  )
}
