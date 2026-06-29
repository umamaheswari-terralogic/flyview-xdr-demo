import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { NetworkService } from '../../../services/NetworkService.js'

const FILTERS = ['All', 'Unauthorized', 'Authorized']

export default function ConfigAudit() {
  const [changes, setChanges] = useState([])
  const [filter, setFilter] = useState('All')

  useEffect(() => { NetworkService.getConfigChanges().then(setChanges) }, [])

  const filtered = changes.filter(c => {
    if (filter === 'Unauthorized') return c.status === 'UNAUTHORIZED'
    if (filter === 'Authorized')   return c.status === 'AUTHORIZED'
    return true
  })

  const unauthorized = changes.filter(c => c.status === 'UNAUTHORIZED').length
  const authorized   = changes.filter(c => c.status === 'AUTHORIZED').length

  return (
    <>
      <div className="kg k3" style={{ marginBottom: 18 }}>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--crit)' }}>{unauthorized}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Unauthorized changes (7d)</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ok)' }}>{authorized}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Authorized changes (7d)</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--txt2)' }}>CR</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Change records required · ITSM enforced</div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Configuration change log
            <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
              <span style={{ color: 'var(--crit)' }}>{unauthorized} unauthorized</span> · {authorized} authorized
            </span>
          </h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {FILTERS.map(f => (
              <button key={f} className={`btn${filter === f ? ' p' : ''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
        <table>
          <thead>
            <tr>{['ID', 'Device', 'Vendor', 'Change type', 'Detail', 'Changed by', 'Time', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{c.id}</td>
                <td className="pr">{c.device}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{c.vendor}</td>
                <td><span className="ch">{c.changeType}</span></td>
                <td style={{ fontSize: 12, color: 'var(--txt2)', maxWidth: 280 }}>{c.detail}</td>
                <td className="mono" style={{ fontSize: 12 }}>{c.user}</td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{c.time}</td>
                <td><StatusBadge status={c.status} cls={c.statusCls} /></td>
                <td>
                  <div className="brow">
                    {c.status === 'UNAUTHORIZED' && <button className="btn d">Rollback</button>}
                    <button className="btn">Diff</button>
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
