export type Player = 'dark' | 'light'
export type Cell = Player | null

export interface CaptureChain {
  piece: [number, number]
  lastDirection: [number, number]
  visited: [number, number][]
}

export interface GameState {
  board: Cell[][]
  currentPlayer: Player
  captureChain: CaptureChain | null
  phase: 'playing' | 'gameover'
  winner: Player | null
  moveCount: number
}

export interface Move {
  from: [number, number]
  to: [number, number]
  type: 'approach' | 'withdrawal' | 'paika'
  captured: [number, number][]
}

export function other(player: Player): Player {
  return player === 'dark' ? 'light' : 'dark'
}

export function initBoard(): Cell[][] {
  const row2: Cell[] = ['light', 'dark', 'light', 'dark', null, 'dark', 'light', 'dark', 'light']
  return Array.from({ length: 5 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => {
      if (r >= 3) return 'dark' as Cell
      if (r <= 1) return 'light' as Cell
      return row2[c]
    })
  )
}

export function getConnections(row: number, col: number): [number, number][] {
  const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  if ((row + col) % 2 === 0) dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1])
  return dirs
    .map(([dr, dc]) => [row + dr, col + dc] as [number, number])
    .filter(([r, c]) => r >= 0 && r < 5 && c >= 0 && c < 9)
}

export function getDirection(from: [number, number], to: [number, number]): [number, number] {
  return [to[0] - from[0], to[1] - from[1]]
}

export function getApproachCaptures(board: Cell[][], from: [number, number], to: [number, number]): [number, number][] {
  const player = board[from[0]][from[1]]
  if (!player) return []
  const enemy = other(player)
  const [dr, dc] = getDirection(from, to)
  const captures: [number, number][] = []
  let r = to[0] + dr, c = to[1] + dc
  while (r >= 0 && r < 5 && c >= 0 && c < 9 && board[r][c] === enemy) {
    captures.push([r, c])
    r += dr; c += dc
  }
  return captures
}

export function getWithdrawalCaptures(board: Cell[][], from: [number, number], to: [number, number]): [number, number][] {
  const player = board[from[0]][from[1]]
  if (!player) return []
  const enemy = other(player)
  const [dr, dc] = getDirection(from, to)
  const captures: [number, number][] = []
  let r = from[0] - dr, c = from[1] - dc
  while (r >= 0 && r < 5 && c >= 0 && c < 9 && board[r][c] === enemy) {
    captures.push([r, c])
    r -= dr; c -= dc
  }
  return captures
}

export function isValidChainStep(chain: CaptureChain, to: [number, number]): boolean {
  const [dr, dc] = getDirection(chain.piece, to)
  const [ldr, ldc] = chain.lastDirection
  if (dr === ldr && dc === ldc) return false
  if (dr === -ldr && dc === -ldc) return false
  return !chain.visited.some(([r, c]) => r === to[0] && c === to[1])
}

export function hasAnyCapture(board: Cell[][], player: Player): boolean {
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== player) continue
      const from: [number, number] = [r, c]
      for (const to of getConnections(r, c)) {
        if (board[to[0]][to[1]] !== null) continue
        if (getApproachCaptures(board, from, to).length > 0) return true
        if (getWithdrawalCaptures(board, from, to).length > 0) return true
      }
    }
  }
  return false
}

export function getMoves(state: GameState): Move[] {
  const { board, currentPlayer, captureChain } = state

  if (captureChain !== null) {
    const { piece } = captureChain
    const moves: Move[] = []
    for (const to of getConnections(piece[0], piece[1])) {
      if (board[to[0]][to[1]] !== null) continue
      if (!isValidChainStep(captureChain, to)) continue
      const approach = getApproachCaptures(board, piece, to)
      const withdrawal = getWithdrawalCaptures(board, piece, to)
      if (approach.length > 0) moves.push({ from: piece, to, type: 'approach', captured: approach })
      if (withdrawal.length > 0) moves.push({ from: piece, to, type: 'withdrawal', captured: withdrawal })
    }
    return moves
  }

  const captures: Move[] = []
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== currentPlayer) continue
      const from: [number, number] = [r, c]
      for (const to of getConnections(r, c)) {
        if (board[to[0]][to[1]] !== null) continue
        const approach = getApproachCaptures(board, from, to)
        const withdrawal = getWithdrawalCaptures(board, from, to)
        if (approach.length > 0) captures.push({ from, to, type: 'approach', captured: approach })
        if (withdrawal.length > 0) captures.push({ from, to, type: 'withdrawal', captured: withdrawal })
      }
    }
  }
  if (captures.length > 0) return captures

  const paikas: Move[] = []
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== currentPlayer) continue
      const from: [number, number] = [r, c]
      for (const to of getConnections(r, c)) {
        if (board[to[0]][to[1]] === null) paikas.push({ from, to, type: 'paika', captured: [] })
      }
    }
  }
  return paikas
}

