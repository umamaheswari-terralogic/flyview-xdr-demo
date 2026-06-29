import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { CloudService } from '../../../services/CloudService.js'

export default function Reports() {
  const [reports, setReports] = useState([])
  const [compliance, setCompliance] = useState([])

  useEffect(() => {
    CloudService.getComplianceReports().then(setReports)
    CloudService.getCompliancePosture().then(setCompliance)
  }, [])

  const passing = reports.filter(r => r.status === 'PASSING').length
  const failing = reports.filter(r => r.status === 'FAILING').length

  return (
    <>
      <div className="kg k3" style={{ marginBottom: 18 }}>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ok)' }}>{passing}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Frameworks passing</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--crit)' }}>{failing}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Frameworks failing</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--high)' }}>C+</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Overall posture grade · ↑ from D</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>Compliance framework reports</h3>
          <button className="btn p">Export all</button>
        </div>
        <table>
          <thead>
            <tr>{['Framework', 'Score', 'Passed', 'Failed', 'N/A', 'Coverage', 'Last run', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {reports.map(r => {
              const total = r.passed + r.failed + r.na
              const pct   = Math.round((r.passed / total) * 100)
              return (
                <tr key={r.framework}>
                  <td className="pr">{r.framework}</td>
                  <td>
                    <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 14, fontWeight: 700, color: r.scoreCls === 'cr' ? 'var(--crit)' : r.scoreCls === 'hi' ? 'var(--high)' : 'var(--ok)' }}>
                      {r.score}%
                    </span>
                  </td>
                  <td className="mono" style={{ color: 'var(--ok)', fontWeight: 600 }}>{r.passed}</td>
                  <td className="mono" style={{ color: r.failed > 0 ? 'var(--crit)' : 'var(--txt3)', fontWeight: 600 }}>{r.failed}</td>
                  <td className="mono" style={{ color: 'var(--txt3)' }}>{r.na}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="pb" style={{ width: 80 }}>
                        <i style={{ width: `${pct}%`, background: r.scoreCls === 'cr' ? 'var(--crit)' : r.scoreCls === 'hi' ? 'var(--high)' : 'var(--ok)' }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{pct}%</span>
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{r.lastRun}</td>
                  <td><StatusBadge status={r.status} cls={r.statusCls} /></td>
                  <td>
                    <div className="brow">
                      <button className="btn">Download</button>
                      <button className="btn">Details</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-h"><h3>Posture trend</h3></div>
        <div className="card-b">
          {compliance.map(c => (
            <div key={c.label} className="row">
              <span className="rn">{c.label}</span>
              <div className="pb" style={{ flex: 1 }}><i style={{ width: `${c.pct}%`, background: c.color }} /></div>
              <span className="rv" style={{ color: c.color }}>{c.val}</span>
            </div>
          ))}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--txt3)' }}>
            Target: all frameworks ≥ 85% by end of Q3 2026
          </div>
        </div>
      </div>
    </>
  )
}
