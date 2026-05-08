import { useState, useEffect, useRef } from 'react'
import type { Cell, Player, GameState, Move } from './game'
import { other } from './game'
import type { CaptureChoice } from './hooks/useGame'
import './GameBoard.css'

const PAD = 32
const STEP = 56
const SVG_W = 512
const SVG_H = 288

function toX(col: number) { return PAD + col * STEP }
function toY(row: number) { return SVG_H - PAD - row * STEP }

interface Ghost { r: number; c: number; player: Player }
interface AnimMove { fromX: number; fromY: number; toX: number; toY: number; player: Player }

const ROWS = [0, 1, 2, 3, 4]
const COLS = [0, 1, 2, 3, 4, 5, 6, 7, 8]

const diagonals: [number, number, number, number][] = []
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 9; c++) {
    if ((r + c) % 2 === 0) {
      if (c + 1 <= 8) diagonals.push([r, c, r + 1, c + 1])
      if (c - 1 >= 0) diagonals.push([r, c, r + 1, c - 1])
    }
  }
}

interface Props {
  gameState: GameState
  selectedPiece: [number, number] | null
  legalMoves: Move[]
  captureChoice: CaptureChoice | null
  onCellClick: (pos: [number, number]) => void
  onResolveCapture: (type: 'approach' | 'withdrawal') => void
}

