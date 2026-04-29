import { useState } from 'react'
import Header from './components/Header'
import HelpModal from './components/HelpModal'
import './HomeScreen.css'

interface Props {
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  onStart: () => void
}

export default function HomeScreen({ theme, onThemeToggle, onStart }: Props) {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="card">
      <Header
        variant="home"
        theme={theme}
        onThemeToggle={onThemeToggle}
        onHelp={() => setShowHelp(true)}
      />
      <div className="home-content">
        <h1 className="game-title">Game Name</h1>
        <p className="game-subtitle">A short description</p>
        <div className="home-actions">
          <button className="btn btn--primary" onClick={onStart}>New Game</button>
        </div>
      </div>
      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)}>
          <p>Help content goes here.</p>
        </HelpModal>
      )}
    </div>
  )
}
