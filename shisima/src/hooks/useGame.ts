import { useState, useEffect, useRef } from 'react'
import { createStorage } from './useStorage'
import type { GameOptions } from '../HomeOptions'

const ADJACENCY: number[][] = [
  [7, 1, 8],
  [0, 2, 8],
  [1, 3, 8],
  [2, 4, 8],
  [3, 5, 8],
  [4, 6, 8],
  [5, 7, 8],
  [6, 0, 8],
  [0, 1, 2, 3, 4, 5, 6, 7],
]

const WIN_LINES: [number, number, number][] = [
  [0, 8, 4],
  [1, 8, 5],
  [2, 8, 6],
  [3, 8, 7],
]

// player 1 at 6,7,0 | player 2 at 2,3,4 | empty: 1,5,8
export const INITIAL_BOARD: (0 | 1 | 2)[] = [1, 0, 2, 2, 2, 0, 1, 1, 0]

export interface GameState {
  board: (0 | 1 | 2)[]
  currentPlayer: 1 | 2
  selectedPoint: number | null
  validMoves: number[]
  winner: 1 | 2 | 'draw' | null
  phase: 'playing' | 'over'
  positionCounts: Record<string, number>
  moveCount: number
}

const gameStorage = createStorage<GameState>('shisima_state')
const winsStorage = createStorage<number>('shisima_wins')

function boardKey(board: (0 | 1 | 2)[], player: number): string {
  return board.join('') + player
}

