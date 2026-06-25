import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ThreatService } from '../../services/ThreatService.js'
import SeverityBadge from '../../components/SeverityBadge.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import Timeline from '../../components/Timeline.jsx'
import { Icons } from '../../shared/icons.jsx'

function InfoRow({ label, children }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 140, fontSize: 11, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '.06em', paddingTop: 2 }}>{label}</div>
      <div style={{ flex: 1, fontSize: 13, color: 'var(--txt2)' }}>{children}</div>
    </div>
  )
}

export default function ThreatDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [incident, setIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    ThreatService.getIncidentById(id).then(data => {
      if (!data) setNotFound(true)
      else setIncident(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="loading-state">Loading incident…</div>

  if (notFound) {
    return (
      <div className="error-state">
        <p>Incident <strong>{id}</strong> not found.</p>
        <button className="btn" onClick={() => navigate('/threats')}>← Back to Threats</button>
      </div>
    )
  }

  const { title, severity, severityClass, status, statusClass, riskScore, description,
          source, assignee, opened, lastUpdated, affectedAssets, mitreIds,
          timeline, recommendedActions } = incident

  return (
    <div>
      {/* Back */}
      <div className="detail-back" onClick={() => navigate('/threats')}>
        {Icons.chevronLeft}
        Back to Threats
      </div>

      {/* Header */}
      <div className="detail-header">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <SeverityBadge severity={severity} cls={severityClass} />
            <StatusBadge status={status} cls={statusClass} />
            <span className="mono" style={{ fontSize: 12, color: 'var(--txt3)' }}>{id}</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, color: 'var(--txt)' }}>{title}</h2>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button className="btn">Assign</button>
          <button className="btn d">Escalate</button>
          <button className="btn p">Resolve</button>
        </div>
      </div>

      {/* 2-col layout */}
      <div className="g2">
        {/* Left: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Summary */}
          <div className="card">
            <div className="card-h"><h3>Incident Summary</h3></div>
            <div className="card-b">
              <p style={{ fontSize: 13, color: 'var(--txt2)', lineHeight: 1.7, marginBottom: 16 }}>{description}</p>
              <InfoRow label="Risk Score">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="pb" style={{ width: 120 }}>
                    <i style={{ width: `${riskScore}%`, background: riskScore > 80 ? 'var(--crit)' : 'var(--high)' }} />
                  </div>
                  <span className="mono" style={{ fontWeight: 700, color: riskScore > 80 ? 'var(--crit)' : 'var(--high)', fontSize: 14 }}>{riskScore}/100</span>
                </div>
              </InfoRow>
              <InfoRow label="Source Modules">
                <div style={{ display: 'flex', gap: 4 }}>
                  {source.map(s => <span key={s} className="ch">{s}</span>)}
                </div>
              </InfoRow>
              <InfoRow label="Assignee">{assignee}</InfoRow>
              <InfoRow label="Opened">{opened}</InfoRow>
              <InfoRow label="Last Updated">{lastUpdated}</InfoRow>
              <InfoRow label="MITRE IDs">
                <div style={{ display: 'flex', gap: 4 }}>
                  {mitreIds.map(m => <span key={m} className="ch mono">{m}</span>)}
                </div>
              </InfoRow>
            </div>
          </div>

          {/* Affected Assets */}
          <div className="card">
            <div className="card-h"><h3>Affected Assets</h3><span className="meta">{affectedAssets.length} assets</span></div>
            <div className="card-b">
              {affectedAssets.map(asset => (
                <div key={asset} className="row">
                  <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono,monospace', color: 'var(--txt)' }}>{asset}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="card">
            <div className="card-h"><h3>Recommended Actions</h3></div>
            <div className="card-b">
              {recommendedActions.map((a, i) => (
                <div key={i} className="row" style={{ justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--txt)' }}>{i + 1}. {a.label}</span>
                  <button className={`btn ${a.type}`}>{a.type === 'p' ? 'Execute' : a.type === 'd' ? 'Take Action' : 'View'}</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Timeline */}
        <div>
          <div className="card">
            <div className="card-h"><h3>Investigation Timeline</h3></div>
            <div className="card-b">
              <Timeline items={timeline} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
