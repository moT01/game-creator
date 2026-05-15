import { useMemo } from 'react'
import { getAdjacentEmpties, getCapturableCells, wouldFormExactRow } from './hooks/useGame'
import type { GameState, Player } from './hooks/useGame'
import './GameBoard.css'

interface Props {
  state: GameState
  onCellClick: (row: number, col: number) => void
}

export default function GameBoard({ state, onCellClick }: Props) {
  const { board, phase, moveSubPhase, currentPlayer, selectedCell, formedRow } = state

  const validDestSet = useMemo(() => {
    const s = new Set<string>()
    if (phase === 'movement' && moveSubPhase === 'select-destination' && selectedCell) {
      getAdjacentEmpties(board, selectedCell[0], selectedCell[1]).forEach(([r, c]) => s.add(`${r},${c}`))
    }
    return s
  }, [phase, moveSubPhase, selectedCell, board])

  const capturableSet = useMemo(() => {
    const s = new Set<string>()
    if (phase === 'movement' && moveSubPhase === 'select-capture') {
      const opp: Player = currentPlayer === 'r' ? 'b' : 'r'
      getCapturableCells(board, opp).forEach(([r, c]) => s.add(`${r},${c}`))
    }
    return s
  }, [phase, moveSubPhase, currentPlayer, board])

  const invalidPlacementSet = useMemo(() => {
    const s = new Set<string>()
    if (phase === 'placement') {
      for (let r = 0; r < 5; r++)
        for (let c = 0; c < 6; c++)
          if (!board[r][c] && wouldFormExactRow(board, r, c, currentPlayer)) s.add(`${r},${c}`)
    }
    return s
  }, [phase, board, currentPlayer])

  const formedRowSet = useMemo(() => {
    const s = new Set<string>()
    formedRow?.forEach(([r, c]) => s.add(`${r},${c}`))
    return s
  }, [formedRow])

  return (
    <div className="board-container">
      <div className="board-grid" data-player={currentPlayer}>
        {board.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`
            const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c
            const isValidDest = validDestSet.has(key)
            const isCapturable = capturableSet.has(key)
            const isFormedRow = formedRowSet.has(key)

            const isInvalidPlacement = invalidPlacementSet.has(key)

            const classes = ['board-cell']
            if (isSelected) classes.push('cell-selected')
            if (isFormedRow) classes.push('cell-formed-row')
            if (isCapturable) classes.push('cell-capturable')
            if (isValidDest) classes.push('cell-valid-dest')
            if (isInvalidPlacement) classes.push('cell-invalid-placement')

            return (
              <div
                key={key}
                className={classes.join(' ')}
                onClick={() => onCellClick(r, c)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onCellClick(r, c)}
                aria-label={`Row ${r + 1} column ${c + 1}`}
              >
                {cell && <div className={`piece piece-${cell}`} />}
                {isValidDest && !cell && <div className="valid-dot" />}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
