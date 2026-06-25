import { Icons } from '../shared/icons.jsx'

export default function Timeline({ items = [] }) {
  return (
    <div className="tl">
      {items.map((item, i) => (
        <div key={i} className="tl-item">
          <div className="tl-dot" style={{ background: item.color ?? 'var(--info)' }}>
            {Icons.check}
          </div>
          <div className="tl-body">
            <div className="tl-title">{item.title}</div>
            <div className="tl-time">{item.time}</div>
            {item.desc && <div className="tl-desc">{item.desc}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
