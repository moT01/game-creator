import { useState } from 'react'
import { useTheme } from './hooks/useTheme'
// import { createStorage } from './hooks/useStorage'
import HomeScreen from './HomeScreen'
import GameScreen from './GameScreen'
import './App.css'

// Replace '<game-name>' with the actual game name key
// const storage = createStorage('<game-name>_state')

type Phase = 'home' | 'game'

function App() {
  const [phase, setPhase] = useState<Phase>('home')
  const [theme, toggleTheme] = useTheme('<game-name>')

  return (
    <div className="app">
      {phase === 'home' && (
        <HomeScreen
          theme={theme}
          onThemeToggle={toggleTheme}
          onStart={() => setPhase('game')}
        />
      )}
      {phase === 'game' && (
        <GameScreen
          theme={theme}
          onThemeToggle={toggleTheme}
          onClose={() => setPhase('home')}
        />
      )}
    </div>
  )
}

export default App
