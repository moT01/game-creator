import { useState, useEffect, useRef } from 'react'
import { createStorage } from './useStorage'
import type { GameOptions } from '../HomeOptions'

export type Player = 'r' | 'b'
export type Phase = 'placement' | 'movement'
export type MoveSubPhase = 'select-piece' | 'select-destination' | 'select-capture'

export interface GameState {
  board: (Player | null)[][]
  phase: Phase
  moveSubPhase: MoveSubPhase
  currentPlayer: Player
  piecesPlaced: { r: number; b: number }
  pieceCounts: { r: number; b: number }
  selectedCell: [number, number] | null
  formedRow: [number, number][] | null
  winner: Player | null
  gameOver: boolean
}

const gameStateStorage = createStorage<GameState>('dara_state')
const winsStorage = createStorage<{ r: number; b: number }>('dara_wins')

export function initBoard(): (Player | null)[][] {
  return Array.from({ length: 5 }, () => Array(6).fill(null))
}

export function initGameState(_options: GameOptions): GameState {
  return {
    board: initBoard(),
    phase: 'placement',
    moveSubPhase: 'select-piece',
    currentPlayer: 'r',
    piecesPlaced: { r: 0, b: 0 },
    pieceCounts: { r: 0, b: 0 },
    selectedCell: null,
    formedRow: null,
    winner: null,
    gameOver: false,
  }
}

function countInDir(
  board: (Player | null)[][],
  row: number, col: number,
  dr: number, dc: number,
  player: Player
): number {
  let count = 0
  let r = row + dr, c = col + dc
  while (r >= 0 && r < 5 && c >= 0 && c < 6 && board[r][c] === player) {
    count++; r += dr; c += dc
  }
  return count
}

export function wouldFormExactRow(
  board: (Player | null)[][],
  row: number, col: number,
  player: Player
): boolean {
  for (const [dr, dc] of [[0, 1], [1, 0]] as [number, number][]) {
    const pos = countInDir(board, row, col, dr, dc, player)
    const neg = countInDir(board, row, col, -dr, -dc, player)
    if (pos + neg + 1 === 3) return true
  }
  return false
}

export function findFormedRow(
  board: (Player | null)[][],
  row: number, col: number,
  player: Player
): [number, number][] | null {
  for (const [dr, dc] of [[0, 1], [1, 0]] as [number, number][]) {
    const pos = countInDir(board, row, col, dr, dc, player)
    const neg = countInDir(board, row, col, -dr, -dc, player)
    if (pos + neg + 1 === 3) {
      const cells: [number, number][] = [[row, col]]
      for (let i = 1; i <= pos; i++) cells.push([row + dr * i, col + dc * i])
      for (let i = 1; i <= neg; i++) cells.push([row - dr * i, col - dc * i])
      return cells
    }
  }
  return null
}

export function getAdjacentEmpties(
  board: (Player | null)[][],
  row: number, col: number
): [number, number][] {
  return ([[-1,0],[1,0],[0,-1],[0,1]] as [number,number][])
    .map(([dr, dc]): [number, number] => [row + dr, col + dc])
    .filter(([r, c]) => r >= 0 && r < 5 && c >= 0 && c < 6 && board[r][c] === null)
}

export function hasAnyValidMove(board: (Player | null)[][], player: Player): boolean {
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 6; c++)
      if (board[r][c] === player && getAdjacentEmpties(board, r, c).length > 0) return true
  return false
}

export function isInExactRow(
  board: (Player | null)[][],
  row: number, col: number,
  player: Player
): boolean {
  if (board[row][col] !== player) return false
  for (const [dr, dc] of [[0, 1], [1, 0]] as [number, number][]) {
    const pos = countInDir(board, row, col, dr, dc, player)
    const neg = countInDir(board, row, col, -dr, -dc, player)
    if (pos + neg + 1 === 3) return true
  }
  return false
}

export function getCapturableCells(
  board: (Player | null)[][],
  opponent: Player
): [number, number][] {
  const all: [number, number][] = []
  const unprotected: [number, number][] = []
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 6; c++) {
      if (board[r][c] !== opponent) continue
      all.push([r, c])
      if (!isInExactRow(board, r, c, opponent)) unprotected.push([r, c])
    }
  }
  return unprotected.length > 0 ? unprotected : all
}

export function countPieces(board: (Player | null)[][], player: Player): number {
  let n = 0
  for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) if (board[r][c] === player) n++
  return n
}

function checkNoMoves(state: GameState): GameState {
  if (!hasAnyValidMove(state.board, state.currentPlayer)) {
    return { ...state, winner: state.currentPlayer === 'r' ? 'b' : 'r', gameOver: true }
  }
  return state
}

