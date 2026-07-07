import { useState } from 'react'
import Header from './components/Header'
import GameBoard from './GameBoard'
import ConfirmModal from './components/ConfirmModal'
import GameOverModal from './components/GameOverModal'
import { useGame } from './hooks/useGame'
import { formatTime } from './gameLogic'
import { createStorage } from './hooks/useStorage'
import type { GameOptions } from './HomeOptions'
import './GameScreen.css'

const wins1Storage = createStorage<number>('solitaire_wins_draw1')
const wins3Storage = createStorage<number>('solitaire_wins_draw3')
const best1Storage = createStorage<number>('solitaire_best_draw1')
const best3Storage = createStorage<number>('solitaire_best_draw3')

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
  const [showConfirm, setShowConfirm] = useState(false)
  const [gameOverDismissed, setGameOverDismissed] = useState(false)
  const { state, drawFromStock, selectCard, attemptMove } = useGame(options, showConfirm)

  const isGameOver = state.phase === 'won'
  const showGameOver = isGameOver && !gameOverDismissed

  const winsStorage = options.drawCount === 1 ? wins1Storage : wins3Storage
  const bestStorage = options.drawCount === 1 ? best1Storage : best3Storage
  const wins = winsStorage.load() ?? 0
  const best = bestStorage.load()
  const isNewBest = best !== null && state.elapsedSeconds === best
  const modeLabel = `Draw ${options.drawCount}`

  const note = isGameOver
    ? isNewBest
      ? `New best time: ${formatTime(state.elapsedSeconds)}`
      : `Completed in ${formatTime(state.elapsedSeconds)} - ${state.moves} moves`
    : undefined

  const stats = isGameOver ? [
    { label: `Wins (${modeLabel})`, value: wins },
    { label: `Best Time (${modeLabel})`, value: best !== null ? formatTime(best) : '--' },
  ] : undefined

  return (
    <div className="card card-game">
      <Header
        variant="game"
        theme={theme}
        onThemeToggle={onThemeToggle}
        onHelp={onHelp}
        onClose={() => isGameOver ? setGameOverDismissed(false) : setShowConfirm(true)}
        center={
          <div className="game-status">
            <span className="game-moves">{state.moves} moves</span>
            <span className="game-timer">{formatTime(state.elapsedSeconds)}</span>
          </div>
        }
      />
      <div className="game-content">
        <GameBoard
          state={state}
          drawFromStock={drawFromStock}
          selectCard={selectCard}
          attemptMove={attemptMove}
        />
      </div>
      {showConfirm && (
        <ConfirmModal
          message="Return to the main menu? You can resume your game from there."
          confirmLabel="Quit"
          cancelLabel="Cancel"
          onConfirm={() => { setShowConfirm(false); onClose() }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {showGameOver && (
        <GameOverModal
          result="You Win!"
          resultType="win"
          note={note}
          stats={stats}
          onDismiss={() => setGameOverDismissed(true)}
          onPlayAgain={onPlayAgain}
          onHome={() => { onGameOver(); onClose() }}
        />
      )}
    </div>
  )
}
