import { useState } from 'react'
import Header from './components/Header'
import GameBoard from './GameBoard'
import ConfirmModal from './components/ConfirmModal'
import GameOverModal from './components/GameOverModal'
import { useGame } from './hooks/useGame'
import type { GameOptions } from './HomeOptions'
import './GameScreen.css'

interface Props {
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  onHelp: () => void
  onClose: () => void
  options: GameOptions
}

export default function GameScreen({ theme, onThemeToggle, onHelp, onClose, options }: Props) {
  // REPLACE: const { ... } = useGame(options)
  void useGame(options)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showGameOver, setShowGameOver] = useState(false)

  return (
    <div className="card">
      <Header
        variant="game"
        theme={theme}
        onThemeToggle={onThemeToggle}
        onHelp={onHelp}
        onClose={() => setShowConfirm(true)}
        center="Your turn"
      />
      <div className="game-content">
        <GameBoard />
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
          result="You Win!"
          resultType="win"
          note="Optional note about what happened"
          onPlayAgain={() => setShowGameOver(false)}
          onHome={onClose}
        />
      )}
    </div>
  )
}
