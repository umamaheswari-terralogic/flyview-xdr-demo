import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { AISPMService } from '../../../services/AISPMService.js'

const FILTERS = ['All', 'Open', 'Blocked', 'Resolved']

export default function Detect() {
  const [events, setEvents] = useState([])
  const [filter, setFilter] = useState('All')

  useEffect(() => { AISPMService.getDetectionEvents().then(setEvents) }, [])

  const filtered = events.filter(e => {
    if (filter === 'Open')     return e.status === 'OPEN'
    if (filter === 'Blocked')  return e.status === 'BLOCKED'
    if (filter === 'Resolved') return e.status === 'RESOLVED'
    return true
  })

  const open     = events.filter(e => e.status === 'OPEN').length
  const critical = events.filter(e => e.sevCls === 'cr').length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Detection Events
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            <span style={{ color: 'var(--crit)' }}>{critical} critical</span> · {open} open
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
          <tr>{['ID', 'Event', 'AI asset', 'User / source', 'Detail', 'Severity', 'Time', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(e => (
            <tr key={e.id}>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{e.id}</td>
              <td style={{ fontWeight: 600, fontSize: 13 }}>{e.event}</td>
              <td className="pr">{e.asset}</td>
              <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{e.user}</td>
              <td style={{ fontSize: 11, color: 'var(--txt3)', maxWidth: 260 }}>{e.detail}</td>
              <td><span className={`b ${e.sevCls}`}><i />{e.severity}</span></td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{e.time}</td>
              <td><StatusBadge status={e.status} cls={e.statusCls} /></td>
              <td>
                <div className="brow">
                  {e.status === 'OPEN' && <button className="btn d">Block</button>}
                  <button className="btn">Investigate</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
