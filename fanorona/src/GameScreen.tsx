import { useState, useEffect } from 'react'
import { createStorage } from './hooks/useStorage'
import Header from './components/Header'
import GameBoard from './GameBoard'
import ConfirmModal from './components/ConfirmModal'
import GameOverModal from './components/GameOverModal'
import { useGame } from './hooks/useGame'
import { other } from './game'
import type { GameOptions } from './HomeOptions'
import './GameScreen.css'

const winsStorage = createStorage<number>('fanorona_wins')

interface Props {
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  onHelp: () => void
  onClose: () => void
  options: GameOptions
  onGameOver: () => void
}

export default function GameScreen({ theme, onThemeToggle, onHelp, onClose, options, onGameOver }: Props) {
  const { gameState, selectedPiece, legalMoves, captureChoice, selectPiece, resetGame, resolveCapture } = useGame(options)
  const [showConfirm, setShowConfirm] = useState(false)

  const isOver = gameState.phase === 'gameover'

  useEffect(() => {
    if (!isOver) return
    onGameOver()
    if (options.opponent === 'computer' && gameState.winner === 'dark') {
      const current = winsStorage.load() ?? 0
      winsStorage.save(current + 1)
    }
  }, [isOver]) // eslint-disable-line react-hooks/exhaustive-deps

  function getStatusText(): string {
    if (isOver) return ''
    if (options.opponent === 'computer') {
      return gameState.currentPlayer === 'dark' ? 'Your turn' : 'Thinking...'
    }
    return gameState.currentPlayer === 'dark' ? "Player 1's turn" : "Player 2's turn"
  }

  function getResult(): string {
    if (gameState.winner === null) return 'No winner'
    if (options.opponent === 'computer') {
      return gameState.winner === 'dark' ? 'You win!' : 'Computer wins'
    }
    return gameState.winner === 'dark' ? 'Player 1 wins!' : 'Player 2 wins!'
  }

  function getResultType(): 'win' | 'loss' | undefined {
    if (options.opponent !== 'computer' || gameState.winner === null) return undefined
    return gameState.winner === 'dark' ? 'win' : 'loss'
  }

  function getNote(): string | undefined {
    if (gameState.winner === null) return undefined
    const loser = other(gameState.winner)
    const loserHasPieces = gameState.board.some(row => row.some(cell => cell === loser))
    return loserHasPieces ? 'No legal moves remaining' : undefined
  }

  return (
    <div className="card">
      <Header
        variant="game"
        theme={theme}
        onThemeToggle={onThemeToggle}
        onHelp={onHelp}
        onClose={() => setShowConfirm(true)}
        center={getStatusText()}
      />
      <div className="game-content">
        <GameBoard
          gameState={gameState}
          selectedPiece={selectedPiece}
          legalMoves={legalMoves}
          captureChoice={captureChoice}
          onCellClick={selectPiece}
          onResolveCapture={resolveCapture}
        />
      </div>
      {showConfirm && (
        <ConfirmModal
          message="Return to the main menu? You can resume your game from there."
          confirmLabel="Quit"
          cancelLabel="Cancel"
          onConfirm={onClose}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {isOver && (
        <GameOverModal
          result={getResult()}
          resultType={getResultType()}
          note={getNote()}
          stats={[{ label: 'Moves', value: gameState.moveCount }]}
          onPlayAgain={resetGame}
          onHome={onClose}
        />
      )}
    </div>
  )
}
