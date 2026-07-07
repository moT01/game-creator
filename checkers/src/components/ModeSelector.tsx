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

  function handleTabKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
    const currentIndex = tabs.findIndex(t => t === document.activeElement)
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const dir = e.key === 'ArrowRight' ? 1 : -1
      const next = tabs[(currentIndex + dir + tabs.length) % tabs.length]
      next.focus()
      setMode(next.dataset.mode as Mode)
    }
  }

  function handlePillKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const radios = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'))
    const currentIndex = radios.findIndex(r => r === document.activeElement)
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const dir = e.key === 'ArrowRight' ? 1 : -1
      const next = radios[(currentIndex + dir + radios.length) % radios.length]
      next.focus()
      setPlayerSide(next.dataset.side as Player)
    }
  }

  return (
    <div className="home-body">
      <div role="tablist" className="mode-tabs" onKeyDown={handleTabKeyDown}>
        <button
          role="tab"
          id="tab-vs-computer"
          aria-selected={mode === 'vs-computer'}
          aria-controls="tabpanel-mode"
          tabIndex={mode === 'vs-computer' ? 0 : -1}
          className={`tab-btn${mode === 'vs-computer' ? ' tab-btn--active' : ''}`}
          onClick={() => setMode('vs-computer')}
          data-mode="vs-computer"
        >
          vs Computer
        </button>
        <button
          role="tab"
          id="tab-vs-player"
          aria-selected={mode === 'vs-player'}
          aria-controls="tabpanel-mode"
          tabIndex={mode === 'vs-player' ? 0 : -1}
          className={`tab-btn${mode === 'vs-player' ? ' tab-btn--active' : ''}`}
          onClick={() => setMode('vs-player')}
          data-mode="vs-player"
        >
          2 Player
        </button>
      </div>

      <div role="tabpanel" id="tabpanel-mode" aria-labelledby={`tab-${mode}`} className="mode-tabpanel">
        {mode === 'vs-computer' && (
          <>
            <div className="wins-row">
              <span className="wins-row-label">Wins</span>
              <span className="wins-num">{wins}</span>
            </div>
            <div role="radiogroup" aria-label="Turn order" className="pill-toggle" onKeyDown={handlePillKeyDown}>
              <button
                role="radio"
                aria-checked={playerSide === 'Light'}
                tabIndex={playerSide === 'Light' ? 0 : -1}
                className={`pill-btn${playerSide === 'Light' ? ' pill-btn--active' : ''}`}
                onClick={() => setPlayerSide('Light')}
                data-side="Light"
              >
                Go First
              </button>
              <button
                role="radio"
                aria-checked={playerSide === 'Dark'}
                tabIndex={playerSide === 'Dark' ? 0 : -1}
                className={`pill-btn${playerSide === 'Dark' ? ' pill-btn--active' : ''}`}
                onClick={() => setPlayerSide('Dark')}
                data-side="Dark"
              >
                Go Second
              </button>
            </div>
          </>
        )}
      </div>

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
