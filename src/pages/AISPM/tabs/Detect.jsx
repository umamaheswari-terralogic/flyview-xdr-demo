import { useState, useEffect, useRef } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { AISPMService } from '../../../services/AISPMService.js'
import { API_BASE } from '../../../config.js'

const API = API_BASE
const FILTERS = ['All', 'Open', 'Blocked', 'Resolved']

const SIM_CHATGPT_EVENT = {
  id: 'SHADOW-001',
  domain: 'chatgpt.com',
  device: 'TVyshnavi-3941',
  user: 'vyshnavi.thatikonda@terralogic.com',
  source: 'Browser Monitor',
  detail: 'Active ChatGPT session — data exfil risk: INTERNAL content',
  risk: 'HIGH',
  riskCls: 'hi',
  time: 'Just now',
  status: 'OPEN',
  statusCls: 'hi',
  simType: 'chatgpt',
}

const SIM_EXT_EVENT = {
  id: 'SHADOW-002',
  domain: 'ChatGPT for Chrome',
  device: 'TVyshnavi-3941',
  user: 'vyshnavi.thatikonda@terralogic.com',
  source: 'MDM → AI-SPM',
  detail: 'Blocked AI browser extension detected — reported by MDM as "Blocked app installed"',
  risk: 'CRITICAL',
  riskCls: 'cr',
  time: 'Just now',
  status: 'OPEN',
  statusCls: 'cr',
  simType: 'extension',
}

export default function Detect() {
  const [staticEvents, setStaticEvents] = useState([])
  const [chatgptDetected, setChatgptDetected] = useState(false)
  const [extDetected, setExtDetected]         = useState(false)
  const [filter, setFilter] = useState('All')
  const [cgptFlash, setCgptFlash] = useState(false)
  const [extFlash, setExtFlash]   = useState(false)
  const prevCgpt = useRef(false)
  const prevExt  = useRef(false)

  useEffect(() => { AISPMService.getDetectionEvents().then(setStaticEvents) }, [])

  useEffect(() => {
    const poll = () =>
      fetch(`${API}/api/aispm/sim`)
        .then(r => r.json())
        .then(({ chatgptDetected: cg, extensionDetected: ed }) => {
          if (cg && !prevCgpt.current) { setCgptFlash(true); setTimeout(() => setCgptFlash(false), 2500) }
          if (ed && !prevExt.current)  { setExtFlash(true);  setTimeout(() => setExtFlash(false),  2500) }
          prevCgpt.current = cg
          prevExt.current  = ed
          setChatgptDetected(cg)
          setExtDetected(ed)
        })
        .catch(() => {})
    poll()
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [])

  const simRows = [
    ...(extDetected     ? [SIM_EXT_EVENT]    : []),
    ...(chatgptDetected ? [SIM_CHATGPT_EVENT] : []),
  ]
  const allEvents = [...simRows, ...staticEvents]

  const filtered = allEvents.filter(e => {
    if (filter === 'Open')     return e.status === 'OPEN'
    if (filter === 'Blocked')  return e.status === 'BLOCKED'
    if (filter === 'Resolved') return e.status === 'RESOLVED'
    return true
  })

  const open     = allEvents.filter(e => e.status === 'OPEN').length
  const critical = allEvents.filter(e => (e.riskCls ?? e.sevCls) === 'cr').length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Detection Events
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            <span style={{ color: 'var(--crit)' }}>{critical} critical</span> · {open} open
          </span>
          {(chatgptDetected || extDetected) && (
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
            {['Event ID', 'Domain / Asset', 'Device', 'User', 'Source', 'Detail', 'Risk', 'Time', 'Status', ''].map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {filtered.map(e => {
            const isSim     = !!e.simType
            const isExt     = e.simType === 'extension'
            const isCgpt    = e.simType === 'chatgpt'
            const flash     = (isCgpt && cgptFlash) || (isExt && extFlash)
            const accentColor = isExt ? 'var(--crit)' : isCgpt ? 'var(--high)' : undefined
            return (
              <tr key={e.id} style={flash ? { animation: 'rowFlash 1.2s ease 2' } : {}}>
                <td className="mono" style={{ fontSize: 11, color: accentColor ?? 'var(--txt3)', fontWeight: isSim ? 700 : 400 }}>
                  {e.id}
                </td>
                <td>
                  {isSim
                    ? <span style={{ fontWeight: 700, fontSize: 13, fontFamily: 'monospace', color: accentColor }}>{e.domain}</span>
                    : <span style={{ fontWeight: 600, fontSize: 13 }}>{e.event ?? '—'}</span>
                  }
                </td>
                <td style={{ fontWeight: isSim ? 600 : 400, fontSize: 13 }}>
                  {isSim ? e.device : (e.asset ?? '—')}
                </td>
                <td style={{ fontSize: 11, color: 'var(--txt2)' }}>
                  {e.user ?? '—'}
                </td>
                <td style={{ fontSize: 11, color: 'var(--txt3)' }}>
                  {e.source ?? '—'}
                </td>
                <td style={{ fontSize: 11, color: 'var(--txt3)', maxWidth: 240 }}>
                  {e.detail ?? '—'}
                </td>
                <td>
                  {isSim
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
