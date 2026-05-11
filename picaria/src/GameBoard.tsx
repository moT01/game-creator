import type { GameState } from './hooks/useGame'
import './GameBoard.css'

const POINTS = [
  { x: 50,  y: 50  },
  { x: 150, y: 50  },
  { x: 250, y: 50  },
  { x: 50,  y: 150 },
  { x: 150, y: 150 },
  { x: 250, y: 150 },
  { x: 50,  y: 250 },
  { x: 150, y: 250 },
  { x: 250, y: 250 },
]

const LINES = [
  { x1: 50,  y1: 50,  x2: 250, y2: 50  },
  { x1: 50,  y1: 150, x2: 250, y2: 150 },
  { x1: 50,  y1: 250, x2: 250, y2: 250 },
  { x1: 50,  y1: 50,  x2: 50,  y2: 250 },
  { x1: 150, y1: 50,  x2: 150, y2: 250 },
  { x1: 250, y1: 50,  x2: 250, y2: 250 },
  { x1: 50,  y1: 50,  x2: 250, y2: 250 },
  { x1: 250, y1: 50,  x2: 50,  y2: 250 },
]

interface Props {
  board: (0 | 1 | 2)[]
  selectedPoint: number | null
  validMoves: number[]
  currentPlayer: 1 | 2
  phase: GameState['phase']
  isHumanTurn: boolean
  onPointClick: (index: number) => void
}

export default function GameBoard({ board, selectedPoint, validMoves, currentPlayer, phase, isHumanTurn, onPointClick }: Props) {
  function isActive(i: number): boolean {
    if (!isHumanTurn || phase === 'over') return false
    if (phase === 'placing') return board[i] === 0
    if (phase === 'moving') return board[i] === currentPlayer || validMoves.includes(i)
    return false
  }

  function getAriaLabel(i: number): string {
    const base = `Point ${i}`
    if (board[i] === currentPlayer) {
      if (selectedPoint === i) return `${base}, your piece, selected`
      return `${base}, your piece`
    }
    if (board[i] !== 0) return `${base}, opponent piece`
    if (validMoves.includes(i)) return `${base}, valid move`
    return `${base}, empty`
  }

  return (
    <div className="board-container">
      <svg className="board-svg" viewBox="0 0 300 300" aria-label="Picaria board">
        {LINES.map((line, i) => (
          <line
            key={i}
            className="board-line"
            x1={line.x1} y1={line.y1}
            x2={line.x2} y2={line.y2}
          />
        ))}
        {POINTS.map((pt, i) => {
          const active = isActive(i)
          const isSelected = selectedPoint === i
          const isValidDest = validMoves.includes(i) && board[i] === 0
          const hasPiece = board[i] !== 0

          return (
            <g key={i} onClick={() => onPointClick(i)}>
              <circle
                cx={pt.x} cy={pt.y} r={16}
                className={[
                  'board-point',
                  isSelected ? 'board-point-selected' : '',
                  isValidDest ? 'board-point-valid' : '',
                ].filter(Boolean).join(' ')}
              />
              {hasPiece && (
                <circle
                  key={`piece-${i}-${board[i]}`}
                  cx={pt.x} cy={pt.y} r={11}
                  className={[
                    'piece',
                    `piece-${board[i]}`,
                    isSelected ? 'piece-selected' : '',
                  ].filter(Boolean).join(' ')}
                />
              )}
              {isValidDest && (
                <circle
                  cx={pt.x} cy={pt.y} r={5}
                  className={`valid-dot valid-dot-${currentPlayer}`}
                />
              )}
              <circle
                cx={pt.x} cy={pt.y} r={22}
                fill="transparent"
                className={active ? 'point-hit point-hit-active' : 'point-hit'}
                role="button"
                tabIndex={active ? 0 : -1}
                aria-label={getAriaLabel(i)}
                aria-pressed={isSelected || undefined}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onPointClick(i)
                  }
                }}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
