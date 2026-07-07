import { useRef, useState } from 'react'
import type { Board as BoardType, Mode, Player } from '../gameLogic'
import { Square } from './Square'
import './Board.css'

interface Props {
  board: BoardType
  selectedIndex: number | null
  validMoveDestinations: number[]
  jumpDestinations: number[]
  currentTurn: Player
  onSquareClick: (index: number) => void
  disabled: boolean
  flipped?: boolean
  mode: Mode
  playerSide: Player
}

export function Board({ board, selectedIndex, validMoveDestinations, jumpDestinations, currentTurn, onSquareClick, disabled, flipped, mode, playerSide }: Props) {
  const indices = flipped
    ? Array.from({ length: 64 }, (_, i) => 63 - i)
    : Array.from({ length: 64 }, (_, i) => i)

  const boardRef = useRef<HTMLDivElement>(null)
  const [rovingIndex, setRovingIndex] = useState(1)

  function getPlayerLabel(player: Player): string {
    if (mode === 'vs-computer') {
      return player === playerSide ? 'Your' : "Opponent's"
    }
    return player === 'Light' ? "Player 1's" : "Player 2's"
  }

  function getNeighborIndex(boardIndex: number, key: string): number | null {
    const row = Math.floor(boardIndex / 8)
    const col = boardIndex % 8
    const diagonals: Record<string, [number, number]> = flipped
      ? { ArrowLeft: [1, 1], ArrowUp: [1, -1], ArrowRight: [-1, -1], ArrowDown: [-1, 1] }
      : { ArrowLeft: [-1, -1], ArrowUp: [-1, 1], ArrowRight: [1, 1], ArrowDown: [1, -1] }
    const delta = diagonals[key]
    if (!delta) return null
    const newRow = row + delta[0]
    const newCol = col + delta[1]
    if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) return null
    return newRow * 8 + newCol
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const neighbor = getNeighborIndex(rovingIndex, e.key)
    if (neighbor === null) return
    e.preventDefault()
    setRovingIndex(neighbor)
    boardRef.current
      ?.querySelector<HTMLButtonElement>(`[data-board-index="${neighbor}"]`)
      ?.focus()
  }

  return (
    <div
      ref={boardRef}
      className={`board${disabled ? ' board--disabled' : ''} board--turn-${currentTurn.toLowerCase()}`}
      onKeyDown={handleKeyDown}
    >
      {indices.map((index, visualPos) => {
        const row = Math.floor(index / 8)
        const col = index % 8
        const isDark = (row + col) % 2 === 1
        const visualRow = Math.floor(visualPos / 8) + 1
        const visualCol = (visualPos % 8) + 1
        return (
          <Square
            key={index}
            piece={board[index]}
            isDark={isDark}
            isSelected={index === selectedIndex}
            isValidDestination={validMoveDestinations.includes(index)}
            isJumpDestination={jumpDestinations.includes(index)}
            onClick={() => onSquareClick(index)}
            row={visualRow}
            col={visualCol}
            getPlayerLabel={getPlayerLabel}
            boardIndex={index}
            tabIndex={index === rovingIndex ? 0 : -1}
            onFocus={() => setRovingIndex(index)}
          />
        )
      })}
    </div>
  )
}
