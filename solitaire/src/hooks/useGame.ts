import { useState, useEffect, useRef } from 'react'
import { createStorage } from './useStorage'
import {
  dealInitialState,
  drawFromStock as doDrawFromStock,
  selectCard as doSelectCard,
  attemptMove as doAttemptMove,
  autoCompleteStep,
} from '../gameLogic'
import type { GameState, GameOptions } from '../gameLogic'

export type { GameState }

const gameStorage = createStorage<GameState>('solitaire_state')
const wins1Storage = createStorage<number>('solitaire_wins_draw1')
const wins3Storage = createStorage<number>('solitaire_wins_draw3')
const best1Storage = createStorage<number>('solitaire_best_draw1')
const best3Storage = createStorage<number>('solitaire_best_draw3')

function recordWin(s: GameState) {
  const winsStorage = s.drawCount === 1 ? wins1Storage : wins3Storage
  const bestStorage = s.drawCount === 1 ? best1Storage : best3Storage
  winsStorage.save((winsStorage.load() ?? 0) + 1)
  const prev = bestStorage.load()
  if (prev === null || s.elapsedSeconds < prev) bestStorage.save(s.elapsedSeconds)
  gameStorage.clear()
}

export function useGame(options: GameOptions, paused = false) {
  const [state, setState] = useState<GameState>(() => {
    const saved = gameStorage.load()
    return saved?.phase === 'playing' ? { ...saved, timerActive: true } : dealInitialState(options)
  })

  const stateRef = useRef(state)
  stateRef.current = state

  function commit(next: GameState) {
    if (next.phase === 'won') recordWin(next)
    else gameStorage.save(next)
    setState(next)
  }

  useEffect(() => {
    if (!state.timerActive || paused) return
    const id = setInterval(() => {
      const s = stateRef.current
      const next = { ...s, elapsedSeconds: s.elapsedSeconds + 1 }
      gameStorage.save(next)
      setState(next)
    }, 1000)
    return () => clearInterval(id)
  }, [state.timerActive, paused])

  useEffect(() => {
    if (!state.autoCompleting) return
    const id = setInterval(() => {
      const next = autoCompleteStep(stateRef.current)
      if (next.phase === 'won') recordWin(next)
      else gameStorage.save(next)
      setState(next)
    }, 300)
    return () => clearInterval(id)
  }, [state.autoCompleting])

  const drawFromStock = () => commit(doDrawFromStock(stateRef.current))
  const selectCard = (source: 'tableau' | 'waste', colIndex: number | null, cardIndex: number | null) =>
    commit(doSelectCard(stateRef.current, source, colIndex, cardIndex))
  const attemptMove = (target: 'tableau' | 'foundation', targetIndex: number) =>
    commit(doAttemptMove(stateRef.current, target, targetIndex))

  return { state, drawFromStock, selectCard, attemptMove }
}
