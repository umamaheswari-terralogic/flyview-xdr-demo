import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { IdentityService } from '../../../services/IdentityService.js'

export default function PrivilegedAccess() {
  const [sessions, setSessions] = useState([])
  const [requests, setRequests] = useState([])

  useEffect(() => {
    IdentityService.getPamSessions().then(setSessions)
    IdentityService.getPamRequests().then(setRequests)
  }, [])

  const activeSessions = sessions.filter(s => s.status === 'ACTIVE').length
  const pending = requests.filter(r => r.status === 'PENDING').length

  return (
    <>
      <div className="kg k3" style={{ marginBottom: 18 }}>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ok)' }}>{activeSessions}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Active elevated sessions</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: pending > 0 ? 'var(--high)' : 'var(--txt2)' }}>{pending}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Pending approval requests</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--txt2)' }}>JIT</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Just-in-time · max 4h elevation</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>Active PAM sessions</h3>
          <button className="btn p">Request JIT access</button>
        </div>
        <table>
          <thead>
            <tr>{['Session ID', 'User', 'Host', 'Reason', 'Elevation', 'Time left', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id}>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{s.id}</td>
                <td style={{ fontSize: 12 }}>{s.user}</td>
                <td className="pr">{s.host}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{s.reason}</td>
                <td><span className="ch">{s.elevated}</span></td>
                <td className="mono" style={{ color: s.status === 'EXPIRED' ? 'var(--crit)' : 'var(--high)', fontSize: 12, fontWeight: 600 }}>{s.timeLeft}</td>
                <td><StatusBadge status={s.status} cls={s.statusCls} /></td>
                <td>
                  <div className="brow">
                    {s.status === 'ACTIVE' ? <button className="btn d">Revoke</button> : <button className="btn">Audit log</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Approval requests
            {pending > 0 && <span className="meta" style={{ marginLeft: 8, color: 'var(--high)', fontWeight: 400 }}>{pending} awaiting</span>}
          </h3>
        </div>
        <table>
          <thead>
            <tr>{['Request ID', 'User', 'Host', 'Reason', 'Duration', 'Requested', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id}>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{r.id}</td>
                <td style={{ fontSize: 12 }}>{r.user}</td>
                <td className="pr">{r.host}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{r.reason}</td>
                <td><span className="ch">{r.duration}</span></td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{r.requestedAt}</td>
                <td><StatusBadge status={r.status} cls={r.statusCls} /></td>
                <td>
                  <div className="brow">
                    {r.status === 'PENDING' && <>
                      <button className="btn p">Approve</button>
                      <button className="btn d">Deny</button>
                    </>}
                    {r.status === 'APPROVED' && <button className="btn">View session</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
