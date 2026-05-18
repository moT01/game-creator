import { useState, useEffect } from 'react'
import Header from './components/Header'
import GameBoard from './GameBoard'
import ConfirmModal from './components/ConfirmModal'
import GameOverModal from './components/GameOverModal'
import { useGame } from './hooks/useGame'
import type { GameState, Player } from './hooks/useGame'
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

function playerLabel(p: Player) {
  return p === 'r' ? 'Player 1' : 'Player 2'
}

function getStatus(state: GameState, options: GameOptions): string {
  const computerSide: Player | null = options.opponent === 'computer' ? (options.side === 'r' ? 'b' : 'r') : null
  const prefix = options.opponent === 'human' ? `${playerLabel(state.currentPlayer)}: ` : ''
  if (state.phase === 'placement') {
    if (computerSide && state.currentPlayer === computerSide) return 'Computer placing...'
    return `${prefix}Place a piece`
  }
  if (computerSide && state.currentPlayer === computerSide) return 'Thinking...'
  if (state.moveSubPhase === 'select-piece') return `${prefix}Select a piece to move`
  if (state.moveSubPhase === 'select-destination') return `${prefix}Select where to move`
  return `${prefix}Select a piece to capture`
}

function getGameOverProps(state: GameState, options: GameOptions) {
  const computerSide: Player | null = options.opponent === 'computer' ? (options.side === 'r' ? 'b' : 'r') : null
  const loser: Player | null = state.winner ? (state.winner === 'r' ? 'b' : 'r') : null
  const byPieces = loser && state.pieceCounts[loser] <= 2

  if (options.opponent === 'computer') {
    const loserName = loser === computerSide ? 'Computer' : 'You'
    const note = byPieces
      ? `${loserName} ${loserName === 'You' ? 'were' : 'was'} reduced to 2 pieces`
      : `${loserName} ${loserName === 'You' ? 'have' : 'has'} no valid moves`
    if (state.winner === computerSide) return { result: 'Computer wins', resultType: 'loss' as const, note }
    return { result: 'You win!', resultType: 'win' as const, note }
  }

  const loserName = loser ? playerLabel(loser) : ''
  const note = byPieces
    ? `${loserName} was reduced to 2 pieces`
    : `${loserName} has no valid moves`
  return {
    result: state.winner ? `${playerLabel(state.winner)} wins!` : '',
    resultType: 'win' as const,
    note,
  }
}

export default function GameScreen({ theme, onThemeToggle, onHelp, onClose, options, onGameOver, onPlayAgain }: Props) {
  const { state, handleClick, quit } = useGame(options)
  const [showConfirm, setShowConfirm] = useState(false)
  const [gameOverDismissed, setGameOverDismissed] = useState(false)
  const showGameOver = state.gameOver && !gameOverDismissed

  useEffect(() => {
    if (state.gameOver) onGameOver()
  }, [state.gameOver])

  const gameOverProps = getGameOverProps(state, options)

  return (
    <div className="card">
      <Header
        variant="game"
        theme={theme}
        onThemeToggle={onThemeToggle}
        onHelp={onHelp}
        onClose={() => state.gameOver ? setGameOverDismissed(false) : setShowConfirm(true)}
        center={getStatus(state, options)}
      />
      <div className="placement-rows">
        {(['r', 'b'] as const).map(player => {
          const colored = state.phase === 'placement'
            ? 12 - state.piecesPlaced[player]
            : state.pieceCounts[player]
          return (
            <div key={player} className="placement-dots">
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className={`placement-dot ${i >= colored ? 'dot-placed' : `dot-${player}`}`}
                />
              ))}
            </div>
          )
        })}
      </div>
      <div className="game-content">
        <GameBoard state={state} onCellClick={handleClick} />
      </div>
      {showConfirm && (
        <ConfirmModal
          message="Return to the main menu? You can resume your game from there."
          confirmLabel="Quit"
          cancelLabel="Cancel"
          onConfirm={() => { quit(); onClose() }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {showGameOver && (
        <GameOverModal
          result={gameOverProps.result}
          resultType={gameOverProps.resultType}
          note={gameOverProps.note}
          onDismiss={() => setGameOverDismissed(true)}
          onPlayAgain={onPlayAgain}
          onHome={onClose}
        />
      )}
    </div>
  )
}
