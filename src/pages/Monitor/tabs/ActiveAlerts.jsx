import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { MonitorService } from '../../../services/MonitorService.js'

const FILTERS = ['All', 'Firing', 'Acknowledged']

export default function ActiveAlerts() {
  const [alerts, setAlerts] = useState([])
  const [filter, setFilter] = useState('All')

  useEffect(() => { MonitorService.getAlerts().then(setAlerts) }, [])

  const filtered = alerts.filter(a => {
    if (filter === 'Firing')       return a.status === 'firing'
    if (filter === 'Acknowledged') return a.status === 'acknowledged'
    return true
  })

  const firing = alerts.filter(a => a.status === 'firing').length
  const acked  = alerts.filter(a => a.status === 'acknowledged').length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Active Alerts
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            <span style={{ color: 'var(--crit)' }}>{firing} firing</span> · {acked} acknowledged
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`btn${filter === f ? ' p' : ''}`}
              onClick={() => setFilter(f)}
            >{f}</button>
          ))}
          <button className="btn p" style={{ marginLeft: 4 }}>+ Alert rule</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>{['ID', 'Device', 'Type', 'Severity', 'Metric', 'Rule', 'Time', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(a => (
            <tr key={a.id}>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.id}</td>
              <td className="pr">{a.device}</td>
              <td>{a.type}</td>
              <td><span className={`b ${a.sevCls}`}><i />{a.severity}</span></td>
              <td className="mono">{a.metric}</td>
              <td><span className="ch">{a.rule}</span></td>
              <td className="mono">{a.time}</td>
              <td>
                <StatusBadge status={a.status === 'firing' ? 'FIRING' : 'ACKNOWLEDGED'} cls={a.statusCls} />
                {a.ackBy && <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 2 }}>{a.ackBy}</div>}
              </td>
              <td>
                <div className="brow">
                  <button className="btn p">Run fix</button>
                  {a.status === 'firing' && <button className="btn">Acknowledge</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
