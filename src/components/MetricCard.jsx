export default function MetricCard({ cls, num, desc, label, foot, icon }) {
  return (
    <div className={`kc ${cls}`}>
      <div className="kl">
        <span className="klab">{label}</span>
        <div className="ki">{icon}</div>
      </div>
      <div className="kn">{num}</div>
      <div className="kd">{desc}</div>
      {foot && <div className="kf" dangerouslySetInnerHTML={{ __html: foot }} />}
    </div>
  )
}
