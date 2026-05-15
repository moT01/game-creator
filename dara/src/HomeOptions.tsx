import { createStorage } from './hooks/useStorage'
import SegmentedControl from './components/SegmentedControl'
import StatsRow from './components/StatsRow'
import type { Player } from './hooks/useGame'
import './HomeOptions.css'

export interface GameOptions {
  opponent: 'computer' | 'human'
  side: Player
}

export const DEFAULT_OPTIONS: GameOptions = {
  opponent: 'computer',
  side: 'r',
}

const winsStorage = createStorage<{ r: number; b: number }>('dara_wins')

interface Props {
  value: GameOptions
  onChange: (value: GameOptions) => void
}

export default function HomeOptions({ value, onChange }: Props) {
  const wins = winsStorage.load() ?? { r: 0, b: 0 }

  const statsVsHuman = [
    { label: 'Red wins', value: wins.r },
    { label: 'Black wins', value: wins.b },
  ]
  const statsVsComputer = [{ label: 'Your wins', value: value.side === 'r' ? wins.r : wins.b }]

  return (
    <div className="home-options">
      <div className="game-heading">
        <h1 className="game-title">Dara</h1>
        <p className="game-subtitle">A Nigerian strategy game</p>
      </div>
      <SegmentedControl
        className="opponent-select"
        options={[
          { label: 'vs Computer', value: 'computer' },
          { label: '2 Player', value: 'human' },
        ]}
        value={value.opponent}
        onChange={(opponent) => onChange({ ...value, opponent })}
      />
      {value.opponent === 'computer' && (
        <>
          <SegmentedControl
            small
            options={[
              { label: 'Red', value: 'r' },
              { label: 'Black', value: 'b' },
            ]}
            value={value.side}
            onChange={(side) => onChange({ ...value, side })}
          />
          <StatsRow stats={statsVsComputer} />
        </>
      )}
      {value.opponent === 'human' && (
        <StatsRow stats={statsVsHuman} />
      )}
    </div>
  )
}
