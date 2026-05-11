import './StatsRow.css'

interface Stat {
  label: string
  value: string | number
}

interface Props {
  stats: Stat[]
}

export default function StatsRow({ stats }: Props) {
  if (!stats.length) return null

  return (
    <div className="stats-row">
      {stats.map((stat, i) => (
        <div key={i} className="stats-row-stat">
          <span className="stats-row-label">{stat.label}</span>
          <span className="stats-row-value">{stat.value}</span>
        </div>
      ))}
    </div>
  )
}
