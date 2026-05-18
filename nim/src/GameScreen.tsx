import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import HelpModal from './components/HelpModal'
import ConfirmModal from './components/ConfirmModal'
import HeapRow from './components/HeapRow'
import Modal from './components/Modal'
import type { GameState, Mode } from './gameLogic'
import { applyMove, isGameOver, getAIMove } from './gameLogic'
import './GameScreen.css'

interface Props {
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  onQuit: () => void
  initialState: GameState
  onSave: (state: GameState) => void
  onGameOver: (winner: 0 | 1, mode: Mode) => void
}

export default function GameScreen({
  theme,
  onThemeToggle,
  onQuit,
  initialState,
  onSave,
  onGameOver,
}: Props) {
  const [gs, setGs] = useState<GameState>(initialState)
  const [showHelp, setShowHelp] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [removingHeap, setRemovingHeap] = useState<number | null>(null)
  const [gameOverHandled, setGameOverHandled] = useState(false)
  const [takeShake, setTakeShake] = useState(false)

  const isAITurn = gs.mode === 'vs-computer' && gs.currentPlayer !== gs.humanPlayer && gs.phase === 'playing'

  // Save on every state change
  useEffect(() => {
    if (gs.phase === 'playing') onSave(gs)
  }, [gs, onSave])

  // Fire game-over callback once
  useEffect(() => {
    if (gs.phase === 'game-over' && gs.winner !== null && !gameOverHandled) {
      setGameOverHandled(true)
      onGameOver(gs.winner, gs.mode)
    }
  }, [gs.phase, gs.winner, gs.mode, gameOverHandled, onGameOver])

  // Schedule AI move
  useEffect(() => {
    if (!isAITurn) return
    const timer = setTimeout(() => {
      setGs(prev => {
        if (prev.phase !== 'playing') return prev
        if (prev.mode !== 'vs-computer') return prev
        if (prev.currentPlayer === prev.humanPlayer) return prev
        const move = getAIMove(prev.heaps)
        const newHeaps = applyMove(prev.heaps, move.heap, move.count)
        const over = isGameOver(newHeaps)
        return {
          ...prev,
          heaps: newHeaps,
          selectedHeap: null,
          removeCount: 1,
          phase: over ? 'game-over' : 'playing',
          winner: over ? prev.currentPlayer : null,
          currentPlayer: over ? prev.currentPlayer : ((prev.currentPlayer ^ 1) as 0 | 1),
        }
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [isAITurn, gs.currentPlayer, gs.phase])

  const handleSelectHeap = useCallback((i: number) => {
    setGs(prev => {
      if (prev.phase !== 'playing') return prev
      if (prev.heaps[i] === 0) return prev
      return { ...prev, selectedHeap: i, removeCount: 1 }
    })
  }, [])

  const handleObjectClick = useCallback((count: number) => {
    setGs(prev => {
      if (prev.selectedHeap === null) return prev
      const clamped = Math.max(1, Math.min(prev.heaps[prev.selectedHeap], count))
      return { ...prev, removeCount: clamped }
    })
  }, [])

  const handleTake = useCallback(() => {
    if (gs.selectedHeap === null || gs.removeCount < 1 || gs.phase !== 'playing' || isAITurn) return
    const { selectedHeap, removeCount } = gs
    setRemovingHeap(selectedHeap)
    setTimeout(() => {
      setRemovingHeap(null)
      setGs(cur => {
        if (cur.phase !== 'playing') return cur
        const newHeaps = applyMove(cur.heaps, selectedHeap, removeCount)
        const over = isGameOver(newHeaps)
        return {
          ...cur,
          heaps: newHeaps,
          selectedHeap: null,
          removeCount: 1,
          phase: over ? 'game-over' : 'playing',
          winner: over ? cur.currentPlayer : null,
          currentPlayer: over ? cur.currentPlayer : ((cur.currentPlayer ^ 1) as 0 | 1),
        }
      })
    }, 260)
  }, [gs, isAITurn])

  const canTake = gs.selectedHeap !== null && gs.removeCount >= 1 && !isAITurn && gs.phase === 'playing'

  function handleTakeClick() {
    if (!canTake) {
      setTakeShake(true)
      setTimeout(() => setTakeShake(false), 400)
      return
    }
    handleTake()
  }

  function getStatusText() {
    if (gs.phase === 'game-over') return ''
    if (gs.mode === 'vs-computer') {
      if (isAITurn) return 'Thinking'
      return 'Your turn'
    }
    return `Player ${gs.currentPlayer + 1}'s turn`
  }

  function statusClass() {
    if (isAITurn) return 'status--muted'
    return 'status--accent'
  }

  function getResultText() {
    if (gs.winner === null) return ''
    if (gs.mode === 'vs-computer') {
      return gs.winner === gs.humanPlayer ? 'You win!' : 'Computer wins'
    }
    return `Player ${gs.winner + 1} wins!`
  }

  function resultClass() {
    if (gs.winner === null) return ''
    if (gs.mode === 'vs-computer') {
      return gs.winner === gs.humanPlayer ? 'result--win' : 'result--lose'
    }
    return 'result--win'
  }

  function handlePlayAgain() {
    const fresh: GameState = {
      heaps: [1, 3, 5, 7],
      currentPlayer: 0,
      selectedHeap: null,
      removeCount: 1,
      phase: 'playing',
      winner: null,
      mode: gs.mode,
      humanPlayer: gs.humanPlayer,
    }
    setGameOverHandled(false)
    setGs(fresh)
  }

  const takeAriaLabel =
    gs.selectedHeap !== null
      ? `Take ${gs.removeCount} object${gs.removeCount !== 1 ? 's' : ''} from Heap ${gs.selectedHeap + 1}`
      : 'Take objects'

  return (
    <div className="card">
      <Header
        variant="game"
        theme={theme}
        onThemeToggle={onThemeToggle}
        onHelp={() => setShowHelp(true)}
        onClose={() => setShowConfirm(true)}
        center={
          <span className={`status-text ${statusClass()}${isAITurn ? ' thinking-ellipsis' : ''}`}>
            {getStatusText()}
          </span>
        }
      />

      <div className="game-content">
        <div className="heaps-area">
          {gs.heaps.map((size, i) => (
            <HeapRow
              key={i}
              heapIndex={i}
              size={size}
              selected={gs.selectedHeap === i}
              removeCount={gs.selectedHeap === i ? gs.removeCount : 1}
              disabled={isAITurn || gs.phase !== 'playing'}
              onSelect={() => handleSelectHeap(i)}
              onObjectClick={handleObjectClick}
              removing={removingHeap === i}
            />
          ))}
        </div>

        <button
          className={`btn btn--primary take-btn${takeShake ? ' take-btn--shake' : ''}`}
          onClick={handleTakeClick}
          aria-label={takeAriaLabel}
          aria-disabled={!canTake}
        >
          {gs.selectedHeap !== null ? `Take ${gs.removeCount}` : 'Take'}
        </button>
      </div>

      {gs.phase === 'game-over' && (
        <Modal onClose={() => {}}>
          <div className="game-over-result">
            <p className={`result-text ${resultClass()}`}>{getResultText()}</p>
          </div>
          <div className="game-over-actions">
            <button className="btn btn--primary" onClick={handlePlayAgain}>Play Again</button>
            <button className="btn btn--secondary" onClick={onQuit}>Return to Menu</button>
          </div>
        </Modal>
      )}

      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)}>
          <div className="help-section">
            <h3 className="help-heading">Objective</h3>
            <p className="help-text">Take the last object from the table to win.</p>
          </div>
          <div className="help-section">
            <h3 className="help-heading">Rules</h3>
            <ul className="help-list">
              <li>Pick one heap and remove any number of objects (at least 1)</li>
              <li>The player who takes the last object wins</li>
            </ul>
          </div>
          <div className="help-section">
            <h3 className="help-heading">Strategy</h3>
            <ul className="help-list">
              <li>XOR all heap sizes. If the result is 0 after your move, you are in control</li>
              <li>With one heap left, take all of it to win instantly</li>
            </ul>
          </div>
        </HelpModal>
      )}

      {showConfirm && (
        <ConfirmModal
          message="Return to the main menu? Your current game will be lost."
          confirmLabel="Quit"
          cancelLabel="Cancel"
          onConfirm={onQuit}
          onCancel={() => setShowConfirm(false)}
        />
      )}

    </div>
  )
}