export function buildInitialState(): GameState {
  const board = [...INITIAL_BOARD] as (0 | 1 | 2)[]
  return {
    board,
    currentPlayer: 1,
    selectedPoint: null,
    validMoves: [],
    winner: null,
    phase: 'playing',
    positionCounts: { [boardKey(board, 1)]: 1 },
    moveCount: 0,
  }
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

function applyMove(board: (0 | 1 | 2)[], from: number, to: number): (0 | 1 | 2)[] {
  const next = [...board] as (0 | 1 | 2)[]
  next[to] = next[from]
  next[from] = 0
  return next
}

function scoreBoard(board: (0 | 1 | 2)[], computerPlayer: 1 | 2): number {
  const opp = (computerPlayer === 1 ? 2 : 1) as 1 | 2
  let score = 0
  for (const line of WIN_LINES) {
    const cells = line.map(i => board[i])
    const comp = cells.filter(c => c === computerPlayer).length
    const oppCount = cells.filter(c => c === opp).length
    if (comp === 2 && oppCount === 0) score += 10
    if (oppCount === 2 && comp === 0) score -= 10
  }
  return score
}

function minimax(
  board: (0 | 1 | 2)[],
  currentPlayer: 1 | 2,
  computerPlayer: 1 | 2,
  depth: number,
  alpha: number,
  beta: number
): number {
  const winner = checkWinner(board)
  if (winner === computerPlayer) return 1000
  if (winner !== null) return -1000
  if (depth === 0) return scoreBoard(board, computerPlayer)

  const opp = (currentPlayer === 1 ? 2 : 1) as 1 | 2
  const moves: [number, number][] = []
  for (let i = 0; i < 9; i++) {
    if (board[i] === currentPlayer) {
      for (const to of getValidMoves(board, i)) {
        moves.push([i, to])
      }
    }
  }

  if (moves.length === 0) {
    return minimax(board, opp, computerPlayer, depth - 1, alpha, beta)
  }

  if (currentPlayer === computerPlayer) {
    let best = -Infinity
    for (const [from, to] of moves) {
      const score = minimax(applyMove(board, from, to), opp, computerPlayer, depth - 1, alpha, beta)
      best = Math.max(best, score)
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const [from, to] of moves) {
      const score = minimax(applyMove(board, from, to), opp, computerPlayer, depth - 1, alpha, beta)
      best = Math.min(best, score)
      beta = Math.min(beta, best)
      if (beta <= alpha) break
    }
    return best
  }
}

function getBestMove(board: (0 | 1 | 2)[], computerPlayer: 1 | 2): [number, number] {
  const opp = (computerPlayer === 1 ? 2 : 1) as 1 | 2
  let bestScore = -Infinity
  let bestMove: [number, number] | null = null

  for (let i = 0; i < 9; i++) {
    if (board[i] === computerPlayer) {
      for (const to of getValidMoves(board, i)) {
        const score = minimax(applyMove(board, i, to), opp, computerPlayer, 4, -Infinity, Infinity)
        if (score > bestScore || bestMove === null) {
          bestScore = score
          bestMove = [i, to]
        }
      }
    }
  }

  return bestMove ?? [0, 0]
}

export function useGame(options: GameOptions) {
  const humanPlayer: 1 | 2 = options.opponent === 'computer' && options.side === 'second' ? 2 : 1
  const computerPlayer: 1 | 2 = humanPlayer === 1 ? 2 : 1
  const isVsComputer = options.opponent === 'computer'

  const [state, setStateRaw] = useState<GameState>(() => {
    const loaded = gameStorage.load()
    return loaded?.board ? loaded : buildInitialState()
  })
  const stateRef = useRef<GameState>(state)

  function setState(next: GameState) {
    stateRef.current = next
    setStateRaw(next)
    if (next.phase === 'playing') {
      gameStorage.save(next)
    } else {
      gameStorage.clear()
    }
  }

  function makeMove(from: number, to: number) {
    const s = stateRef.current
    const newBoard = applyMove(s.board, from, to)
    const nextPlayer = (s.currentPlayer === 1 ? 2 : 1) as 1 | 2
    const newMoveCount = s.moveCount + 1
    const winner = checkWinner(newBoard)
    const key = boardKey(newBoard, nextPlayer)
    const newCounts = { ...s.positionCounts, [key]: (s.positionCounts[key] ?? 0) + 1 }
    const isDraw = newCounts[key] >= 3

    if (winner) {
      if (isVsComputer && winner === humanPlayer) {
        winsStorage.save((winsStorage.load() ?? 0) + 1)
      }
      setState({
        ...s,
        board: newBoard,
        selectedPoint: null,
        validMoves: [],
        positionCounts: newCounts,
        moveCount: newMoveCount,
        currentPlayer: nextPlayer,
        winner,
        phase: 'over',
      })
      return
    }

    if (isDraw) {
      setState({
        ...s,
        board: newBoard,
        selectedPoint: null,
        validMoves: [],
        positionCounts: newCounts,
        moveCount: newMoveCount,
        currentPlayer: nextPlayer,
        winner: 'draw',
        phase: 'over',
      })
      return
    }

    setState({
      ...s,
      board: newBoard,
      selectedPoint: null,
      validMoves: [],
      positionCounts: newCounts,
      moveCount: newMoveCount,
      currentPlayer: nextPlayer,
      winner: null,
      phase: 'playing',
    })
  }

  function computerMove() {
    const s = stateRef.current
    if (s.phase !== 'playing') return
    if (!isVsComputer || s.currentPlayer !== computerPlayer) return

    const hasMoves = s.board.some(
      (piece, i) => piece === computerPlayer && getValidMoves(s.board, i).length > 0
    )
    if (!hasMoves) {
      const nextPlayer = (computerPlayer === 1 ? 2 : 1) as 1 | 2
      setState({ ...s, currentPlayer: nextPlayer })
      return
    }

    const [from, to] = getBestMove(s.board, computerPlayer)
    makeMove(from, to)
  }

  function handlePointClick(index: number) {
    const s = stateRef.current
    if (s.phase !== 'playing') return
    if (isVsComputer && s.currentPlayer === computerPlayer) return

    if (s.board[index] === s.currentPlayer) {
      if (s.selectedPoint === index) {
        setState({ ...s, selectedPoint: null, validMoves: [] })
      } else {
        setState({ ...s, selectedPoint: index, validMoves: getValidMoves(s.board, index) })
      }
      return
    }

    if (s.selectedPoint !== null && s.validMoves.includes(index)) {
      makeMove(s.selectedPoint, index)
    }
  }

  useEffect(() => {
    if (state.phase !== 'playing') return

    if (isVsComputer && state.currentPlayer === computerPlayer) {
      const id = setTimeout(computerMove, 400)
      return () => clearTimeout(id)
    }

    const hasMoves = state.board.some(
      (piece, i) => piece === state.currentPlayer && getValidMoves(state.board, i).length > 0
    )
    if (!hasMoves) {
      const id = setTimeout(() => {
        const s = stateRef.current
        if (s.phase !== 'playing') return
        setState({ ...s, currentPlayer: (s.currentPlayer === 1 ? 2 : 1) as 1 | 2 })
      }, 800)
      return () => clearTimeout(id)
    }
  }, [state.currentPlayer, state.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasNoMoves = state.phase === 'playing' && !state.board.some(
    (piece, i) => piece === state.currentPlayer && ADJACENCY[i].some(n => state.board[n] === 0)
  )

  return { state, humanPlayer, handlePointClick, hasNoMoves }
}