function handlePlacementClick(state: GameState, row: number, col: number): GameState {
  if (state.board[row][col] !== null) return state
  if (wouldFormExactRow(state.board, row, col, state.currentPlayer)) return state

  const newBoard = state.board.map(r => [...r])
  newBoard[row][col] = state.currentPlayer

  const newPiecesPlaced = { ...state.piecesPlaced, [state.currentPlayer]: state.piecesPlaced[state.currentPlayer] + 1 }
  const newPieceCounts = { ...state.pieceCounts, [state.currentPlayer]: state.pieceCounts[state.currentPlayer] + 1 }
  const bothDone = newPiecesPlaced.r === 12 && newPiecesPlaced.b === 12
  const next: Player = state.currentPlayer === 'r' ? 'b' : 'r'

  let newState: GameState = {
    ...state,
    board: newBoard,
    piecesPlaced: newPiecesPlaced,
    pieceCounts: newPieceCounts,
    currentPlayer: next,
    phase: bothDone ? 'movement' : 'placement',
    moveSubPhase: 'select-piece',
  }
  if (bothDone) newState = checkNoMoves(newState)
  return newState
}

function handleMovementClick(state: GameState, row: number, col: number): GameState {
  switch (state.moveSubPhase) {
    case 'select-piece': {
      if (state.board[row][col] !== state.currentPlayer) return state
      return { ...state, selectedCell: [row, col], moveSubPhase: 'select-destination' }
    }
    case 'select-destination': {
      const [sr, sc] = state.selectedCell!
      if (sr === row && sc === col) return { ...state, selectedCell: null, moveSubPhase: 'select-piece' }
      if (state.board[row][col] === state.currentPlayer) return { ...state, selectedCell: [row, col] }
      if (state.board[row][col] !== null) return state
      if (!getAdjacentEmpties(state.board, sr, sc).some(([r, c]) => r === row && c === col)) return state

      const newBoard = state.board.map(r => [...r])
      newBoard[sr][sc] = null
      newBoard[row][col] = state.currentPlayer

      const formed = findFormedRow(newBoard, row, col, state.currentPlayer)
      if (formed) {
        return { ...state, board: newBoard, selectedCell: null, formedRow: formed, moveSubPhase: 'select-capture' }
      }

      const next: Player = state.currentPlayer === 'r' ? 'b' : 'r'
      return checkNoMoves({ ...state, board: newBoard, selectedCell: null, currentPlayer: next, moveSubPhase: 'select-piece' })
    }
    case 'select-capture': {
      const opp: Player = state.currentPlayer === 'r' ? 'b' : 'r'
      if (!getCapturableCells(state.board, opp).some(([r, c]) => r === row && c === col)) return state

      const newBoard = state.board.map(r => [...r])
      newBoard[row][col] = null
      const newPieceCounts = { ...state.pieceCounts, [opp]: state.pieceCounts[opp] - 1 }

      if (newPieceCounts[opp] <= 2) {
        return { ...state, board: newBoard, pieceCounts: newPieceCounts, formedRow: null, winner: state.currentPlayer, gameOver: true }
      }

      const next: Player = state.currentPlayer === 'r' ? 'b' : 'r'
      return checkNoMoves({ ...state, board: newBoard, pieceCounts: newPieceCounts, formedRow: null, selectedCell: null, currentPlayer: next, moveSubPhase: 'select-piece' })
    }
    default:
      return state
  }
}

export function handleClick(state: GameState, row: number, col: number): GameState {
  if (state.gameOver) return state
  if (state.phase === 'placement') return handlePlacementClick(state, row, col)
  return handleMovementClick(state, row, col)
}

function createsNearRow(board: (Player | null)[][], row: number, col: number, player: Player): boolean {
  for (const [dr, dc] of [[0, 1], [1, 0]] as [number, number][]) {
    const pos = countInDir(board, row, col, dr, dc, player)
    const neg = countInDir(board, row, col, -dr, -dc, player)
    if (pos + neg + 1 === 2) {
      const er = row + dr * (pos + 1), ec = col + dc * (pos + 1)
      const er2 = row - dr * (neg + 1), ec2 = col - dc * (neg + 1)
      if ((er >= 0 && er < 5 && ec >= 0 && ec < 6 && board[er][ec] === null) ||
          (er2 >= 0 && er2 < 5 && ec2 >= 0 && ec2 < 6 && board[er2][ec2] === null)) return true
    }
  }
  return false
}

