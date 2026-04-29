import './HeapRow.css'

interface Props {
  heapIndex: number
  size: number
  selected: boolean
  removeCount: number
  disabled: boolean
  onSelect: () => void
  onObjectClick: (objectIndex: number) => void
  removing: boolean
}

export default function HeapRow({
  heapIndex,
  size,
  selected,
  removeCount,
  disabled,
  onSelect,
  onObjectClick,
  removing,
}: Props) {
  const isEmpty = size === 0

  return (
    <div
      className={[
        'heap-row',
        selected ? 'heap-row--selected' : '',
        isEmpty ? 'heap-row--empty' : '',
        disabled ? 'heap-row--disabled' : '',
      ].filter(Boolean).join(' ')}
      aria-label={`Heap ${heapIndex + 1}, ${size} object${size !== 1 ? 's' : ''} remaining`}
    >
      <span className="heap-label">
        Heap {heapIndex + 1}
        {selected && size > 0 && (
          <span className="heap-count"> - {size} object{size !== 1 ? 's' : ''}</span>
        )}
      </span>

      {isEmpty ? (
        <div className="heap-objects heap-objects--empty">
          <span className="heap-empty-text">empty</span>
        </div>
      ) : (
        <div className="heap-objects">
          {Array.from({ length: size }, (_, i) => {
            const isMarked = selected && i >= size - removeCount
            const isRemoving = removing && isMarked
            return (
              <button
                key={i}
                className={[
                  'heap-object',
                  isMarked ? 'heap-object--marked' : '',
                  isRemoving ? 'heap-object--removing' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => {
                  if (disabled) return
                  if (!selected) {
                    onSelect()
                  } else {
                    // clicking object i sets removeCount = size - i
                    onObjectClick(size - i)
                  }
                }}
                disabled={disabled}
                role="button"
                aria-label={
                  selected
                    ? `Object ${i + 1} of heap ${heapIndex + 1}`
                    : `Select heap ${heapIndex + 1}`
                }
                tabIndex={disabled ? -1 : 0}
              />
            )
          })}
        </div>
      )}

      {selected && !isEmpty && (
        <div className="heap-controls">
          <button
            className="heap-ctrl-btn"
            onClick={() => onObjectClick(Math.max(1, removeCount - 1))}
            disabled={removeCount <= 1}
            aria-label="Remove fewer"
          >
            -
          </button>
          <span className="heap-ctrl-count">{removeCount}</span>
          <button
            className="heap-ctrl-btn"
            onClick={() => onObjectClick(Math.min(size, removeCount + 1))}
            disabled={removeCount >= size}
            aria-label="Remove more"
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}
