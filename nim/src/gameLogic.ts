export type GamePhase = 'playing' | 'game-over'
export type Mode = 'vs-computer' | '2-player'

export interface GameState {
  heaps: number[]
  currentPlayer: 0 | 1
  selectedHeap: number | null
  removeCount: number
  phase: GamePhase
  winner: 0 | 1 | null
  mode: Mode
  humanPlayer: 0 | 1
}

export function computeNimSum(heaps: number[]): number {
  return heaps.reduce((acc, h) => acc ^ h, 0)
}

export function isGameOver(heaps: number[]): boolean {
  return heaps.every(h => h === 0)
}

export function applyMove(heaps: number[], heapIndex: number, count: number): number[] {
  const next = [...heaps]
  next[heapIndex] = next[heapIndex] - count
  return next
}

export function validateMove(heaps: number[], heapIndex: number, count: number): boolean {
  if (heapIndex < 0 || heapIndex > 3) return false
  if (count < 1) return false
  if (count > heaps[heapIndex]) return false
  return true
}

export function findOptimalMove(heaps: number[]): { heap: number; count: number } {
  for (let i = 0; i < heaps.length; i++) {
    for (let n = 1; n <= heaps[i]; n++) {
      const next = applyMove(heaps, i, n)
      if (computeNimSum(next) === 0) {
        return { heap: i, count: n }
      }
    }
  }
  // Fallback: take 1 from largest heap
  let largest = 0
  for (let i = 1; i < heaps.length; i++) {
    if (heaps[i] > heaps[largest]) largest = i
  }
  return { heap: largest, count: 1 }
}

export function findRandomMove(heaps: number[]): { heap: number; count: number } {
  const nonEmpty = heaps.map((h, i) => ({ h, i })).filter(x => x.h > 0)
  const pick = nonEmpty[Math.floor(Math.random() * nonEmpty.length)]
  const count = Math.floor(Math.random() * pick.h) + 1
  return { heap: pick.i, count }
}

export function getAIMove(heaps: number[]): { heap: number; count: number } {
  return Math.random() < 0.6 ? findOptimalMove(heaps) : findRandomMove(heaps)
}
