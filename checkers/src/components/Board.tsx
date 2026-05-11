import type { Board as BoardType, Player } from '../gameLogic'
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
}

export function Board({ board, selectedIndex, validMoveDestinations, jumpDestinations, currentTurn, onSquareClick, disabled, flipped }: Props) {
  const indices = flipped
    ? Array.from({ length: 64 }, (_, i) => 63 - i)
    : Array.from({ length: 64 }, (_, i) => i)

  return (
    <div className={`board${disabled ? ' board--disabled' : ''} board--turn-${currentTurn.toLowerCase()}`}>
      {indices.map(index => {
        const row = Math.floor(index / 8)
        const col = index % 8
        const isDark = (row + col) % 2 === 1
        return (
          <Square
            key={index}
            piece={board[index]}
            isDark={isDark}
            isSelected={index === selectedIndex}
            isValidDestination={validMoveDestinations.includes(index)}
            isJumpDestination={jumpDestinations.includes(index)}
            onClick={() => onSquareClick(index)}
            disabled={disabled}
          />
        )
      })}
    </div>
  )
}
