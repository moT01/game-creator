import './StatsRow.css'

interface Stat {
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
      <span className="stats-row-title">{title}</span>
      {stats.map((stat, i) => (
        <div key={i} className="stats-row-stat">
          <span className="stats-row-value">{stat.value}</span>
        </div>
      ))}
    </div>
  )
}
