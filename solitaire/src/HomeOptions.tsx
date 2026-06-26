import type { GameOptions } from './gameLogic'
import { formatTime } from './gameLogic'
import { createStorage } from './hooks/useStorage'
import SegmentedControl from './components/SegmentedControl'
import StatsRow from './components/StatsRow'
import './HomeOptions.css'

export type { GameOptions }

export const DEFAULT_OPTIONS: GameOptions = { drawCount: 1 }

const wins1Storage = createStorage<number>('solitaire_wins_draw1')
const wins3Storage = createStorage<number>('solitaire_wins_draw3')
const best1Storage = createStorage<number>('solitaire_best_draw1')
const best3Storage = createStorage<number>('solitaire_best_draw3')

interface Props {
  value: GameOptions
  onChange: (value: GameOptions) => void
}

export default function HomeOptions({ value, onChange }: Props) {
  const wins1 = wins1Storage.load() ?? 0
  const wins3 = wins3Storage.load() ?? 0
  const best1 = best1Storage.load()
  const best3 = best3Storage.load()

  const wins = value.drawCount === 1 ? wins1 : wins3
  const best = value.drawCount === 1 ? best1 : best3

  return (
    <div className="home-options">
      <div className="game-heading">
        <h1 className="game-title">Solitaire</h1>
        <p className="game-subtitle">Klondike</p>
      </div>
      <SegmentedControl<'1' | '3'>
        options={[
          { label: 'Draw 1', value: '1' },
          { label: 'Draw 3', value: '3' },
        ]}
        value={String(value.drawCount) as '1' | '3'}
        onChange={(v) => onChange({ ...value, drawCount: Number(v) as 1 | 3 })}
      />
      <StatsRow stats={[
        { label: 'Wins', value: wins },
        { label: 'Best Time', value: best !== null ? formatTime(best) : '--' },
      ]} />
    </div>
  )
}