export function applyMove(state: GameState, move: Move): GameState {
  const board = state.board.map(row => [...row]) as Cell[][]

  board[move.to[0]][move.to[1]] = state.currentPlayer
  board[move.from[0]][move.from[1]] = null
  for (const [r, c] of move.captured) board[r][c] = null

  let captureChain: CaptureChain | null = null
  let nextPlayer = state.currentPlayer

  if (move.type !== 'paika') {
    const dir = getDirection(move.from, move.to)
    const visited: [number, number][] = [
      ...(state.captureChain?.visited ?? [move.from]),
      move.to,
    ]
    const newChain: CaptureChain = { piece: move.to, lastDirection: dir, visited }
    const continuations = getMoves({ ...state, board, captureChain: newChain })
    if (continuations.length > 0) {
      captureChain = newChain
    } else {
      nextPlayer = other(state.currentPlayer)
    }
  } else {
    nextPlayer = other(state.currentPlayer)
  }

  const moveCount = captureChain === null ? state.moveCount + 1 : state.moveCount
  const newState: GameState = {
    board,
    currentPlayer: nextPlayer,
    captureChain,
    phase: 'playing',
    winner: null,
    moveCount,
  }

  const { over, winner } = checkGameOver(newState)
  if (over) {
    newState.phase = 'gameover'
    newState.winner = winner
  }

  return newState
}

export function checkGameOver(state: GameState): { over: boolean; winner: Player | null } {
  if (getMoves(state).length === 0) return { over: true, winner: other(state.currentPlayer) }
  return { over: false, winner: null }
}

function countPieces(board: Cell[][], player: Player): number {
  let n = 0
  for (const row of board) for (const cell of row) if (cell === player) n++
  return n
}

export function evaluate(state: GameState, computer: Player): number {
  if (state.phase === 'gameover') return state.winner === computer ? 10000 : -10000
  const opp = other(computer)
  const pieceCountDiff = countPieces(state.board, computer) - countPieces(state.board, opp)
  const computerMoves = getMoves({ ...state, currentPlayer: computer, captureChain: null })
  const oppMoves = getMoves({ ...state, currentPlayer: opp, captureChain: null })
  return pieceCountDiff * 10 + (computerMoves.length - oppMoves.length)
}

export function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  computer: Player,
  chainSteps = 0
): number {
  if (state.phase === 'gameover' || depth === 0) return evaluate(state, computer)
  const moves = getMoves(state)
  if (moves.length === 0) return evaluate(state, computer)

  const sorted = [...moves].sort((a, b) => (a.type === 'paika' ? 1 : 0) - (b.type === 'paika' ? 1 : 0))

  if (maximizing) {
    let value = -Infinity
    for (const move of sorted) {
      const next = applyMove(state, move)
      const chained = next.captureChain !== null
      const steps = chained ? chainSteps + 1 : 0
      const score = chained && steps >= 6
        ? evaluate(next, computer)
        : minimax(next, chained ? depth : depth - 1, alpha, beta, chained ? true : false, computer, steps)
      value = Math.max(value, score)
      alpha = Math.max(alpha, value)
      if (alpha >= beta) break
    }
    return value
  } else {
    let value = Infinity
    for (const move of sorted) {
      const next = applyMove(state, move)
      const chained = next.captureChain !== null
      const steps = chained ? chainSteps + 1 : 0
      const score = chained && steps >= 6
        ? evaluate(next, computer)
        : minimax(next, chained ? depth : depth - 1, alpha, beta, chained ? false : true, computer, steps)
      value = Math.min(value, score)
      beta = Math.min(beta, value)
      if (alpha >= beta) break
    }
    return value
  }
}

export function computerMove(state: GameState): Move {
  const computer = state.currentPlayer
  const moves = getMoves(state)
  let best = moves[0]
  let bestScore = -Infinity

  for (const move of moves) {
    const next = applyMove(state, move)
    const chained = next.captureChain !== null
    const score = minimax(next, 3, -Infinity, Infinity, chained, computer, chained ? 1 : 0)
    if (score > bestScore) { bestScore = score; best = move }
  }
  return best
}
