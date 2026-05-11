import { useState } from 'react'
import type { Mode, Player } from '../gameLogic'
import './ModeSelector.css'

interface Props {
  onStart: (mode: Mode, playerSide: Player) => void
  onResume: () => void
  hasSavedGame: boolean
  wins: number
}

export function ModeSelector({ onStart, onResume, hasSavedGame, wins }: Props) {
  const [mode, setMode] = useState<Mode>('vs-computer')
  const [playerSide, setPlayerSide] = useState<Player>('Light')

  return (
    <div className="home-body">
      <div className="mode-tabs">
        <button
          className={`tab-btn${mode === 'vs-computer' ? ' tab-btn--active' : ''}`}
          onClick={() => setMode('vs-computer')}
        >
          vs Computer
        </button>
        <button
          className={`tab-btn${mode === 'vs-player' ? ' tab-btn--active' : ''}`}
          onClick={() => setMode('vs-player')}
        >
          2 Players
        </button>
      </div>

      {mode === 'vs-computer' && (
        <div className="wins-row">
          <span className="wins-row-label">Wins</span>
          <span className="wins-num">{wins}</span>
        </div>
      )}

      {mode === 'vs-computer' && (
        <div className="pill-toggle">
          <button
            className={`pill-btn${playerSide === 'Light' ? ' pill-btn--active' : ''}`}
            onClick={() => setPlayerSide('Light')}
          >
            Go First
          </button>
          <button
            className={`pill-btn${playerSide === 'Dark' ? ' pill-btn--active' : ''}`}
            onClick={() => setPlayerSide('Dark')}
          >
            Go Second
          </button>
        </div>
      )}

      <div className="home-actions">
        <button className="primary-btn" onClick={() => onStart(mode, playerSide)}>
          New Game
        </button>
        {hasSavedGame && (
          <button className="secondary-btn" onClick={onResume}>
            Resume Game
          </button>
        )}
      </div>
    </div>
  )
}
