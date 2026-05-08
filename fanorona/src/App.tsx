import { useState } from 'react'
import { useTheme } from './hooks/useTheme'
import { createStorage } from './hooks/useStorage'
import { initBoard } from './game'
import type { GameState } from './game'
import HomeScreen from './HomeScreen'
import GameScreen from './GameScreen'
import HelpModal from './components/HelpModal'
import type { GameOptions } from './HomeOptions'
import './App.css'

const gameStorage = createStorage<GameState>('fanorona_state')
const optsStorage = createStorage<GameOptions>('fanorona_opts')

type Phase = 'home' | 'game'

function App() {
  const [phase, setPhase] = useState<Phase>('home')
  const [theme, toggleTheme] = useTheme('fanorona')
  const [hasGame, setHasGame] = useState(() => gameStorage.load() !== null)
  const [gameOptions, setGameOptions] = useState<GameOptions | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  function startGame(options: GameOptions) {
    const state: GameState = {
      board: initBoard(),
      currentPlayer: 'dark',
      captureChain: null,
      phase: 'playing',
      winner: null,
      moveCount: 0,
    }
    gameStorage.save(state)
    optsStorage.save(options)
    setHasGame(true)
    setGameOptions(options)
    setPhase('game')
  }

  function handleResume() {
    const opts = optsStorage.load() ?? { opponent: 'computer' as const }
    setGameOptions(opts)
    setPhase('game')
  }

  function handleClose() {
    setPhase('home')
  }

  function handleGameOver() {
    setHasGame(false)
  }

  return (
    <div className="app">
      {phase === 'home' && (
        <HomeScreen
          theme={theme}
          onThemeToggle={toggleTheme}
          onHelp={() => setShowHelp(true)}
          onStart={startGame}
          onResume={handleResume}
          hasGame={hasGame}
        />
      )}
      {phase === 'game' && gameOptions && (
        <GameScreen
          theme={theme}
          onThemeToggle={toggleTheme}
          onHelp={() => setShowHelp(true)}
          onClose={handleClose}
          options={gameOptions}
          onGameOver={handleGameOver}
        />
      )}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  )
}

export default App
