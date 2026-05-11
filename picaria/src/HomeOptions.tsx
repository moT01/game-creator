import { createStorage } from './hooks/useStorage'
import SegmentedControl from './components/SegmentedControl'
import StatsRow from './components/StatsRow'
import './HomeOptions.css'

const winsStorage = createStorage<number>('picaria_wins')

export interface GameOptions {
  opponent: 'computer' | '2player'
  side: 'first' | 'second'
}

export const DEFAULT_OPTIONS: GameOptions = {
  opponent: 'computer',
  side: 'first',
}

interface Props {
  value: GameOptions
  onChange: (value: GameOptions) => void
}

export default function HomeOptions({ value, onChange }: Props) {
  const wins = winsStorage.load() ?? 0
  return (
    <div className="home-options">
      <div className="game-heading">
        <h1 className="game-title">Picaria</h1>
        <p className="game-subtitle">A traditional Zuni strategy game</p>
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
        <>
        <StatsRow stats={[{ label: 'Wins', value: wins }]} />
        <SegmentedControl
          small
          options={[
            { label: 'Go First', value: 'first' },
            { label: 'Go Second', value: 'second' },
          ]}
          value={value.side}
          onChange={side => onChange({ ...value, side })}
        />
        </>
      )}
    </div>
  )
}
