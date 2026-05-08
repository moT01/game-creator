import { useState, useEffect, useCallback } from 'react'
import type { GameOptions } from '../HomeOptions'
import { createStorage } from './useStorage'
import {
  type Player, type GameState, type Move,
  initBoard, getMoves, applyMove, computerMove,
} from '../game'

export type { GameState }

export interface CaptureChoice {
  approachMove: Move
  withdrawalMove: Move
}

const COMPUTER: Player = 'light'
const storage = createStorage<GameState>('fanorona_state')

function makeInitialState(): GameState {
  return {
    board: initBoard(),
    currentPlayer: 'dark',
    captureChain: null,
    phase: 'playing',
    winner: null,
    moveCount: 0,
  }
}

function loadOrInit(): GameState {
  return storage.load() ?? makeInitialState()
}

export function useGame(options: GameOptions) {
  const [gameState, setGameState] = useState<GameState>(loadOrInit)
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null)
  const [legalMoves, setLegalMoves] = useState<Move[]>([])
  const [captureChoice, setCaptureChoice] = useState<CaptureChoice | null>(null)

  const isVsComputer = options.opponent === 'computer'

  const makeMove = useCallback((move: Move) => {
    setGameState(prev => {
      const next = applyMove(prev, move)
      if (next.phase === 'playing') {
        storage.save(next)
      } else {
        storage.clear()
      }
      return next
    })
    setSelectedPiece(null)
    setLegalMoves([])
    setCaptureChoice(null)
  }, [])

  const resetGame = useCallback(() => {
    const state = makeInitialState()
    storage.save(state)
    setGameState(state)
    setSelectedPiece(null)
    setLegalMoves([])
    setCaptureChoice(null)
  }, [])

  // sync selection and legal moves with chain state after each move
  useEffect(() => {
    if (gameState.captureChain !== null) {
      setSelectedPiece(gameState.captureChain.piece)
      setLegalMoves(getMoves(gameState))
    } else {
      setSelectedPiece(null)
      setLegalMoves([])
    }
  }, [gameState])

  const selectPiece = useCallback((pos: [number, number]) => {
    const { board, currentPlayer, captureChain, phase } = gameState
    if (phase !== 'playing') return
    if (isVsComputer && currentPlayer === COMPUTER) return
    if (captureChoice !== null) return

    const [r, c] = pos

    if (captureChain !== null) {
      const movesToPos = legalMoves.filter(m => m.to[0] === r && m.to[1] === c)
      if (movesToPos.length === 0) return
      if (movesToPos.length === 1) {
        makeMove(movesToPos[0])
      } else {
        setCaptureChoice({
          approachMove: movesToPos.find(m => m.type === 'approach')!,
          withdrawalMove: movesToPos.find(m => m.type === 'withdrawal')!,
        })
      }
      return
    }

    if (board[r][c] === currentPlayer) {
      if (selectedPiece?.[0] === r && selectedPiece?.[1] === c) {
        setSelectedPiece(null)
        setLegalMoves([])
      } else {
        setSelectedPiece(pos)
        setLegalMoves(getMoves(gameState).filter(m => m.from[0] === r && m.from[1] === c))
      }
      return
    }

    if (selectedPiece !== null && board[r][c] === null) {
      const movesToPos = legalMoves.filter(m => m.to[0] === r && m.to[1] === c)
      if (movesToPos.length === 0) {
        setSelectedPiece(null)
        setLegalMoves([])
        return
      }
      if (movesToPos.length === 1) {
        makeMove(movesToPos[0])
      } else {
        setCaptureChoice({
          approachMove: movesToPos.find(m => m.type === 'approach')!,
          withdrawalMove: movesToPos.find(m => m.type === 'withdrawal')!,
        })
      }
    }
  }, [gameState, selectedPiece, legalMoves, captureChoice, makeMove, isVsComputer])

  const resolveCapture = useCallback((type: 'approach' | 'withdrawal') => {
    if (captureChoice === null) return
    makeMove(type === 'approach' ? captureChoice.approachMove : captureChoice.withdrawalMove)
  }, [captureChoice, makeMove])

  // trigger computer move
  useEffect(() => {
    if (!isVsComputer) return
    if (gameState.phase !== 'playing') return
    if (gameState.currentPlayer !== COMPUTER) return

    const state = gameState
    const delay = state.captureChain !== null ? 150 : 400
    const timer = setTimeout(() => {
      const move = computerMove(state)
      const next = applyMove(state, move)
      if (next.phase === 'playing') {
        storage.save(next)
      } else {
        storage.clear()
      }
      setGameState(next)
    }, delay)

    return () => clearTimeout(timer)
  }, [gameState, isVsComputer])

  return {
    gameState,
    selectedPiece,
    legalMoves,
    captureChoice,
    selectPiece,
    makeMove,
    resetGame,
    resolveCapture,
  }
}
