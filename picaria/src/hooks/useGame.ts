import { useState, useEffect, useRef } from 'react'
import { createStorage } from './useStorage'
import type { GameOptions } from '../HomeOptions'

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

const WIN_LINES: [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

export interface GameState {
  board: (0 | 1 | 2)[]
  currentPlayer: 1 | 2
  phase: 'placing' | 'moving' | 'over'
  piecesPlaced: number
  selectedPoint: number | null
  validMoves: number[]
  winner: 1 | 2 | null
  positionCounts: Record<string, number>
  moveCount: number
}

const gameStorage = createStorage<GameState>('picaria_state')
const winsStorage = createStorage<number>('picaria_wins')

function boardKey(board: (0 | 1 | 2)[], player: 1 | 2): string {
  return board.join('') + player
}

function checkWinner(board: (0 | 1 | 2)[]): 1 | 2 | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c]) {
      return board[a] as 1 | 2
    }
  }
  return null
}

function getValidMoves(board: (0 | 1 | 2)[], point: number): number[] {
  return ADJACENCY[point].filter(n => board[n] === 0)
}

function applyPlacement(board: (0 | 1 | 2)[], index: number, player: 1 | 2): (0 | 1 | 2)[] {
  const next = [...board] as (0 | 1 | 2)[]
  next[index] = player
  return next
}

function applyMove(board: (0 | 1 | 2)[], from: number, to: number): (0 | 1 | 2)[] {
  const next = [...board] as (0 | 1 | 2)[]
  next[to] = next[from]
  next[from] = 0
  return next
}

function scoreBoard(board: (0 | 1 | 2)[], computerPlayer: 1 | 2): number {
  const opponent = computerPlayer === 1 ? 2 : 1
  let score = 0
  for (const line of WIN_LINES) {
    const counts = [0, 0]
    for (const idx of line) {
      if (board[idx] === computerPlayer) counts[0]++
      else if (board[idx] === opponent) counts[1]++
    }
    if (counts[0] === 2 && counts[1] === 0) score += 10
    else if (counts[1] === 2 && counts[0] === 0) score -= 10
  }
  return score
}

function minimax(
  board: (0 | 1 | 2)[],
  piecesPlaced: number,
  currentPlayer: 1 | 2,
  computerPlayer: 1 | 2,
  depth: number,
  alpha: number,
  beta: number,
): number {
  const winner = checkWinner(board)
  if (winner === computerPlayer) return 1000
  if (winner !== null) return -1000
  if (depth === 0) return scoreBoard(board, computerPlayer)

  const opponent = currentPlayer === 1 ? 2 : 1
  const isMaximizing = currentPlayer === computerPlayer

  if (piecesPlaced < 6) {
    let best = isMaximizing ? -Infinity : Infinity
    for (let i = 0; i < 9; i++) {
      if (board[i] !== 0) continue
      const next = applyPlacement(board, i, currentPlayer)
      const score = minimax(next, piecesPlaced + 1, opponent, computerPlayer, depth - 1, alpha, beta)
      if (isMaximizing) {
        best = Math.max(best, score)
        alpha = Math.max(alpha, best)
      } else {
        best = Math.min(best, score)
        beta = Math.min(beta, best)
      }
      if (beta <= alpha) break
    }
    return best
  }

  let best = isMaximizing ? -Infinity : Infinity
  for (let from = 0; from < 9; from++) {
    if (board[from] !== currentPlayer) continue
    for (const to of ADJACENCY[from]) {
      if (board[to] !== 0) continue
      const next = applyMove(board, from, to)
      const score = minimax(next, piecesPlaced, opponent, computerPlayer, depth - 1, alpha, beta)
      if (isMaximizing) {
        best = Math.max(best, score)
        alpha = Math.max(alpha, best)
      } else {
        best = Math.min(best, score)
        beta = Math.min(beta, best)
      }
      if (beta <= alpha) break
    }
  }
  return best
}

function getBestPlacement(board: (0 | 1 | 2)[], piecesPlaced: number, computerPlayer: 1 | 2): number {
  let bestScore = -Infinity
  let bestIndex = -1
  const opponent = computerPlayer === 1 ? 2 : 1
  for (let i = 0; i < 9; i++) {
    if (board[i] !== 0) continue
    const next = applyPlacement(board, i, computerPlayer)
    const score = minimax(next, piecesPlaced + 1, opponent, computerPlayer, 1, -Infinity, Infinity)
    if (score > bestScore) {
      bestScore = score
      bestIndex = i
    }
  }
  return bestIndex
}

function getBestMove(board: (0 | 1 | 2)[], computerPlayer: 1 | 2): [number, number] {
  let bestScore = -Infinity
  let bestFrom = -1
  let bestTo = -1
  const opponent = computerPlayer === 1 ? 2 : 1
  for (let from = 0; from < 9; from++) {
    if (board[from] !== computerPlayer) continue
    for (const to of ADJACENCY[from]) {
      if (board[to] !== 0) continue
      const next = applyMove(board, from, to)
      const score = minimax(next, 6, opponent, computerPlayer, 1, -Infinity, Infinity)
      if (score > bestScore) {
        bestScore = score
        bestFrom = from
        bestTo = to
      }
    }
  }
  return [bestFrom, bestTo]
}

