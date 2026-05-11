import { createStorage } from './hooks/useStorage';
import SegmentedControl from './components/SegmentedControl';
import StatsRow from './components/StatsRow';
import './HomeOptions.css';

export interface GameOptions {
  opponent: 'computer' | '2player';
  side: 'P1' | 'P2';
}

export const DEFAULT_OPTIONS: GameOptions = {
  opponent: 'computer',
  side: 'P1',
};

const winsStorage = createStorage<{ player: number; computer: number }>('achi_wins');

interface Props {
  value: GameOptions;
  onChange: (value: GameOptions) => void;
}

export default function HomeOptions({ value, onChange }: Props) {
  const wins = winsStorage.load() ?? { player: 0, computer: 0 };
  return (
    <div className="home-options">
      <div className="game-heading">
        <h1 className="game-title">Achi</h1>
        <p className="game-subtitle">The classic Ghanaian strategy game</p>
      </div>
      <SegmentedControl
        className="opponent-select"
        options={[
          { label: 'vs Computer', value: 'computer' },
          { label: '2 Player', value: '2player' },
        ]}
        value={value.opponent}
        onChange={(opponent) => onChange({ ...value, opponent })}
      />
      {value.opponent === 'computer' && (
        <>
          <StatsRow stats={[{ label: 'Wins', value: wins.player }]} />
          <SegmentedControl
            small
            options={[
              { label: 'Go first', value: 'P1' },
              { label: 'Go second', value: 'P2' },
            ]}
            value={value.side}
            onChange={(side) => onChange({ ...value, side })}
          />
        </>
      )}
    </div>
  );
}
