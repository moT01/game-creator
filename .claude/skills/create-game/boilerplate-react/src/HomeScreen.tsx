import { useState } from 'react'
import Header from './components/Header'
import HelpModal from './components/HelpModal'
import GameOptions, { type GameOptionsValue } from './components/GameOptions'
import './HomeScreen.css'

interface Props {
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  onStart: () => void
}

const DEFAULT_OPTIONS: GameOptionsValue = {
  mode: 'computer',
  playerGoesFirst: true,
  hardMode: false,
}

export default function HomeScreen({ theme, onThemeToggle, onStart }: Props) {
  const [showHelp, setShowHelp] = useState(false)
  const [options, setOptions] = useState<GameOptionsValue>(DEFAULT_OPTIONS)

  return (
    <div className="card">
      <Header
        variant="home"
        theme={theme}
        onThemeToggle={onThemeToggle}
        onHelp={() => setShowHelp(true)}
      />
      <div className="home-content">
        <div className="game-heading">
          <h1 className="game-title">Game Name</h1>
          <p className="game-subtitle">A short description</p>
        </div>
        <GameOptions
          value={options}
          onChange={setOptions}
          showModeToggle
          showSideSelect
          showHardMode
          stats={[
            { label: 'Normal', value: 12 },
            { label: 'Hard', value: 5 },
          ]}
        />
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
