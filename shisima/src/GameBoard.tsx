import './GameBoard.css'

const POINTS = [
  { x: 150, y: 35 },
  { x: 231, y: 69 },
  { x: 265, y: 150 },
  { x: 231, y: 231 },
  { x: 150, y: 265 },
  { x: 69, y: 231 },
  { x: 35, y: 150 },
  { x: 69, y: 69 },
  { x: 150, y: 150 },
]

const LINES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8],
]

interface Props {
  board: (0 | 1 | 2)[]
  selectedPoint: number | null
  validMoves: number[]
  currentPlayer: 1 | 2
  isHumanTurn: boolean
  phase: 'playing' | 'over'
  onPointClick: (index: number) => void
}

export default function GameBoard({
  board,
  selectedPoint,
  validMoves,
  currentPlayer,
  isHumanTurn,
  phase,
  onPointClick,
}: Props) {
  function getPointClass(i: number): string {
    if (i === selectedPoint) return 'board-point board-point-selected'
    if (validMoves.includes(i) && board[i] === 0) return 'board-point board-point-valid'
    return 'board-point'
  }

  function isInteractive(i: number): boolean {
    if (phase !== 'playing' || !isHumanTurn) return false
    if (board[i] === currentPlayer) return true
    if (selectedPoint !== null && validMoves.includes(i) && board[i] === 0) return true
    return false
  }

  function getAriaLabel(i: number): string {
    const label = i === 8 ? 'Center point' : `Point ${i}`
    if (board[i] === 0) {
      if (validMoves.includes(i)) return `${label}, valid move`
      return `${label}, empty`
    }
    if (board[i] === currentPlayer) return `${label}, your piece`
    return `${label}, opponent piece`
  }

  return (
    <div className="board-container">
      <svg
        viewBox="0 0 300 300"
        className="board-svg"
        aria-label="Shisima game board"
      >
        {LINES.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={POINTS[a].x} y1={POINTS[a].y}
            x2={POINTS[b].x} y2={POINTS[b].y}
            className="board-line"
          />
        ))}
        {POINTS.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x} cy={pt.y} r={20}
              className={getPointClass(i)}
            />
            {board[i] !== 0 && (
              <circle
                key={`piece-${i}-${board[i]}`}
                cx={pt.x} cy={pt.y} r={13}
                className={`piece piece-${board[i]}${selectedPoint === i ? ' piece-selected' : ''}`}
              />
            )}
            {validMoves.includes(i) && board[i] === 0 && (
              <circle
                cx={pt.x} cy={pt.y} r={5}
                className={`valid-dot valid-dot-${currentPlayer}`}
              />
            )}
            <circle
              cx={pt.x} cy={pt.y} r={22}
              fill="transparent"
              className={`point-hit${isInteractive(i) ? ' point-hit-active' : ''}`}
              role="button"
              tabIndex={isInteractive(i) ? 0 : -1}
              aria-label={getAriaLabel(i)}
              aria-pressed={i === selectedPoint}
              onClick={() => onPointClick(i)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onPointClick(i)
                }
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
