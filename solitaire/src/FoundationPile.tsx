import type { Card, Suit, Selection } from './gameLogic'

const SUIT_SYMS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }
const FOUNDATION_SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const RANK_LABELS: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }
const rankLabel = (r: number) => RANK_LABELS[r] ?? String(r)
const isRed = (s: string) => s === 'hearts' || s === 'diamonds'

interface Props {
  cards: Card[]
  index: number
  selected: Selection | null
  onAttemptMove: () => void
}

export default function FoundationPile({ cards, index, selected, onAttemptMove }: Props) {
  const suit = FOUNDATION_SUITS[index]
  const sym = SUIT_SYMS[suit]

  if (cards.length === 0) {
    return (
      <button
        className={`pile-placeholder foundation-empty ${isRed(suit) ? 'foundation-red' : ''}`}
        onClick={() => { if (selected) onAttemptMove() }}
        aria-label={`Foundation ${suit}, empty`}
      >
        {sym}
      </button>
    )
  }

  const top = cards[cards.length - 1]
  return (
    <button
      className={`playing-card card-face ${isRed(top.suit) ? 'card-red' : 'card-black'}`}
      onClick={() => { if (selected) onAttemptMove() }}
      aria-label={`Foundation ${suit}: ${rankLabel(top.rank)}`}
    >
      <span className="card-corner"><span className="card-rank">{rankLabel(top.rank)}</span><span className="card-suit-small">{SUIT_SYMS[top.suit]}</span></span>
      <span className="card-center-suit">{SUIT_SYMS[top.suit]}</span>
      <span className="card-corner card-corner-br"><span className="card-rank">{rankLabel(top.rank)}</span><span className="card-suit-small">{SUIT_SYMS[top.suit]}</span></span>
    </button>
  )
}
