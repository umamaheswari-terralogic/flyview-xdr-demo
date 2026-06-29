import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { PrivacyService } from '../../../services/PrivacyService.js'

export default function LegalHolds() {
  const [holds, setHolds] = useState([])

  useEffect(() => { PrivacyService.getLegalHolds().then(setHolds) }, [])

  const active   = holds.filter(h => h.status === 'ACTIVE').length
  const released = holds.filter(h => h.status === 'RELEASED').length
  const blocked  = holds.reduce((sum, h) => sum + h.dsarsBlocked, 0)

  return (
    <>
      <div className="kg k3" style={{ marginBottom: 18 }}>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--crit)' }}>{active}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Active legal holds</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--high)' }}>{blocked}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>DSARs blocked by holds</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--txt2)' }}>{released}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Released holds (all time)</div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Legal Holds
            <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
              <span style={{ color: 'var(--crit)' }}>{active} active</span> · {released} released
            </span>
          </h3>
          <button className="btn p">+ New hold</button>
        </div>
        <table>
          <thead>
            <tr>{['Hold ID', 'Title', 'Case reference', 'Imposed by', 'Imposed date', 'Scope', 'DSARs blocked', 'Expires', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {holds.map(h => (
              <tr key={h.id}>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{h.id}</td>
                <td className="pr">{h.title}</td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--info)' }}>{h.caseRef}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{h.imposedBy}</td>
                <td className="mono" style={{ fontSize: 12 }}>{h.imposedAt}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)', maxWidth: 220 }}>{h.scope}</td>
                <td>
                  {h.dsarsBlocked > 0
                    ? <span className="b cr"><i />{h.dsarsBlocked} blocked</span>
                    : <span style={{ fontSize: 11, color: 'var(--txt3)' }}>—</span>
                  }
                </td>
                <td className="mono" style={{ fontSize: 12, color: h.expiresAt === 'TBD' ? 'var(--high)' : 'var(--txt3)' }}>{h.expiresAt}</td>
                <td><StatusBadge status={h.status} cls={h.statusCls} /></td>
                <td>
                  <div className="brow">
                    {h.status === 'ACTIVE' && <button className="btn d">Release</button>}
                    <button className="btn">Details</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '14px 0 4px', borderTop: '1px solid var(--border)', marginTop: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="b hi" style={{ fontSize: 10 }}><i />Note</span>
            Releasing a hold re-enables pending DSAR erasure requests. Consult legal counsel before releasing.
          </div>
        </div>
      </div>
    </>
  )
}
