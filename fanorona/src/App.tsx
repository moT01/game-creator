import { useState } from 'react'
import { useTheme } from './hooks/useTheme'
import { createStorage } from './hooks/useStorage'
import HomeScreen from './HomeScreen'
import GameScreen from './GameScreen'
import HelpModal from './components/HelpModal'
import type { GameOptions } from './HomeOptions'
import './App.css'

const storage = createStorage('<game-name>_state')

// REPLACE: define the shape of a game in progress
type GameState = Record<string, unknown>

type Phase = 'home' | 'game'

function App() {
  const [phase, setPhase] = useState<Phase>('home')
  const [theme, toggleTheme] = useTheme('<game-name>')
  const [gameState, setGameState] = useState<GameState | null>(() => storage.load<GameState>())
  const [gameOptions, setGameOptions] = useState<GameOptions | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  function startGame(options: GameOptions) {
    // REPLACE: build initial game state from options, then save
    const state: GameState = {}
    storage.save(state)
    setGameState(state)
    setGameOptions(options)
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
          hasGame={gameState !== null}
        />
      )}
      {phase === 'game' && gameOptions && (
        <GameScreen
          theme={theme}
          onThemeToggle={toggleTheme}
          onHelp={() => setShowHelp(true)}
          onClose={() => setPhase('home')}
          options={gameOptions}
        />
      )}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  )
}

export default App