export function buildInitialState(): GameState {
  return {
    board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    currentPlayer: 1,
    phase: 'placing',
    piecesPlaced: 0,
    selectedPoint: null,
    validMoves: [],
    winner: null,
    positionCounts: {},
    moveCount: 0,
  }
}

export function useGame(options: GameOptions) {
  const humanPlayer: 1 | 2 = options.opponent === 'computer' && options.side === 'second' ? 2 : 1
  const [state, setState] = useState<GameState>(() => gameStorage.load() ?? buildInitialState())
  const stateRef = useRef(state)
  stateRef.current = state

  const isComputerTurn = options.opponent === 'computer' && state.currentPlayer !== humanPlayer

  const hasNoMoves =
    state.phase === 'moving' &&
    state.board.every((v, i) => v !== state.currentPlayer || getValidMoves(state.board, i).length === 0)

  useEffect(() => {
    if (isComputerTurn && state.phase !== 'over') {
      const timer = setTimeout(computerTurn, 400)
      return () => clearTimeout(timer)
    }
  }, [state.currentPlayer, state.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hasNoMoves && state.phase === 'moving') {
      const timer = setTimeout(() => {
        setState(s => ({ ...s, currentPlayer: s.currentPlayer === 1 ? 2 : 1 }))
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [hasNoMoves]) // eslint-disable-line react-hooks/exhaustive-deps

  function save(s: GameState) {
    gameStorage.save(s)
    setState(s)
  }

  function placePiece(index: number) {
    const s = stateRef.current
    const newBoard = applyPlacement(s.board, index, s.currentPlayer)
    const winner = checkWinner(newBoard)
    const newPiecesPlaced = s.piecesPlaced + 1

    if (winner) {
      if (options.opponent === 'computer' && winner === humanPlayer) {
        winsStorage.save((winsStorage.load() ?? 0) + 1)
      }
      const next: GameState = {
        ...s,
        board: newBoard,
        winner,
        phase: 'over',
        piecesPlaced: newPiecesPlaced,
        moveCount: s.moveCount + 1,
      }
      gameStorage.clear()
      setState(next)
      return
    }

    const nextPhase = newPiecesPlaced >= 6 ? 'moving' : 'placing'
    const nextPlayer: 1 | 2 = s.currentPlayer === 1 ? 2 : 1
    const next: GameState = {
      ...s,
      board: newBoard,
      currentPlayer: nextPlayer,
      piecesPlaced: newPiecesPlaced,
      phase: nextPhase,
      moveCount: s.moveCount + 1,
    }
    save(next)
  }

  function makeMove(from: number, to: number) {
    const s = stateRef.current
    const newBoard = applyMove(s.board, from, to)
    const winner = checkWinner(newBoard)

    if (winner) {
      if (options.opponent === 'computer' && winner === humanPlayer) {
        winsStorage.save((winsStorage.load() ?? 0) + 1)
      }
      const next: GameState = {
        ...s,
        board: newBoard,
        winner,
        phase: 'over',
        selectedPoint: null,
        validMoves: [],
        moveCount: s.moveCount + 1,
      }
      gameStorage.clear()
      setState(next)
      return
    }

    const nextPlayer: 1 | 2 = s.currentPlayer === 1 ? 2 : 1
    const key = boardKey(newBoard, nextPlayer)
    const newCounts = { ...s.positionCounts, [key]: (s.positionCounts[key] ?? 0) + 1 }

    if (newCounts[key] >= 3) {
      const next: GameState = {
        ...s,
        board: newBoard,
        winner: null,
        phase: 'over',
        selectedPoint: null,
        validMoves: [],
        positionCounts: newCounts,
        moveCount: s.moveCount + 1,
      }
      gameStorage.clear()
      setState(next)
      return
    }

    const next: GameState = {
      ...s,
      board: newBoard,
      currentPlayer: nextPlayer,
      selectedPoint: null,
      validMoves: [],
      positionCounts: newCounts,
      moveCount: s.moveCount + 1,
    }
    save(next)
  }

  function computerTurn() {
    const s = stateRef.current
    if (s.phase === 'placing') {
      const index = getBestPlacement(s.board, s.piecesPlaced, s.currentPlayer as 1 | 2)
      placePiece(index)
    } else if (s.phase === 'moving') {
      const [from, to] = getBestMove(s.board, s.currentPlayer as 1 | 2)
      makeMove(from, to)
    }
  }

  function handlePointClick(index: number) {
    const s = stateRef.current
    if (s.phase === 'over' || isComputerTurn) return

    if (s.phase === 'placing') {
      if (s.board[index] === 0) placePiece(index)
      return
    }

    if (s.phase === 'moving') {
      if (s.board[index] === s.currentPlayer) {
        if (s.selectedPoint === index) {
          setState(prev => ({ ...prev, selectedPoint: null, validMoves: [] }))
        } else {
          const moves = getValidMoves(s.board, index)
          setState(prev => ({ ...prev, selectedPoint: index, validMoves: moves }))
        }
        return
      }
      if (s.selectedPoint !== null && s.validMoves.includes(index)) {
        makeMove(s.selectedPoint, index)
      }
    }
  }

  return { state, humanPlayer, handlePointClick, hasNoMoves }
}
