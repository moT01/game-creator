import { useState } from 'react'
import { useTheme } from './hooks/useTheme'
import { createStorage } from './hooks/useStorage'
import HomeScreen from './HomeScreen'
import GameScreen from './GameScreen'
import HelpModal from './components/HelpModal'
import type { GameOptions } from './HomeOptions'
import { DEFAULT_OPTIONS } from './HomeOptions'
import { INITIAL_STATE } from './hooks/useGame'
import type { GameState } from './hooks/useGame'
import './App.css'

const gameStorage = createStorage<GameState>('achi_state')
const optsStorage = createStorage<GameOptions>('achi_opts')

type Phase = 'home' | 'game'

function App() {
  const [phase, setPhase] = useState<Phase>('home')
  const [theme, toggleTheme] = useTheme('achi')
  const [hasGame, setHasGame] = useState(() => gameStorage.load() !== null)
  const [gameOptions, setGameOptions] = useState<GameOptions | null>(null)
  const [gameKey, setGameKey] = useState(0)
  const [showHelp, setShowHelp] = useState(false)

  function startGame(options: GameOptions) {
    gameStorage.save({ ...INITIAL_STATE })
    optsStorage.save(options)
    setHasGame(true)
    setGameOptions(options)
    setPhase('game')
  }

  function handleResume() {
    const opts = optsStorage.load() ?? DEFAULT_OPTIONS
    setGameOptions(opts)
    setPhase('game')
  }

  function handleClose() {
    setPhase('home')
  }

  function handleGameOver() {
    setHasGame(false)
  }

  function handlePlayAgain() {
    gameStorage.save({ ...INITIAL_STATE })
    setGameKey(k => k + 1)
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
          key={gameKey}
          theme={theme}
          onThemeToggle={toggleTheme}
          onHelp={() => setShowHelp(true)}
          onClose={handleClose}
          options={gameOptions}
          onGameOver={handleGameOver}
          onPlayAgain={handlePlayAgain}
        />
      )}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  )
}

export default App
