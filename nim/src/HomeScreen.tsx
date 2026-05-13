import { useState } from 'react'
import Header from './components/Header'
import HelpModal from './components/HelpModal'
import type { GameState, Mode } from './gameLogic'
import './HomeScreen.css'

interface Props {
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  onStart: (state: GameState) => void
  onResume: () => void
  canResume: boolean
  records: number
  prefs: { mode: Mode; humanPlayer: 0 | 1 }
  onSavePrefs: (p: { mode: Mode; humanPlayer: 0 | 1 }) => void
}

function makeInitialState(mode: Mode, humanPlayer: 0 | 1): GameState {
  return {
    heaps: [1, 3, 5, 7],
    currentPlayer: 0,
    selectedHeap: null,
    removeCount: 1,
    phase: 'playing',
    winner: null,
    mode,
    humanPlayer,
  }
}

export default function HomeScreen({
  theme,
  onThemeToggle,
  onStart,
  onResume,
  canResume,
  records,
  prefs,
  onSavePrefs,
}: Props) {
  const [showHelp, setShowHelp] = useState(false)
  const [mode, setMode] = useState<Mode>(prefs.mode)
  const [humanPlayer, setHumanPlayer] = useState<0 | 1>(prefs.humanPlayer)

  function handleModeChange(m: Mode) {
    setMode(m)
    onSavePrefs({ mode: m, humanPlayer })
  }

  function handleHumanPlayerChange(h: 0 | 1) {
    setHumanPlayer(h)
    onSavePrefs({ mode, humanPlayer: h })
  }

  function handleNewGame() {
    const state = makeInitialState(mode, humanPlayer)
    onStart(state)
  }

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
          <h1 className="game-title">Nim</h1>
          <p className="game-subtitle">The strategy removal game</p>
        </div>

        <div className="home-settings">
          <div className="segment-group" role="group" aria-label="Game mode">
            <button
              className={`segment-btn${mode === 'vs-computer' ? ' segment-btn--active' : ''}`}
              onClick={() => handleModeChange('vs-computer')}
            >
              vs Computer
            </button>
            <button
              className={`segment-btn${mode === '2-player' ? ' segment-btn--active' : ''}`}
              onClick={() => handleModeChange('2-player')}
            >
              2 Player
            </button>
          </div>

          {mode === 'vs-computer' && (
            <div className="vs-computer-options">
              <div className="segment-group" role="group" aria-label="Turn order">
                <button
                  className={`segment-btn${humanPlayer === 0 ? ' segment-btn--active' : ''}`}
                  onClick={() => handleHumanPlayerChange(0)}
                >
                  Go First
                </button>
                <button
                  className={`segment-btn${humanPlayer === 1 ? ' segment-btn--active' : ''}`}
                  onClick={() => handleHumanPlayerChange(1)}
                >
                  Go Second
                </button>
              </div>

              <div className="records-section">
                <span className="records-label">Wins</span>
                <span className="records-count">{records}</span>
              </div>
            </div>
          )}
        </div>

        <div className="home-actions">
          <button className="btn btn--primary" onClick={handleNewGame}>New Game</button>
          {canResume && (
            <button className="btn btn--secondary" onClick={onResume}>Resume</button>
          )}
        </div>
      </div>

      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)}>
          <div className="help-section">
            <h3 className="help-heading">Objective</h3>
            <p className="help-text">Take the last object from the table to win.</p>
          </div>
          <div className="help-section">
            <h3 className="help-heading">Rules</h3>
            <ul className="help-list">
              <li>4 heaps start with 1, 3, 5, and 7 objects</li>
              <li>On your turn, pick one heap and remove any number from it (at least 1)</li>
              <li>The player who takes the last object wins</li>
            </ul>
          </div>
          <div className="help-section">
            <h3 className="help-heading">Strategy</h3>
            <ul className="help-list">
              <li>XOR all heap sizes together. If the result is 0 after your move, you are in a winning position</li>
              <li>If the nim-sum is already 0 on your turn, your opponent has the advantage</li>
              <li>With one heap left, take all of it to win instantly</li>
              <li>If only one heap has more than 1 object, reduce it to leave an odd number of single-object heaps</li>
            </ul>
          </div>
          <div className="help-section">
            <h3 className="help-heading">Common mistakes</h3>
            <ul className="help-list">
              <li>Removing too many from a large heap and leaving a single-object heap</li>
              <li>Ignoring smaller heaps - every heap affects the nim-sum</li>
            </ul>
          </div>
        </HelpModal>
      )}
    </div>
  )
}
