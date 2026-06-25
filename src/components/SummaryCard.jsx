export default function SummaryCard({ severity, icon, label, value, desc, trend, trendColor, onClick }) {
  return (
    <div className={`sc ${severity}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="sci">{icon}</div>
      <div className="sc-lbl">{label}</div>
      <div className="sc-val">{value}</div>
      <div className="sc-desc">{desc}</div>
      {trend && <div className="sc-tr" style={{ color: trendColor }}>{trend}</div>}
    </div>
  )
}
