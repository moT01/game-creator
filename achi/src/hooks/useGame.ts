import { useState, useEffect, useRef, useCallback } from 'react'
import { createStorage } from './useStorage'
import type { GameOptions } from '../HomeOptions'

type Cell = 'P1' | 'P2' | null
type Player = 'P1' | 'P2'

export interface GameState {
  board: Cell[]
  currentPlayer: Player
  selected: number | null
  winner: Player | null
  winningLine: number[] | null
  noMovesPlayer: Player | null
  moveCount: number
}

const gameStorage = createStorage<GameState>('achi_state')
const winsStorage = createStorage<{ player: number; computer: number }>('achi_wins')

const ADJACENCY: number[][] = [
  [1, 3, 4],
  [0, 2, 4],
  [1, 4, 5],
  [0, 4, 6],
  [0, 1, 2, 3, 5, 6, 7, 8],
  [2, 4, 8],
  [3, 4, 7],
  [4, 6, 8],
  [4, 5, 7],
]

const WINNING_LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

function getPhase(board: Cell[]): 'placement' | 'movement' {
  return board.filter(Boolean).length < 8 ? 'placement' : 'movement'
}

function checkWinner(board: Cell[]): { winner: Player; line: number[] } | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line }
    }
  }
  return null
}

function getValidMoves(board: Cell[], player: Player): { from: number; to: number }[] {
  const moves: { from: number; to: number }[] = []
  for (let i = 0; i < 9; i++) {
    if (board[i] === player) {
      for (const adj of ADJACENCY[i]) {
        if (board[adj] === null) moves.push({ from: i, to: adj })
      }
    }
  }
  return moves
}

function hasNoMoves(board: Cell[], player: Player): boolean {
  return getValidMoves(board, player).length === 0
}

function applyPlacement(board: Cell[], idx: number, player: Player): Cell[] {
  const next = [...board]
  next[idx] = player
  return next
}

function applySlide(board: Cell[], from: number, to: number): Cell[] {
  const next = [...board]
  next[to] = next[from]
  next[from] = null
  return next
}

function opposite(player: Player): Player {
  return player === 'P1' ? 'P2' : 'P1'
}

function evaluate(board: Cell[], aiPlayer: Player): number {
  const human = opposite(aiPlayer)
  let score = 0
  for (const line of WINNING_LINES) {
    const [a, b, c] = line
    const cells = [board[a], board[b], board[c]]
    const aiCount = cells.filter(x => x === aiPlayer).length
    const oppCount = cells.filter(x => x === human).length
    if (oppCount === 0) {
      if (aiCount === 2) score += 3
      else if (aiCount === 1) score += 1
    } else if (aiCount === 0) {
      if (oppCount === 2) score -= 3
      else if (oppCount === 1) score -= 1
    }
  }
  return score
}

function minimax(
  board: Cell[],
  currentPlayer: Player,
  aiPlayer: Player,
  depth: number,
  alpha: number,
  beta: number,
  moveCount: number
): number {
  const winResult = checkWinner(board)
  if (winResult) return winResult.winner === aiPlayer ? 100 : -100

  const phase = getPhase(board)
  if (phase === 'movement') {
    if (moveCount >= 50) return 0
    if (hasNoMoves(board, currentPlayer)) return currentPlayer === aiPlayer ? -100 : 100
  }
  if (depth === 0) return evaluate(board, aiPlayer)

  const isMax = currentPlayer === aiPlayer
  let best = isMax ? -Infinity : Infinity

  if (phase === 'placement') {
    for (let i = 0; i < 9; i++) {
      if (board[i] !== null) continue
      const next = applyPlacement(board, i, currentPlayer)
      const score = minimax(next, opposite(currentPlayer), aiPlayer, depth - 1, alpha, beta, moveCount)
      if (isMax) { best = Math.max(best, score); alpha = Math.max(alpha, best) }
      else { best = Math.min(best, score); beta = Math.min(beta, best) }
      if (beta <= alpha) break
    }
  } else {
    for (const move of getValidMoves(board, currentPlayer)) {
      const next = applySlide(board, move.from, move.to)
      const score = minimax(next, opposite(currentPlayer), aiPlayer, depth - 1, alpha, beta, moveCount + 1)
      if (isMax) { best = Math.max(best, score); alpha = Math.max(alpha, best) }
      else { best = Math.min(best, score); beta = Math.min(beta, best) }
      if (beta <= alpha) break
    }
  }
  return best
}

function getBestMove(state: GameState, aiPlayer: Player): number | { from: number; to: number } {
  const { board, moveCount } = state
  const phase = getPhase(board)
  let bestScore = -Infinity

  if (phase === 'placement') {
    const bestMoves: number[] = []
    for (let i = 0; i < 9; i++) {
      if (board[i] !== null) continue
      const next = applyPlacement(board, i, aiPlayer)
      const score = minimax(next, opposite(aiPlayer), aiPlayer, 4, -Infinity, Infinity, moveCount)
      if (score > bestScore) { bestScore = score; bestMoves.length = 0; bestMoves.push(i) }
      else if (score === bestScore) bestMoves.push(i)
    }
    return bestMoves[Math.floor(Math.random() * bestMoves.length)]
  } else {
    const bestMoves: { from: number; to: number }[] = []
    for (const move of getValidMoves(board, aiPlayer)) {
      const next = applySlide(board, move.from, move.to)
      const score = minimax(next, opposite(aiPlayer), aiPlayer, 4, -Infinity, Infinity, moveCount + 1)
      if (score > bestScore) { bestScore = score; bestMoves.length = 0; bestMoves.push(move) }
      else if (score === bestScore) bestMoves.push(move)
    }
    return bestMoves[Math.floor(Math.random() * bestMoves.length)]
  }
}

