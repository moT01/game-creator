import StatsRow from './StatsRow';
import './GameOptions.css';

export interface GameOptionsValue {
  mode: 'computer' | '2player';
  playerGoesFirst: boolean;
  hardMode: boolean;
}

interface Stat {
  label: string;
  value: string | number;
}

interface Props {
  value: GameOptionsValue;
  onChange: (value: GameOptionsValue) => void;
  showModeToggle?: boolean;
  showSideSelect?: boolean;
  sideLabels?: [string, string];
  showHardMode?: boolean;
  stats?: Stat[];
  statsTitle?: string;
}

export default function GameOptions({
  value,
  onChange,
  showModeToggle = false,
  showSideSelect = false,
  sideLabels = ['Go first', 'Go Second'],
  showHardMode = false,
  stats,
  statsTitle = 'Wins',
}: Props) {
  if (!showModeToggle && !showSideSelect && !showHardMode && !stats?.length) return null;

  const isComputer = !showModeToggle || value.mode === 'computer';
  const showComputerOptions = isComputer && (showSideSelect || showHardMode);
  const showStats = !!stats?.length && isComputer;

  function set(patch: Partial<GameOptionsValue>) {
    onChange({ ...value, ...patch });
  }

  return (
    <div className="game-options">
      {showModeToggle && (
        <div className="segmented-control">
          <button
            className={`segmented-control__option${value.mode === 'computer' ? ' segmented-control__option--active' : ''}`}
            onClick={() => set({ mode: 'computer' })}
          >
            vs Computer
          </button>
          <button
            className={`segmented-control__option${value.mode === '2player' ? ' segmented-control__option--active' : ''}`}
            onClick={() => set({ mode: '2player' })}
          >
            2 Player
          </button>
        </div>
      )}
      {showStats && <StatsRow title={statsTitle} stats={stats!} />}
      {showComputerOptions && (
        <div className="game-options__computer">
          {showSideSelect && (
            <div className="segmented-control">
              <button
                className={`segmented-control__option${value.playerGoesFirst ? ' segmented-control__option--active' : ''}`}
                onClick={() => set({ playerGoesFirst: true })}
              >
                {sideLabels[0]}
              </button>
              <button
                className={`segmented-control__option${!value.playerGoesFirst ? ' segmented-control__option--active' : ''}`}
                onClick={() => set({ playerGoesFirst: false })}
              >
                {sideLabels[1]}
              </button>
            </div>
          )}
          {showHardMode && (
            <label className="checkbox-row">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={value.hardMode}
                onChange={e => set({ hardMode: e.target.checked })}
              />
              <span className="checkbox-label">Hard mode</span>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
