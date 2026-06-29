import './Tile.css';

interface TileProps {
  value: number;
  isBlank: boolean;
  isMovable: boolean;
  onClick: () => void;
}

export function Tile({ value, isBlank, isMovable, onClick }: TileProps) {
  if (isBlank) {
    return <div className="tile tile--blank" aria-hidden="true" />;
  }

  return (
    <button
      className={`tile tile--numbered${isMovable ? ' tile--movable' : ''}`}
      onClick={isMovable ? onClick : undefined}
      aria-disabled={!isMovable || undefined}
      aria-label={`Tile ${value}`}
    >
      {value}
    </button>
  );
}
