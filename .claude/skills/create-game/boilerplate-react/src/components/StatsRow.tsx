import './StatsRow.css'

interface Stat {
  label: string
  value: string | number
}

interface Props {
  title: string
  stats: Stat[]
}

export default function StatsRow({ title, stats }: Props) {
  if (!stats.length) return null

  return (
    <div className="stats-row">
      <span className="stats-row__title">{title}</span>
      {stats.map((stat, i) => (
        <div key={i} className="stats-row__stat">
          <span className="stats-row__label">{stat.label}</span>
          <span className="stats-row__value">{stat.value}</span>
        </div>
      ))}
    </div>
  )
}
