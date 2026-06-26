import type { Card } from './gameLogic'

interface Props {
  stock: Card[]
  onClick: () => void
}

export default function StockPile({ stock, onClick }: Props) {
  if (stock.length > 0) {
    return (
      <button
        className="playing-card card-back"
        onClick={onClick}
        aria-label={`Stock: ${stock.length} cards remaining`}
      />
    )
  }
  return (
    <button
      className="pile-placeholder"
      onClick={onClick}
      aria-label="Stock empty, click to reset"
    >
      ♻
    </button>
  )
}
