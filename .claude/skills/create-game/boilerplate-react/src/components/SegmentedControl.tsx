import './SegmentedControl.css'

interface Option<T extends string> {
  label: string
  value: T
}

interface Props<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

export default function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <div className="segmented-control">
      {options.map(opt => (
        <button
          key={opt.value}
          className={`segmented-control__option${value === opt.value ? ' segmented-control__option--active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
