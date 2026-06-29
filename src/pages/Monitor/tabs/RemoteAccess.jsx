import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { MonitorService } from '../../../services/MonitorService.js'

const SESSION_TYPE_COLOR = { RDP: 'var(--info)', SSH: 'var(--ok)' }

export default function RemoteAccess() {
  const [sessions, setSessions] = useState([])

  useEffect(() => { MonitorService.getRemoteSessions().then(setSessions) }, [])

  const active = sessions.filter(s => s.status === 'ACTIVE').length
  const ended  = sessions.filter(s => s.status === 'ENDED').length

  return (
    <>
      <div className="kg k3" style={{ marginBottom: 18 }}>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ok)' }}>{active}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Active sessions</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--txt2)' }}>{ended}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Sessions today</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--txt2)' }}>2FA</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Auth required · All sessions</div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Remote Sessions</h3>
          <button className="btn p">+ New session</button>
        </div>
        <table>
          <thead>
            <tr>{['Session ID', 'Analyst', 'Device', 'Type', 'Started', 'Duration', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id}>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{s.id}</td>
                <td style={{ fontSize: 12 }}>{s.analyst}</td>
                <td className="pr">{s.device}</td>
                <td>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: SESSION_TYPE_COLOR[s.type] ?? 'var(--txt2)',
                    background: 'var(--bg3)', padding: '2px 7px', borderRadius: 4
                  }}>{s.type}</span>
                </td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{s.started}</td>
                <td className="mono" style={{ fontSize: 12 }}>{s.duration}</td>
                <td><StatusBadge status={s.status} cls={s.statusCls} /></td>
                <td>
                  <div className="brow">
                    {s.status === 'ACTIVE'
                      ? <button className="btn d">Terminate</button>
                      : <button className="btn">Audit log</button>
                    }
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
