import { Icons } from '../shared/icons.jsx'

export default function TopBar({ title, subtitle }) {
  return (
    <div className="topbar">
      <div className="tb-title">
        {title && <h1 dangerouslySetInnerHTML={{ __html: title }} />}
        {subtitle && <p dangerouslySetInnerHTML={{ __html: subtitle }} />}
      </div>
      <div className="tb-acts">
        <div className="rtag">
          <div className="dot" style={{ background: 'var(--ok)' }} />
          All regions
        </div>
        <div className="ico-btn">
          {Icons.bell}
          <span className="bdg">5</span>
        </div>
        <div className="ico-btn">{Icons.info}</div>
      </div>
    </div>
  )
}
