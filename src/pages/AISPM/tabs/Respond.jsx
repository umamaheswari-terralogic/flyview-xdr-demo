import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { AISPMService } from '../../../services/AISPMService.js'

const ACTION_COLOR = { Block: 'var(--crit)', Revoke: 'var(--high)', Contain: 'var(--high)', Remediate: 'var(--med)', Approve: 'var(--ok)' }

export default function Respond() {
  const [actions, setActions] = useState([])

  useEffect(() => { AISPMService.getResponseActions().then(setActions) }, [])

  const pending  = actions.filter(a => a.status === 'PENDING').length
  const done     = actions.filter(a => a.status === 'DONE').length

  return (
    <>
      <div className="kg k3" style={{ marginBottom: 18 }}>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: pending > 0 ? 'var(--high)' : 'var(--txt2)' }}>{pending}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Pending response actions</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ok)' }}>{done}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Completed actions</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--txt2)' }}>BLOCK</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Recommended for 2 shadow AI tools</div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Response actions
            <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
              <span style={{ color: 'var(--high)' }}>{pending} pending approval</span> · {done} done
            </span>
          </h3>
          <button className="btn p">+ New action</button>
        </div>
        <table>
          <thead>
            <tr>{['Action ID', 'Trigger', 'Action', 'AI asset', 'Analyst', 'Recommendation', 'Created', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {actions.map(a => (
              <tr key={a.id}>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.id}</td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--info)' }}>{a.trigger}</td>
                <td style={{ fontSize: 12, fontWeight: 500 }}>{a.action}</td>
                <td className="pr">{a.asset}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{a.analyst}</td>
                <td>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: ACTION_COLOR[a.recommended] ?? 'var(--txt2)',
                    background: 'var(--bg3)', padding: '2px 7px', borderRadius: 4
                  }}>{a.recommended}</span>
                </td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.createdAt}</td>
                <td><StatusBadge status={a.status} cls={a.statusCls} /></td>
                <td>
                  <div className="brow">
                    {a.status === 'PENDING' && <>
                      <button className="btn p">Approve</button>
                      <button className="btn">Dismiss</button>
                    </>}
                    {a.status === 'DONE' && <button className="btn">Audit log</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '14px 0 4px', borderTop: '1px solid var(--border)', marginTop: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="b cr" style={{ fontSize: 10 }}><i />Action required</span>
            2 shadow AI tools (Cursor AI, Grammarly) recommended for immediate proxy block. Approve to enforce via network policy.
          </div>
        </div>
      </div>
    </>
  )
}
