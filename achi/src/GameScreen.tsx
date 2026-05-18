import { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import GameBoard from './GameBoard'
import ConfirmModal from './components/ConfirmModal'
import GameOverModal from './components/GameOverModal'
import { useGame } from './hooks/useGame'
import type { GameOptions } from './HomeOptions'
import './GameScreen.css'

interface Props {
  theme: 'dark' | 'light'
  onThemeToggle: () => void
  onHelp: () => void
  onClose: () => void
  options: GameOptions
  onGameOver: () => void
  onPlayAgain: () => void
}

export default function GameScreen({ theme, onThemeToggle, onHelp, onClose, options, onGameOver, onPlayAgain }: Props) {
  const { board, phase, currentPlayer, selected, winner, winningLine, noMovesPlayer, moveCount, gameOver, computerPlayer, handleCellClick } = useGame(options)
  const [showConfirm, setShowConfirm] = useState(false)
  const [gameOverDismissed, setGameOverDismissed] = useState(false)
  const showGameOver = gameOver && !gameOverDismissed

  const onGameOverRef = useRef(onGameOver)
  onGameOverRef.current = onGameOver
  useEffect(() => {
    if (gameOver) onGameOverRef.current()
  }, [gameOver])

  const isComputerTurn = computerPlayer !== null && currentPlayer === computerPlayer
  let statusText = ''
  if (!gameOver) {
    if (isComputerTurn) {
      statusText = 'Thinking...'
    } else if (options.opponent === 'computer') {
      if (phase === 'placement') statusText = 'Place a piece'
      else if (selected === null) statusText = 'Pick a piece'
      else statusText = 'Pick a destination'
    } else {
      const label = `Player ${currentPlayer === 'P1' ? '1' : '2'}`
      if (phase === 'placement') statusText = `${label}: place a piece`
      else if (selected === null) statusText = `${label}: pick a piece`
      else statusText = `${label}: pick a destination`
    }
  }

  let result = ''
  let resultType: 'win' | 'loss' | 'draw' = 'draw'
  let note = ''
  if (gameOver) {
    if (moveCount >= 50) {
      result = 'Draw'
      resultType = 'draw'
      note = '50 moves: no winner'
    } else if (winner) {
      if (options.opponent === 'computer') {
        const humanWon = winner !== computerPlayer
        result = humanWon ? 'You win!' : 'Computer wins'
        resultType = humanWon ? 'win' : 'loss'
        note = '3 in a row'
      } else {
        result = `Player ${winner === 'P1' ? '1' : '2'} wins!`
        resultType = 'win'
        note = '3 in a row'
      }
    } else if (noMovesPlayer) {
      if (options.opponent === 'computer') {
        const humanStuck = noMovesPlayer !== computerPlayer
        result = humanStuck ? 'Computer wins' : 'You win!'
        resultType = humanStuck ? 'loss' : 'win'
        note = humanStuck ? 'No moves left' : 'Computer is stuck'
      } else {
        result = `Player ${noMovesPlayer === 'P1' ? '1' : '2'} is stuck!`
        resultType = 'win'
        note = 'No moves left'
      }
    }
  }

  return (
    <div className="card">
      <Header
        variant="game"
        theme={theme}
        onThemeToggle={onThemeToggle}
        onHelp={onHelp}
        onClose={() => gameOver ? setGameOverDismissed(false) : setShowConfirm(true)}
        center={statusText}
      />
      <div className="game-content">
        <GameBoard
          board={board}
          phase={phase}
          currentPlayer={currentPlayer}
          selected={selected}
          winner={winner}
          winningLine={winningLine}
          computerPlayer={computerPlayer}
          gameOver={gameOver}
          handleCellClick={handleCellClick}
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
      {showGameOver && (
        <GameOverModal
          result={result}
          resultType={resultType}
          note={note}
          onDismiss={() => setGameOverDismissed(true)}
          onPlayAgain={onPlayAgain}
          onHome={onClose}
        />
      )}
    </div>
  )
}
