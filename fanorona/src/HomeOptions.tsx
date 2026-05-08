import { useState } from 'react'
import SegmentedControl from './components/SegmentedControl'
import StatsRow from './components/StatsRow'
import { createStorage } from './hooks/useStorage'
import './HomeOptions.css'

export interface GameOptions {
  opponent: 'computer' | '2player'
}

export const DEFAULT_OPTIONS: GameOptions = {
  opponent: 'computer',
}

const winsStorage = createStorage<number>('fanorona_wins')

interface Props {
  value: GameOptions
  onChange: (value: GameOptions) => void
}

export default function HomeOptions({ value, onChange }: Props) {
  const [wins] = useState(() => winsStorage.load() ?? 0)
  return (
    <div className="home-options">
      <div className="game-heading">
        <h1 className="game-title">Fanorona</h1>
        <p className="game-subtitle">Capture or be captured</p>
      </div>
      <SegmentedControl
        className="opponent-select"
        options={[
          { label: 'vs Computer', value: 'computer' },
          { label: '2 Player', value: '2player' },
        ]}
        value={value.opponent}
        onChange={opponent => onChange({ ...value, opponent })}
      />
      {value.opponent === 'computer' && (
        <StatsRow stats={[{ label: 'Wins', value: wins }]} />
      )}
    </div>
  )
}
