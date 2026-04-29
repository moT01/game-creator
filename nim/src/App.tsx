import { useState, useCallback } from 'react'
import { useTheme } from './hooks/useTheme'
import { createStorage } from './hooks/useStorage'
import HomeScreen from './HomeScreen'
import GameScreen from './GameScreen'
import type { GameState, Mode, Difficulty } from './gameLogic'
import './App.css'

const storage = createStorage<GameState>('nim-state')
const recordsStorage = createStorage<{ wins_normal: number; wins_hard: number }>('nim-records')
const prefsStorage = createStorage<{ mode: Mode; difficulty: Difficulty; humanPlayer: 0 | 1 }>('nim-prefs')

type Phase = 'home' | 'game'

function App() {
  const [phase, setPhase] = useState<Phase>('home')
  const [theme, toggleTheme] = useTheme('nim')
  const [gameState, setGameState] = useState<GameState | null>(null)

  const savedState = storage.load()
  const canResume = !!(
    savedState &&
    savedState.phase === 'playing' &&
    savedState.heaps.some(h => h > 0)
  )

  const records = recordsStorage.load() ?? { wins_normal: 0, wins_hard: 0 }
  const prefs = prefsStorage.load() ?? { mode: 'vs-computer' as Mode, difficulty: 'normal' as Difficulty, humanPlayer: 0 as 0 | 1 }

  const handleStart = useCallback((state: GameState) => {
    storage.save(state)
    setGameState(state)
    setPhase('game')
  }, [])

  const handleResume = useCallback(() => {
    const saved = storage.load()
    if (saved) {
      setGameState(saved)
      setPhase('game')
    }
  }, [])

  const handleQuit = useCallback(() => {
    setGameState(null)
    setPhase('home')
  }, [])

  const handleGameOver = useCallback((winner: 0 | 1, mode: Mode, difficulty: Difficulty) => {
    storage.clear()
    if (mode === 'vs-computer') {
      const current = recordsStorage.load() ?? { wins_normal: 0, wins_hard: 0 }
      const humanPlayer = gameState?.humanPlayer ?? 0
      if (winner === humanPlayer) {
        const key = difficulty === 'hard' ? 'wins_hard' : 'wins_normal'
        recordsStorage.save({ ...current, [key]: current[key] + 1 })
      }
    }
  }, [gameState])

  const handleSavePrefs = useCallback((p: { mode: Mode; difficulty: Difficulty; humanPlayer: 0 | 1 }) => {
    prefsStorage.save(p)
  }, [])

  return (
    <div className="app">
      {phase === 'home' && (
        <HomeScreen
          theme={theme}
          onThemeToggle={toggleTheme}
          onStart={handleStart}
          onResume={handleResume}
          canResume={canResume}
          records={records}
          prefs={prefs}
          onSavePrefs={handleSavePrefs}
        />
      )}
      {phase === 'game' && gameState && (
        <GameScreen
          theme={theme}
          onThemeToggle={toggleTheme}
          onQuit={handleQuit}
          initialState={gameState}
          onSave={storage.save}
          onGameOver={handleGameOver}
        />
      )}
    </div>
  )
}

export default App
