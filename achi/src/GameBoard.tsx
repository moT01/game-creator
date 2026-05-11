import './GameBoard.css'

type Cell = 'P1' | 'P2' | null
type Player = 'P1' | 'P2'

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

const ADJACENCY: number[][] = [
  [1, 3, 4],
  [0, 2, 4],
  [1, 4, 5],
  [0, 4, 6],
  [0, 1, 2, 3, 5, 6, 7, 8],
  [2, 4, 8],
  [3, 4, 7],
  [4, 6, 8],
  [4, 5, 7],
]

interface Props {
  board: Cell[]
  phase: 'placement' | 'movement'
  currentPlayer: Player
  selected: number | null
  winner: Player | null
  winningLine: number[] | null
  computerPlayer: Player | null
  gameOver: boolean
  handleCellClick: (idx: number) => void
}

export default function GameBoard({ board, phase, currentPlayer, selected, winner, winningLine, computerPlayer, gameOver, handleCellClick }: Props) {
  const isComputerTurn = computerPlayer !== null && currentPlayer === computerPlayer

  const validDests = new Set<number>()
  if (phase === 'movement' && selected !== null && !gameOver && !isComputerTurn) {
    for (const adj of ADJACENCY[selected]) {
      if (board[adj] === null) validDests.add(adj)
    }
  }

  const pieceColor = (p: Player) => p === 'P1' ? 'var(--piece-blue)' : 'var(--piece-gold)'
  const winLineColor = winner === computerPlayer ? 'var(--color-danger)' : 'var(--color-success)'

  function isActive(idx: number): boolean {
    if (gameOver || isComputerTurn) return false
    if (phase === 'placement') return board[idx] === null
    if (selected === null) return board[idx] === currentPlayer
    return board[idx] === currentPlayer || validDests.has(idx)
  }

  const winPt0 = winningLine ? POINTS[winningLine[0]] : null
  const winPt2 = winningLine ? POINTS[winningLine[2]] : null

  return (
    <div className="board-container">
      <svg className="board-svg" viewBox="0 0 300 300">
        {LINES.map((line, i) => (
          <line key={i} className="board-line" x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
        ))}

        {winPt0 && winPt2 && (
          <line
            className="board-line--win"
            x1={winPt0.x} y1={winPt0.y} x2={winPt2.x} y2={winPt2.y}
            stroke={winLineColor}
          />
        )}

        {POINTS.map((pt, idx) => {
          const cell = board[idx]
          const isSel = selected === idx
          const isValidDest = validDests.has(idx) && !cell
          const active = isActive(idx)

          return (
            <g key={idx} onClick={() => { if (active) handleCellClick(idx) }}>
              <circle
                cx={pt.x} cy={pt.y} r={16}
                className={['board-point', isSel ? 'board-point-selected' : '', isValidDest ? 'board-point-valid' : ''].filter(Boolean).join(' ')}
              />
              {cell && (
                <circle
                  cx={pt.x} cy={pt.y} r={11}
                  className={['piece', `piece-${cell}`, isSel ? 'piece-selected' : ''].filter(Boolean).join(' ')}
                  style={{ fill: pieceColor(cell) }}
                />
              )}
              {isValidDest && (
                <circle cx={pt.x} cy={pt.y} r={5} className={`valid-dot valid-dot-${currentPlayer}`} style={{ fill: pieceColor(currentPlayer) }} />
              )}
              <circle
                cx={pt.x} cy={pt.y} r={22}
                fill="transparent"
                className={active ? 'point-hit point-hit-active' : 'point-hit'}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
