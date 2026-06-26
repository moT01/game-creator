import type { GameState } from './gameLogic'
import StockPile from './StockPile'
import WastePile from './WastePile'
import FoundationPile from './FoundationPile'
import TableauColumn from './TableauColumn'
import './GameBoard.css'

interface Props {
  state: GameState
  drawFromStock: () => void
  selectCard: (source: 'tableau' | 'waste', colIndex: number | null, cardIndex: number | null) => void
  attemptMove: (target: 'tableau' | 'foundation', targetIndex: number) => void
}

export default function GameBoard({ state, drawFromStock, selectCard, attemptMove }: Props) {
  const { tableau, foundations, stock, waste, selected } = state
  return (
    <div className="game-board">
      <div className="board-top">
        <StockPile stock={stock} onClick={drawFromStock} />
        <WastePile waste={waste} drawCount={state.drawCount} selected={selected} onSelect={() => selectCard('waste', null, null)} />
        <div className="board-top-gap" />
        {foundations.map((cards, i) => (
          <FoundationPile
            key={i}
            cards={cards}
            index={i}
            selected={selected}
            onAttemptMove={() => attemptMove('foundation', i)}
          />
        ))}
      </div>
      <div className="board-tableau">
        {tableau.map((cards, i) => (
          <TableauColumn
            key={i}
            cards={cards}
            colIndex={i}
            selected={selected}
            selectCard={selectCard}
            attemptMove={attemptMove}
          />
        ))}
      </div>
    </div>
  )
}
