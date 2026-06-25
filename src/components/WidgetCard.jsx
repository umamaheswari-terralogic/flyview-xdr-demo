export default function WidgetCard({ title, meta, children, actions }) {
  return (
    <div className="card">
      <div className="card-h">
        <h3>{title}</h3>
        {meta && <span className="meta">{meta}</span>}
        {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
      </div>
      <div className="card-b">{children}</div>
    </div>
  )
}
