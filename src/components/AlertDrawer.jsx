// Generic slide-in drawer used by Identity and Monitor for alert details.
// Props:
//   alert   — { title, sevCls, severity, sections: [{ label, items: [{ key, value, mono?, color? }] }], tags?, actions? }
//   onClose — () => void

export default function AlertDrawer({ alert, onClose }) {
  if (!alert) return null

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        {/* Header */}
        <div className="drawer-head">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className={`b ${alert.sevCls}`}><i />{alert.severity}</span>
              {alert.status && (
                <span className={`b ${alert.statusCls ?? 'hi'}`}><i />{alert.status}</span>
              )}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--txt)', lineHeight: 1.3 }}>
              {alert.title}
            </div>
            {alert.subtitle && (
              <div style={{ fontSize: 11.5, color: 'var(--txt3)', marginTop: 3, fontFamily: 'JetBrains Mono, monospace' }}>
                {alert.subtitle}
              </div>
            )}
          </div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {alert.sections?.map((sec, i) => (
            <div key={i}>
              <div className="drawer-section-title">{sec.label}</div>

              {/* Plain description paragraph */}
              {sec.desc && <div className="drawer-desc">{sec.desc}</div>}

              {/* Key-value metadata grid */}
              {sec.items && (
                <div className="drawer-meta-grid">
                  {sec.items.map(it => (
                    <div
                      key={it.key}
                      className="drawer-meta-item"
                      style={it.wide ? { gridColumn: '1 / -1' } : {}}
                    >
                      <div className="drawer-meta-label">{it.key}</div>
                      <div
                        className={`drawer-meta-value${it.mono ? ' mono' : ''}`}
                        style={it.color ? { color: it.color } : {}}
                      >
                        {it.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Detection chain steps */}
              {sec.steps && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sec.steps.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{
                        flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                        background: idx === 0 ? 'var(--orange)' : idx === 1 ? 'var(--high)' : 'var(--crit)',
                        color: '#fff', fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{idx + 1}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--txt)', marginBottom: 2 }}>{s.signal}</div>
                        <div style={{ fontSize: 12, color: 'var(--txt2)' }}>{s.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* MITRE / tag pills */}
          {alert.tags?.length > 0 && (
            <div>
              <div className="drawer-section-title">MITRE ATT&CK</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {alert.tags.map(t => (
                  <span key={t} className="drawer-mitre-tag">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Analyst note */}
          {alert.analystNote && (
            <div style={{
              background: 'rgba(148,163,184,.07)', border: '1px solid rgba(148,163,184,.15)',
              borderRadius: 6, padding: '8px 12px', fontSize: 11.5, color: 'var(--txt3)',
              display: 'flex', gap: 7,
            }}>
              <span>ⓘ</span><span><b>Analyst note:</b> {alert.analystNote}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="drawer-actions">
          {alert.actions?.map((a, i) => (
            <button key={i} className={`btn${a.danger ? ' d' : a.primary ? ' p' : ''}`} onClick={a.onClick}>
              {a.label}
            </button>
          ))}
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  )
}