export default function GameBoard({ gameState, selectedPiece, legalMoves, captureChoice, onCellClick, onResolveCapture }: Props) {
  const { board, captureChain } = gameState

  const [ghosts, setGhosts] = useState<Ghost[]>([])
  const [animMove, setAnimMove] = useState<AnimMove | null>(null)
  const [hoveredDest, setHoveredDest] = useState<string | null>(null)
  const prevBoardRef = useRef<Cell[][]>(board)

  // detect captures and piece movement on board change
  useEffect(() => {
    const prev = prevBoardRef.current
    const curr = board
    prevBoardRef.current = curr

    const mover: Player = captureChain !== null
      ? gameState.currentPlayer
      : other(gameState.currentPlayer)

    const captured: Ghost[] = []
    let movedFrom: [number, number] | null = null
    let movedTo: [number, number] | null = null
    let movedFromCount = 0, movedToCount = 0

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 9; c++) {
        const was = prev[r][c]
        const is = curr[r][c]
        if (was === mover && is === null) { movedFrom = [r, c]; movedFromCount++ }
        else if (was === null && is === mover) { movedTo = [r, c]; movedToCount++ }
        else if (was !== null && is === null) captured.push({ r, c, player: was })
      }
    }

    if (captured.length > 0) {
      setGhosts(captured)
      const t = setTimeout(() => setGhosts([]), 220)
      return () => clearTimeout(t)
    }

    if (movedFromCount === 1 && movedToCount === 1 && movedFrom && movedTo) {
      setAnimMove({
        fromX: toX(movedFrom[1]), fromY: toY(movedFrom[0]),
        toX: toX(movedTo[1]), toY: toY(movedTo[0]),
        player: mover,
      })
      const t = setTimeout(() => setAnimMove(null), 160)
      return () => clearTimeout(t)
    }
  }, [board]) // eslint-disable-line react-hooks/exhaustive-deps

  // unique legal destinations
  const destSet = new Set(legalMoves.map(m => `${m.to[0]},${m.to[1]}`))
  const destinations = Array.from(new Map(legalMoves.map(m => [`${m.to[0]},${m.to[1]}`, m.to])).values())

  // capture preview for hovered destination
  const previewCaptures = new Set(
    hoveredDest
      ? legalMoves
          .filter(m => `${m.to[0]},${m.to[1]}` === hoveredDest)
          .flatMap(m => m.captured)
          .map(([r, c]) => `${r},${c}`)
      : []
  )

  function isSelected(r: number, c: number) {
    return selectedPiece?.[0] === r && selectedPiece?.[1] === c
  }

  function isChainPiece(r: number, c: number) {
    return captureChain !== null && captureChain.piece[0] === r && captureChain.piece[1] === c
  }

  function getPieceClass(r: number, c: number) {
    if (isSelected(r, c)) return 'board-piece board-piece-selected'
    if (isChainPiece(r, c)) return 'board-piece board-piece-chain'
    if (captureChain !== null) return 'board-piece board-piece-dimmed'
    return 'board-piece'
  }

  const isAnimDest = (r: number, c: number) =>
    animMove !== null && toX(c) === animMove.toX && toY(r) === animMove.toY

  let pickerX = 0, pickerY = 0
  if (captureChoice) {
    const [dr, dc] = captureChoice.approachMove.to
    const px = toX(dc) - 90
    const py = toY(dr) + 18
    pickerX = Math.max(0, Math.min(SVG_W - 180, px))
    pickerY = Math.min(SVG_H - 44, py)
  }

  return (
    <div className="board-wrapper">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="board-svg" aria-label="Fanorona board">
        <rect width={SVG_W} height={SVG_H} fill="var(--color-surface)" />

        {/* grid lines */}
        {ROWS.map(r => (
          <line key={`h${r}`} x1={PAD} y1={toY(r)} x2={SVG_W - PAD} y2={toY(r)}
            stroke="var(--color-border)" strokeWidth="1.5" />
        ))}
        {COLS.map(c => (
          <line key={`v${c}`} x1={toX(c)} y1={PAD} x2={toX(c)} y2={SVG_H - PAD}
            stroke="var(--color-border)" strokeWidth="1.5" />
        ))}
        {diagonals.map(([r1, c1, r2, c2]) => (
          <line key={`d${r1}${c1}${r2}${c2}`}
            x1={toX(c1)} y1={toY(r1)} x2={toX(c2)} y2={toY(r2)}
            stroke="var(--color-border)" strokeWidth="1.5" />
        ))}

        {/* legal move dots */}
        {destinations.map(([r, c]) => (
          <circle key={`dot${r}${c}`} cx={toX(c)} cy={toY(r)} r={8}
            fill="var(--color-accent)" opacity={0.4} pointerEvents="none" />
        ))}

        {/* capture preview highlight */}
        {Array.from(previewCaptures).map(key => {
          const [r, c] = key.split(',').map(Number)
          return (
            <circle key={`prev${key}`} cx={toX(c)} cy={toY(r)} r={22}
              fill="none" stroke="var(--color-danger)" strokeWidth={2.5}
              opacity={0.75} pointerEvents="none" />
          )
        })}

        {/* exit-animating (captured) pieces */}
        {ghosts.map(({ r, c, player }) => (
          <circle key={`ghost${r}${c}`} cx={toX(c)} cy={toY(r)} r={20}
            fill={player === 'dark' ? 'var(--piece-blue)' : 'var(--piece-gold)'}
            className="board-piece board-piece-exiting"
            pointerEvents="none" />
        ))}

        {/* pieces (skip the destination of an in-progress move animation) */}
        {board.map((row, r) => row.map((cell, c) => {
          if (!cell || isAnimDest(r, c)) return null
          return (
            <circle key={`p${r}${c}`}
              cx={toX(c)} cy={toY(r)} r={20}
              fill={cell === 'dark' ? 'var(--piece-blue)' : 'var(--piece-gold)'}
              className={getPieceClass(r, c)}
              aria-label={`${cell} piece, row ${r} column ${c}`}
              pointerEvents="none"
            />
          )
        }))}

        {/* animated moving piece */}
        {animMove && (
          <circle cx={animMove.toX} cy={animMove.toY} r={20}
            fill={animMove.player === 'dark' ? 'var(--piece-blue)' : 'var(--piece-gold)'}
            className="board-piece"
            pointerEvents="none"
          >
            <animate attributeName="cx" from={animMove.fromX} to={animMove.toX}
              dur="0.15s" fill="freeze" />
            <animate attributeName="cy" from={animMove.fromY} to={animMove.toY}
              dur="0.15s" fill="freeze" />
          </circle>
        )}

        {/* click targets */}
        {ROWS.map(r => COLS.map(c => (
          <circle key={`t${r}${c}`} cx={toX(c)} cy={toY(r)} r={24}
            fill="transparent"
            className="board-target"
            onClick={() => onCellClick([r, c])}
            onMouseEnter={() => destSet.has(`${r},${c}`) ? setHoveredDest(`${r},${c}`) : undefined}
            onMouseLeave={() => setHoveredDest(null)}
            role="button"
            aria-label={board[r][c] ? `${board[r][c]} piece row ${r} col ${c}` : `empty row ${r} col ${c}`}
          />
        )))}

        {/* capture choice picker */}
        {captureChoice && (
          <foreignObject x={pickerX} y={pickerY} width={180} height={44}>
            <div className="capture-choice">
              <button className="capture-choice-btn" onClick={() => onResolveCapture('approach')}>
                Approach
              </button>
              <button className="capture-choice-btn" onClick={() => onResolveCapture('withdrawal')}>
                Withdrawal
              </button>
            </div>
          </foreignObject>
        )}
      </svg>
    </div>
  )
}
