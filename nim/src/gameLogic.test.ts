import { describe, it, expect } from 'vitest'
import {
  computeNimSum,
  isGameOver,
  applyMove,
  validateMove,
  findOptimalMove,
} from './gameLogic'

describe('computeNimSum', () => {
  it('returns 0 for [1,3,5,7]', () => {
    expect(computeNimSum([1, 3, 5, 7])).toBe(0)
  })

  it('returns 0 for [1,2,3]', () => {
    expect(computeNimSum([1, 2, 3])).toBe(0)
  })

  it('returns 1 for [0,0,0,1]', () => {
    expect(computeNimSum([0, 0, 0, 1])).toBe(1)
  })

  it('returns 1 for [3,5,7]', () => {
    expect(computeNimSum([3, 5, 7])).toBe(1)
  })
})

describe('isGameOver', () => {
  it('returns true for [0,0,0,0]', () => {
    expect(isGameOver([0, 0, 0, 0])).toBe(true)
  })

  it('returns false for [0,0,0,1]', () => {
    expect(isGameOver([0, 0, 0, 1])).toBe(false)
  })
})

describe('applyMove', () => {
  it('returns [1,1,5,7] for applyMove([1,3,5,7], 1, 2)', () => {
    expect(applyMove([1, 3, 5, 7], 1, 2)).toEqual([1, 1, 5, 7])
  })

  it('returns [0,0,0,0] for applyMove([0,0,0,1], 3, 1)', () => {
    expect(applyMove([0, 0, 0, 1], 3, 1)).toEqual([0, 0, 0, 0])
  })
})

describe('validateMove', () => {
  it('returns true for validateMove([1,3,5,7], 1, 3)', () => {
    expect(validateMove([1, 3, 5, 7], 1, 3)).toBe(true)
  })

  it('returns false when count exceeds heap size', () => {
    expect(validateMove([1, 3, 5, 7], 1, 4)).toBe(false)
  })

  it('returns false when count is 0', () => {
    expect(validateMove([1, 3, 5, 7], 1, 0)).toBe(false)
  })
})

describe('findOptimalMove', () => {
  it('falls back to take 1 from largest heap when nim-sum is already 0', () => {
    // [1,3,5,7] has nim-sum 0 — fall back to largest heap (index 3, size 7)
    const move = findOptimalMove([1, 3, 5, 7])
    expect(move).toEqual({ heap: 3, count: 1 })
  })

  it('returns a move that makes nim-sum 0 for [0,3,5,7]', () => {
    // nim-sum of [0,3,5,7] = 1; taking 1 from heap 1 gives [0,2,5,7], nim-sum=0
    const move = findOptimalMove([0, 3, 5, 7])
    const result = applyMove([0, 3, 5, 7], move.heap, move.count)
    expect(computeNimSum(result)).toBe(0)
  })

  it('result always passes validateMove', () => {
    const heaps = [0, 3, 5, 7]
    const move = findOptimalMove(heaps)
    expect(validateMove(heaps, move.heap, move.count)).toBe(true)
  })

  it('win detected after applyMove([0,0,0,1], 3, 1)', () => {
    const result = applyMove([0, 0, 0, 1], 3, 1)
    expect(isGameOver(result)).toBe(true)
  })
})
