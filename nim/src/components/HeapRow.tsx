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

  const isSelectable = !disabled && !isEmpty

  return (
    <div
      className={[
        'heap-row',
        selected ? 'heap-row--selected' : '',
        isEmpty ? 'heap-row--empty' : '',
        disabled ? 'heap-row--disabled' : '',
        isSelectable ? 'heap-row--selectable' : '',
      ].filter(Boolean).join(' ')}
      onClick={() => {
        if (!isSelectable) return
        if (!selected) {
          onSelect()
        } else {
          onObjectClick((removeCount % size) + 1)
        }
      }}
      role={isSelectable ? 'button' : undefined}
      tabIndex={isSelectable ? 0 : undefined}
      onKeyDown={(e) => {
        if (!isSelectable || !(e.key === 'Enter' || e.key === ' ')) return
        if (!selected) {
          onSelect()
        } else {
          onObjectClick((removeCount % size) + 1)
        }
      }}
      aria-label={`Heap ${heapIndex + 1}, ${size} object${size !== 1 ? 's' : ''} remaining`}
    >
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
              <div
                key={i}
                className={[
                  'heap-object',
                  isMarked ? 'heap-object--marked' : '',
                  isRemoving ? 'heap-object--removing' : '',
                ].filter(Boolean).join(' ')}
              />
            )
          })}
        </div>
      )}

      <span className="heap-label">Heap {heapIndex + 1}</span>
      <span className="heap-count">{size} object{size !== 1 ? 's' : ''}</span>


    </div>
  )
}
