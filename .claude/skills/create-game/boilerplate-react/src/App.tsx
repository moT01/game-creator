import { useState } from 'react'
import { useTheme } from './hooks/useTheme'
import { createStorage } from './hooks/useStorage'
import HomeScreen from './HomeScreen'
import GameScreen from './GameScreen'
import HelpModal from './components/HelpModal'
import type { GameOptions } from './HomeOptions'
import './App.css'

const storage = createStorage('<game-name>_state')

type Phase = 'home' | 'game'

function App() {
  const [phase, setPhase] = useState<Phase>('home')
  const [theme, toggleTheme] = useTheme('<game-name>')
  const [hasGame, setHasGame] = useState(() => storage.load() !== null)
  const [showHelp, setShowHelp] = useState(false)

  function startGame(options: GameOptions) {
    void options // use options to initialize game state
    setHasGame(true)
    setPhase('game')
  }

  return (
    <div className="app">
      {phase === 'home' && (
        <HomeScreen
          theme={theme}
          onThemeToggle={toggleTheme}
          onHelp={() => setShowHelp(true)}
          onStart={startGame}
          onResume={() => setPhase('game')}
          hasGame={hasGame}
        />
      )}
      {phase === 'game' && (
        <GameScreen
          theme={theme}
          onThemeToggle={toggleTheme}
          onHelp={() => setShowHelp(true)}
          onClose={() => setPhase('home')}
        />
      )}
      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)}>
          <p>Help content goes here.</p>
        </HelpModal>
      )}
    </div>
  )
}

export default App
