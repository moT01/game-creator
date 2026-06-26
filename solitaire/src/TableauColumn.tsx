import type { Card, Selection } from './gameLogic'
import './TableauColumn.css'

const RANK_LABELS: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }
const SUIT_SYMS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }
const rankLabel = (r: number) => RANK_LABELS[r] ?? String(r)
const suitSym = (s: string) => SUIT_SYMS[s as keyof typeof SUIT_SYMS]
const isRed = (s: string) => s === 'hearts' || s === 'diamonds'

interface Props {
  cards: Card[]
  colIndex: number
  selected: Selection | null
  selectCard: (source: 'tableau' | 'waste', colIndex: number | null, cardIndex: number | null) => void
  attemptMove: (target: 'tableau' | 'foundation', targetIndex: number) => void
}

function isCardSelected(selected: Selection | null, colIndex: number, cardIndex: number): boolean {
  return (
    selected?.source === 'tableau' &&
    selected.colIndex === colIndex &&
    selected.cardIndex !== null &&
    cardIndex >= selected.cardIndex
  )
}

export default function TableauColumn({ cards, colIndex, selected, selectCard, attemptMove }: Props) {
  if (cards.length === 0) {
    return (
      <button
        className="pile-placeholder tableau-empty"
        onClick={() => { if (selected) attemptMove('tableau', colIndex) }}
        aria-label={`Tableau column ${colIndex + 1}, empty`}
      />
    )
  }

  return (
    <div className="tableau-col" aria-label={`Tableau column ${colIndex + 1}`}>
      {cards.map((card, cardIdx) => {
        const sel = isCardSelected(selected, colIndex, cardIdx)
        if (!card.faceUp) {
          return (
            <div
              key={card.id}
              className={`playing-card card-back tableau-card${cardIdx > 0 ? ' tableau-overlap-down' : ''}`}
              aria-hidden="true"
            />
          )
        }
        return (
          <button
            key={card.id}
            className={`playing-card card-face ${isRed(card.suit) ? 'card-red' : 'card-black'} tableau-card tableau-face-up${cardIdx > 0 ? ' tableau-overlap-up' : ''}${sel ? ' card-selected' : ''}`}
            onClick={() => selectCard('tableau', colIndex, cardIdx)}
            aria-label={`${rankLabel(card.rank)} of ${card.suit}${sel ? ', selected' : ''}`}
          >
            <span className="card-corner"><span className="card-rank">{rankLabel(card.rank)}</span><span className="card-suit-small">{suitSym(card.suit)}</span></span>
            <span className="card-center-suit">{suitSym(card.suit)}</span>
            <span className="card-corner card-corner-br"><span className="card-rank">{rankLabel(card.rank)}</span><span className="card-suit-small">{suitSym(card.suit)}</span></span>
          </button>
        )
      })}
    </div>
  )
}
