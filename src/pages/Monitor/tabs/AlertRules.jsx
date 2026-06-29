import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { MonitorService } from '../../../services/MonitorService.js'

export default function AlertRules() {
  const [rules, setRules] = useState([])

  useEffect(() => { MonitorService.getAlertRules().then(setRules) }, [])

  const active   = rules.filter(r => r.status === 'ACTIVE').length
  const disabled = rules.filter(r => r.status === 'DISABLED').length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Alert Rules
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            {active} active · {disabled} disabled
          </span>
        </h3>
        <button className="btn p">+ New rule</button>
      </div>
      <table>
        <thead>
          <tr>{['Rule name', 'Condition', 'Severity', 'Targets', 'Notify', 'Triggered', 'Last fired', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rules.map(r => (
            <tr key={r.name}>
              <td className="pr">{r.name}</td>
              <td style={{ fontSize: 12, color: 'var(--txt2)', fontFamily: 'JetBrains Mono,monospace' }}>{r.condition}</td>
              <td><span className={`b ${r.sevCls}`}><i />{r.severity}</span></td>
              <td style={{ fontSize: 12, color: 'var(--txt3)' }}>{r.targets}</td>
              <td>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {r.notify.map(n => <span key={n} className="ch">{n}</span>)}
                </div>
              </td>
              <td className="mono" style={{ fontSize: 12 }}>{r.triggered}</td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{r.lastFired}</td>
              <td><StatusBadge status={r.status} cls={r.statusCls} /></td>
              <td>
                <div className="brow">
                  <button className="btn">Edit</button>
                  <button className="btn">{r.status === 'ACTIVE' ? 'Disable' : 'Enable'}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
