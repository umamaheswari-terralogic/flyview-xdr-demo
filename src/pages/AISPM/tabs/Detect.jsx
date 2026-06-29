import { useState, useEffect, useRef } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { AISPMService } from '../../../services/AISPMService.js'

const API = 'http://localhost:3001'
const FILTERS = ['All', 'Open', 'Blocked', 'Resolved']

export default function Detect() {
  const [staticEvents, setStaticEvents] = useState([])
  const [simEvent,     setSimEvent]     = useState(null)
  const [filter,       setFilter]       = useState('All')
  const [flash,        setFlash]        = useState(false)
  const prevDetected = useRef(false)

  // Load static events from JSON once
  useEffect(() => { AISPMService.getDetectionEvents().then(setStaticEvents) }, [])

  // Poll sim state every 3s — same as Devices
  useEffect(() => {
    const poll = () =>
      fetch(`${API}/api/aispm/sim`)
        .then(r => r.json())
        .then(({ chatgptDetected, event }) => {
          if (chatgptDetected && !prevDetected.current) {
            setFlash(true)
            setTimeout(() => setFlash(false), 2500)
          }
          prevDetected.current = chatgptDetected
          setSimEvent(event)
        })
        .catch(() => {})
    poll()
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [])

  const allEvents = [
    ...(simEvent ? [simEvent] : []),
    ...staticEvents,
  ]

  const filtered = allEvents.filter(e => {
    if (filter === 'Open')     return e.status === 'OPEN'
    if (filter === 'Blocked')  return e.status === 'BLOCKED'
    if (filter === 'Resolved') return e.status === 'RESOLVED'
    return true
  })

  const open     = allEvents.filter(e => e.status === 'OPEN').length
  const critical = allEvents.filter(e => (e.sevCls ?? e.riskCls) === 'cr').length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Detection Events
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            <span style={{ color: 'var(--crit)' }}>{critical} critical</span> · {open} open
          </span>
          {simEvent && (
            <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 600, color: 'var(--high)', background: 'rgba(245,158,11,.12)', padding: '2px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span className="dot" style={{ background: 'var(--high)', width: 6, height: 6 }} /> Shadow AI detected
            </span>
          )}
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map(f => (
            <button key={f} className={`btn${filter === f ? ' p' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            {['Event ID', 'Domain', 'Device', 'User', 'Source', 'Detail', 'Risk', 'Time', 'Status', ''].map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {filtered.map(e => {
            const isLive = e.id === 'SHADOW-001'
            return (
              <tr key={e.id} style={isLive && flash ? { animation: 'rowFlash 1.2s ease 2' } : {}}>
                <td className="mono" style={{ fontSize: 11, color: isLive ? 'var(--high)' : 'var(--txt3)', fontWeight: isLive ? 700 : 400 }}>
                  {e.id}
                </td>
                <td>
                  {isLive
                    ? <span style={{ fontWeight: 700, fontSize: 13, fontFamily: 'monospace', color: 'var(--high)' }}>{e.domain}</span>
                    : <span style={{ fontWeight: 600, fontSize: 13 }}>{e.event ?? '—'}</span>
                  }
                </td>
                <td style={{ fontWeight: isLive ? 600 : 400, fontSize: 13 }}>
                  {isLive ? e.device : (e.asset ?? '—')}
                </td>
                <td style={{ fontSize: 11, color: 'var(--txt2)' }}>
                  {e.user ?? '—'}
                </td>
                <td style={{ fontSize: 11, color: 'var(--txt3)' }}>
                  {isLive ? e.source : (e.source ?? '—')}
                </td>
                <td style={{ fontSize: 11, color: 'var(--txt3)', maxWidth: 240 }}>
                  {e.detail ?? '—'}
                </td>
                <td>
                  {isLive
                    ? <span className={`b ${e.riskCls}`}><i />{e.risk}</span>
                    : <span className={`b ${e.sevCls}`}><i />{e.severity}</span>
                  }
                </td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{e.time}</td>
                <td><StatusBadge status={e.status} cls={e.statusCls} /></td>
                <td>
                  <div className="brow">
                    {e.status === 'OPEN' && <button className="btn d">Block</button>}
                    <button className="btn">Investigate</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