export function aiPlacement(board: (Player | null)[][], player: Player): [number, number] {
  const opp: Player = player === 'r' ? 'b' : 'r'
  const candidates: { cell: [number, number]; score: number }[] = []

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 6; c++) {
      if (board[r][c] !== null || wouldFormExactRow(board, r, c, player)) continue
      let score = 0
      if (createsNearRow(board, r, c, player)) score += 20
      if (createsNearRow(board, r, c, opp)) score += 10
      if (r >= 1 && r <= 3 && c >= 2 && c <= 3) score += 2
      candidates.push({ cell: [r, c], score })
    }
  }

  if (!candidates.length) {
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 6; c++)
        if (!board[r][c] && !wouldFormExactRow(board, r, c, player)) return [r, c]
    return [0, 0]
  }

  const max = Math.max(...candidates.map(x => x.score))
  const best = candidates.filter(x => x.score === max)
  return best[Math.floor(Math.random() * best.length)].cell
}

export function aiMovement(
  state: GameState,
  player: Player
): { from: [number, number]; to: [number, number] } {
  const opp: Player = player === 'r' ? 'b' : 'r'
  const threats = new Set<string>()
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 6; c++)
      if (!state.board[r][c] && findFormedRow(state.board, r, c, opp)) threats.add(`${r},${c}`)

  const candidates: { from: [number, number]; to: [number, number]; score: number }[] = []

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 6; c++) {
      if (state.board[r][c] !== player) continue
      for (const [tr, tc] of getAdjacentEmpties(state.board, r, c)) {
        let score = 0
        const tmp = state.board.map(row => [...row])
        tmp[r][c] = null
        tmp[tr][tc] = player
        if (findFormedRow(tmp, tr, tc, player)) score += 100
        if (threats.has(`${tr},${tc}`)) score += 50
        if (([[-1,0],[1,0],[0,-1],[0,1]] as [number,number][]).some(([dr, dc]) => {
          const nr = tr + dr, nc = tc + dc
          return nr >= 0 && nr < 5 && nc >= 0 && nc < 6 && tmp[nr][nc] === opp
        })) score += 5
        candidates.push({ from: [r, c], to: [tr, tc], score })
      }
    }
  }

  if (!candidates.length) return { from: [0, 0], to: [0, 0] }

  const max = Math.max(...candidates.map(x => x.score))
  const best = candidates.filter(x => x.score === max)
  return best[Math.floor(Math.random() * best.length)]
}

export function aiChooseCapture(board: (Player | null)[][], opp: Player): [number, number] {
  const capturable = getCapturableCells(board, opp)
  let best = capturable[0], bestScore = -1
  for (const [r, c] of capturable) {
    let score = 0
    for (const [dr, dc] of [[0,1],[1,0]] as [number,number][]) {
      score += countInDir(board, r, c, dr, dc, opp)
      score += countInDir(board, r, c, -dr, -dc, opp)
    }
    if (score > bestScore) { bestScore = score; best = [r, c] }
  }
  return best
}

export function useGame(options: GameOptions) {
  const computerSide: Player | null = options.opponent === 'computer' ? options.side : null
  const winsUpdated = useRef(false)

  const [state, setState] = useState<GameState>(() => gameStateStorage.load() ?? initGameState(options))

  useEffect(() => {
    if (state.gameOver) {
      if (!winsUpdated.current) {
        winsUpdated.current = true
        gameStateStorage.clear()
        if (state.winner) {
          const wins = winsStorage.load() ?? { r: 0, b: 0 }
          winsStorage.save({ ...wins, [state.winner]: (wins[state.winner] ?? 0) + 1 })
        }
      }
    } else {
      gameStateStorage.save(state)
    }
  }, [state])

  useEffect(() => {
    if (state.gameOver || !computerSide || state.currentPlayer !== computerSide) return
    const timer = setTimeout(() => {
      setState(prev => {
        if (prev.phase === 'placement') {
          const [r, c] = aiPlacement(prev.board, computerSide)
          return handlePlacementClick(prev, r, c)
        }
        if (prev.moveSubPhase !== 'select-piece') return prev
        const move = aiMovement(prev, computerSide)
        let s = handleMovementClick(prev, move.from[0], move.from[1])
        s = handleMovementClick(s, move.to[0], move.to[1])
        if (s.moveSubPhase === 'select-capture') {
          const [cr, cc] = aiChooseCapture(s.board, computerSide === 'r' ? 'b' : 'r')
          s = handleMovementClick(s, cr, cc)
        }
        return s
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [state.currentPlayer, state.phase, state.moveSubPhase, state.gameOver])

  function click(row: number, col: number) {
    if (computerSide && state.currentPlayer === computerSide) return
    setState(prev => handleClick(prev, row, col))
  }

  function quit() {
    gameStateStorage.clear()
  }

  return { state, handleClick: click, quit }
}