const INITIAL_STATE: GameState = {
  board: Array(9).fill(null),
  currentPlayer: 'P1',
  selected: null,
  winner: null,
  winningLine: null,
  noMovesPlayer: null,
  moveCount: 0,
}

export { INITIAL_STATE }

export function useGame(options: GameOptions) {
  const computerPlayer: Player | null = options.opponent === 'computer'
    ? (options.side === 'P1' ? 'P2' : 'P1')
    : null

  const [state, setState] = useState<GameState>(() => gameStorage.load() ?? INITIAL_STATE)
  const stateRef = useRef(state)
  stateRef.current = state

  const phase = getPhase(state.board)
  const gameOver = state.winner !== null || state.noMovesPlayer !== null || state.moveCount >= 50

  useEffect(() => {
    if (gameOver) gameStorage.clear()
    else gameStorage.save(state)
  }, [state, gameOver])

  const winsRecordedRef = useRef(false)
  useEffect(() => {
    if (!gameOver || !computerPlayer || winsRecordedRef.current) return
    if (state.moveCount >= 50) return
    if (state.winner === null && state.noMovesPlayer === null) return
    winsRecordedRef.current = true
    const isHumanWin = state.winner
      ? state.winner !== computerPlayer
      : state.noMovesPlayer === computerPlayer
    const wins = winsStorage.load() ?? { player: 0, computer: 0 }
    winsStorage.save(isHumanWin
      ? { ...wins, player: wins.player + 1 }
      : { ...wins, computer: wins.computer + 1 })
  }, [gameOver, computerPlayer, state.winner, state.noMovesPlayer, state.moveCount])

  useEffect(() => {
    if (!computerPlayer || gameOver || state.currentPlayer !== computerPlayer) return
    const timer = setTimeout(() => {
      const s = stateRef.current
      if (s.currentPlayer !== computerPlayer) return
      const move = getBestMove(s, computerPlayer)
      setState(prev => {
        if (prev.currentPlayer !== computerPlayer) return prev
        const p = getPhase(prev.board)
        let newBoard: Cell[]
        if (p === 'placement' && typeof move === 'number') {
          newBoard = applyPlacement(prev.board, move, computerPlayer)
        } else if (p === 'movement' && typeof move === 'object') {
          newBoard = applySlide(prev.board, move.from, move.to)
        } else return prev

        const winResult = checkWinner(newBoard)
        const nextPlayer = opposite(prev.currentPlayer)
        const newMoveCount = p === 'movement' ? prev.moveCount + 1 : prev.moveCount

        if (winResult) return { ...prev, board: newBoard, winner: winResult.winner, winningLine: winResult.line, selected: null, currentPlayer: nextPlayer, moveCount: newMoveCount }
        if (p === 'movement' && newMoveCount >= 50) return { ...prev, board: newBoard, currentPlayer: nextPlayer, selected: null, moveCount: newMoveCount }
        if (p === 'movement' && hasNoMoves(newBoard, nextPlayer)) return { ...prev, board: newBoard, currentPlayer: nextPlayer, selected: null, noMovesPlayer: nextPlayer, moveCount: newMoveCount }
        return { ...prev, board: newBoard, currentPlayer: nextPlayer, selected: null, moveCount: newMoveCount }
      })
    }, 450)
    return () => clearTimeout(timer)
  }, [state.currentPlayer, gameOver, computerPlayer])

  const handleCellClick = useCallback((idx: number) => {
    setState(prev => {
      const go = prev.winner !== null || prev.noMovesPlayer !== null || prev.moveCount >= 50
      if (go) return prev
      if (computerPlayer && prev.currentPlayer === computerPlayer) return prev

      const p = getPhase(prev.board)

      if (p === 'placement') {
        if (prev.board[idx] !== null) return prev
        const newBoard = applyPlacement(prev.board, idx, prev.currentPlayer)
        const winResult = checkWinner(newBoard)
        const nextPlayer = opposite(prev.currentPlayer)
        if (winResult) return { ...prev, board: newBoard, winner: winResult.winner, winningLine: winResult.line, selected: null, currentPlayer: nextPlayer }
        return { ...prev, board: newBoard, currentPlayer: nextPlayer, selected: null }
      }

      if (prev.selected === null) {
        if (prev.board[idx] === prev.currentPlayer) return { ...prev, selected: idx }
        return prev
      }
      if (prev.board[idx] === prev.currentPlayer) return { ...prev, selected: idx }
      if (!ADJACENCY[prev.selected].includes(idx) || prev.board[idx] !== null) return prev

      const newBoard = applySlide(prev.board, prev.selected, idx)
      const winResult = checkWinner(newBoard)
      const nextPlayer = opposite(prev.currentPlayer)
      const newMoveCount = prev.moveCount + 1

      if (winResult) return { ...prev, board: newBoard, winner: winResult.winner, winningLine: winResult.line, selected: null, currentPlayer: nextPlayer, moveCount: newMoveCount }
      if (newMoveCount >= 50) return { ...prev, board: newBoard, currentPlayer: nextPlayer, selected: null, moveCount: newMoveCount }
      if (hasNoMoves(newBoard, nextPlayer)) return { ...prev, board: newBoard, currentPlayer: nextPlayer, selected: null, noMovesPlayer: nextPlayer, moveCount: newMoveCount }
      return { ...prev, board: newBoard, currentPlayer: nextPlayer, selected: null, moveCount: newMoveCount }
    })
  }, [computerPlayer])

  return {
    board: state.board,
    phase,
    currentPlayer: state.currentPlayer,
    selected: state.selected,
    winner: state.winner,
    winningLine: state.winningLine,
    noMovesPlayer: state.noMovesPlayer,
    moveCount: state.moveCount,
    gameOver,
    computerPlayer,
    handleCellClick,
  }
}
