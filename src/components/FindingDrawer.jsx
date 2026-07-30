import SeverityBadge from './SeverityBadge.jsx'
import StatusBadge from './StatusBadge.jsx'

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function riskColor(score) {
  if (score >= 80) return 'var(--crit)'
  if (score >= 60) return 'var(--high)'
  if (score >= 40) return 'var(--med)'
  return 'var(--ok)'
}

export default function FindingDrawer({ finding, onClose, onRemediate }) {
  if (!finding) return null
  const { detail } = finding

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        {/* Header */}
        <div className="drawer-head">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <SeverityBadge severity={finding.severity} cls={finding.sevCls} />
              <StatusBadge status={finding.status} cls={finding.statusCls} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--txt)', lineHeight: 1.3 }}>{finding.resource}</div>
            <div style={{ fontSize: 11.5, color: 'var(--txt3)', marginTop: 3, fontFamily: 'JetBrains Mono, monospace' }}>{finding.id} · {finding.issue}</div>
          </div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className="drawer-body">

          {/* Description */}
          <div>
            <div className="drawer-section-title">What happened</div>
            <div className="drawer-desc">{detail.description}</div>
          </div>

          {/* Metadata grid */}
          <div>
            <div className="drawer-section-title">Finding metadata</div>
            <div className="drawer-meta-grid">
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Provider</div>
                <div className="drawer-meta-value" style={{ color: finding.providerColor }}>{finding.provider}</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Region</div>
                <div className="drawer-meta-value">{detail.affectedRegion}</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">SLA</div>
                <div className="drawer-meta-value" style={{ color: finding.slaColor }}>{finding.sla}</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">First seen</div>
                <div className="drawer-meta-value">{detail.firstSeen}</div>
              </div>
              <div className="drawer-meta-item" style={{ gridColumn: '1 / -1' }}>
                <div className="drawer-meta-label">Last seen</div>
                <div className="drawer-meta-value">{detail.lastSeen}</div>
              </div>
            </div>
          </div>

          {/* Resource owner — enriched employee context */}
          <div>
            <div className="drawer-section-title">Resource owner · employee context</div>
            <div className="drawer-owner-card">
              <div className="drawer-owner-avatar">{initials(detail.owner.name)}</div>
              <div style={{ flex: 1 }}>
                <div className="drawer-owner-name">{detail.owner.name}</div>
                <div className="drawer-owner-meta">{detail.owner.email} · {detail.owner.dept}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: 'var(--txt3)', marginBottom: 3 }}>Risk score</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: riskColor(detail.owner.riskScore), fontFamily: 'JetBrains Mono, monospace' }}>
                  {detail.owner.riskScore}
                </div>
              </div>
            </div>
          </div>

          {/* Enriched owner identity linkage */}
          {detail.enrichedOwner && (
            <div>
              <div className="drawer-section-title">Enriched owner</div>
              <div className="drawer-meta-grid">
                <div className="drawer-meta-item">
                  <div className="drawer-meta-label">User ID</div>
                  <div className="drawer-meta-value mono">{detail.enrichedOwner.userId}</div>
                </div>
                <div className="drawer-meta-item">
                  <div className="drawer-meta-label">Email</div>
                  <div className="drawer-meta-value">{detail.enrichedOwner.email}</div>
                </div>
              </div>
            </div>
          )}

          {/* Evidence */}
          {detail.evidence && (
            <div>
              <div className="drawer-section-title">Evidence</div>
              <div className="drawer-desc mono" style={{ fontSize: 11.5 }}>{detail.evidence}</div>
            </div>
          )}

          {/* DB-dump filename pattern flag */}
          {finding.dumpPatternDetected && (
            <div>
              <div className="drawer-section-title">DB-dump pattern check</div>
              <div className="drawer-desc">
                A filename/extension matching a DB-dump naming convention was detected in this resource.
                This is a pattern match only — file contents were not read or classified.
              </div>
            </div>
          )}

          {/* Recommendation — greyed out, not in scope for phase-1 */}
          <div style={{ opacity: 0.45, pointerEvents: 'none' }}>
            <div className="drawer-section-title">Recommended remediation</div>
            <div className="drawer-desc">{detail.recommendation}</div>
          </div>

          {/* MITRE tags — greyed out, not in scope for phase-1 */}
          {detail.mitre?.length > 0 && (
            <div style={{ opacity: 0.45, pointerEvents: 'none' }}>
              <div className="drawer-section-title">MITRE ATT&CK</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {detail.mitre.map(m => (
                  <span key={m} className="drawer-mitre-tag">{m}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="drawer-actions">
          {onRemediate && finding.status !== 'RESOLVED' ? (
            <button className="btn p" onClick={() => { onRemediate(finding.id); onClose() }}>Remediate</button>
          ) : (
            <button className="btn p" disabled title="Not available in Phase-1" style={{ opacity: 0.45, cursor: 'not-allowed' }}>Remediate</button>
          )}
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  )
}
