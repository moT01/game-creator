import type { Card, Selection } from './gameLogic'
import './WastePile.css'

const RANK_LABELS: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }
const SUIT_SYMS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }
const rankLabel = (r: number) => RANK_LABELS[r] ?? String(r)
const suitSym = (s: string) => SUIT_SYMS[s as keyof typeof SUIT_SYMS]
const isRed = (s: string) => s === 'hearts' || s === 'diamonds'

function CardFace({ card, selected = false, onClick, interactive = false }: {
  card: Card
  selected?: boolean
  onClick?: () => void
  interactive?: boolean
}) {
  const cls = `playing-card card-face ${isRed(card.suit) ? 'card-red' : 'card-black'}${selected ? ' card-selected' : ''}`
  return interactive ? (
    <button className={cls} onClick={onClick} aria-label={`Waste: ${rankLabel(card.rank)} of ${card.suit}`}>
      <span className="card-corner"><span className="card-rank">{rankLabel(card.rank)}</span><span className="card-suit-small">{suitSym(card.suit)}</span></span>
      <span className="card-center-suit">{suitSym(card.suit)}</span>
      <span className="card-corner card-corner-br"><span className="card-rank">{rankLabel(card.rank)}</span><span className="card-suit-small">{suitSym(card.suit)}</span></span>
    </button>
  ) : (
    <div className={cls} aria-hidden="true">
      <span className="card-corner"><span className="card-rank">{rankLabel(card.rank)}</span><span className="card-suit-small">{suitSym(card.suit)}</span></span>
      <span className="card-center-suit">{suitSym(card.suit)}</span>
      <span className="card-corner card-corner-br"><span className="card-rank">{rankLabel(card.rank)}</span><span className="card-suit-small">{suitSym(card.suit)}</span></span>
    </div>
  )
}

interface Props {
  waste: Card[]
  drawCount: 1 | 3
  selected: Selection | null
  onSelect: () => void
}

export default function WastePile({ waste, drawCount, selected, onSelect }: Props) {
  if (waste.length === 0) {
    return <div className="pile-placeholder" aria-label="Waste pile empty" />
  }

  const isSelected = selected?.source === 'waste'

  if (drawCount === 1) {
    return <CardFace card={waste[waste.length - 1]} selected={isSelected} onClick={onSelect} interactive />
  }

  const visible = waste.slice(-Math.min(3, waste.length))
  return (
    <div
      className="waste-fan"
      style={{ width: `calc(var(--card-w) + ${(visible.length - 1) * 16}px)` }}
    >
      {visible.map((card, i) => {
        const isTop = i === visible.length - 1
        return (
          <div key={card.id} className="waste-fan-card" style={{ left: `${i * 16}px` }}>
            <CardFace card={card} selected={isTop && isSelected} onClick={onSelect} interactive={isTop} />
          </div>
        )
      })}
    </div>
  )
}
