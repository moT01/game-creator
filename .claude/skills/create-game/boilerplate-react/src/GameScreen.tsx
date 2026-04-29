import { useState } from 'react'
import Header from './components/Header'
import HelpModal from './components/HelpModal'
import ConfirmModal from './components/ConfirmModal'
import './GameScreen.css'

interface Props {
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  onClose: () => void
}

export default function GameScreen({ theme, onThemeToggle, onClose }: Props) {
  const [showHelp, setShowHelp] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div className="card">
      <Header
        variant="game"
        theme={theme}
        onThemeToggle={onThemeToggle}
        onHelp={() => setShowHelp(true)}
        onClose={() => setShowConfirm(true)}
        center="Your turn"
      />
      <div className="game-content">
        <div className="game-placeholder">Game board goes here</div>
        <button className="btn btn--primary" onClick={() => setShowConfirm(true)}>Quit</button>
      </div>
      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)}>
          <p>Game rules go here.</p>
        </HelpModal>
      )}
      {showConfirm && (
        <ConfirmModal
          message="Quit this game? Your progress will be lost."
          confirmLabel="Quit"
          onConfirm={onClose}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
