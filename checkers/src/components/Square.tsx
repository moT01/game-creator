import type { Piece as PieceType, Player } from '../gameLogic'
import { Piece } from './Piece'
import './Square.css'

interface Props {
  piece: PieceType | null
  isDark: boolean
  isSelected: boolean
  isValidDestination: boolean
  isJumpDestination: boolean
  onClick: () => void
  row: number
  col: number
  getPlayerLabel: (player: Player) => string
  boardIndex: number
  tabIndex: number
  onFocus: () => void
}

export function Square({ piece, isDark, isSelected, isValidDestination, isJumpDestination, onClick, row, col, getPlayerLabel, boardIndex, tabIndex, onFocus }: Props) {
  const classes = [
    'square',
    isDark ? 'square--dark' : 'square--light',
    isSelected ? 'square--selected' : '',
    isValidDestination ? 'square--valid-destination' : '',
  ].filter(Boolean).join(' ')

  if (!isDark) {
    return <div className={classes} />
  }

  const pieceDesc = piece
    ? `${getPlayerLabel(piece.player)} ${piece.type === 'king' ? 'King' : 'piece'}`
    : ''
  const selectedHint = isSelected ? ', selected' : ''
  const moveHint = isValidDestination ? ', valid move' : ''
  const label = pieceDesc
    ? `Row ${row}, Column ${col}, ${pieceDesc}${selectedHint}${moveHint}`
    : `Row ${row}, Column ${col}${moveHint}`

  return (
    <button
      className={classes}
      onClick={onClick}
      aria-label={label}
      data-board-index={boardIndex}
      tabIndex={tabIndex}
      onFocus={onFocus}
    >
      {piece && <Piece piece={piece} />}
      {isValidDestination && <div className="square__highlight" />}
      {isJumpDestination && <div className="square__capture-ring" />}
    </button>
  )
}
