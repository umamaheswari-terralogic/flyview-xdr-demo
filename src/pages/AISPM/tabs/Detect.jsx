import { useState, useEffect, useRef } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { AISPMService } from '../../../services/AISPMService.js'

const API = 'http://localhost:3001'
const FILTERS = ['All', 'Open', 'Blocked', 'Resolved']

const SIM_CLI_EVENT = {
  id: 'SIM-001',
  event: 'Shadow AI process spawned',
  asset: 'Ollama / LLaMA 3',
  user: 'vyshnavi.thatikonda@terralogic.com · LT-VyshnaviT-3941',
  detail: 'ollama run llama3 detected via process telemetry — unregistered local LLM, no DLP coverage, model weights stored on disk',
  severity: 'CRITICAL',
  sevCls: 'cr',
  time: 'Just now',
  status: 'OPEN',
  statusCls: 'cr',
  sim: true,
}

const SIM_CHATGPT_EVENT = {
  id: 'SIM-002',
  event: 'Unauthorized SaaS AI session',
  asset: 'ChatGPT Plus (chatgpt.com)',
  user: 'vyshnavi.thatikonda@terralogic.com · Chrome',
  detail: 'Active ChatGPT session — 12 conversation turns, 4.2 KB of internal project data pasted; no DLP policy in effect',
  severity: 'HIGH',
  sevCls: 'hi',
  time: 'Just now',
  status: 'OPEN',
  statusCls: 'cr',
  sim: true,
}

export default function Detect() {
  const [events, setEvents]   = useState([])
  const [filter, setFilter]   = useState('All')
  const [cliLlm, setCliLlm]  = useState(false)
  const [chatgpt, setChatgpt] = useState(false)
  const prevCli  = useRef(false)
  const prevCgpt = useRef(false)
  const [flashIds, setFlashIds] = useState(new Set())

  useEffect(() => { AISPMService.getDetectionEvents().then(setEvents) }, [])

  // Poll sim status every 3s
  useEffect(() => {
    const poll = () =>
      fetch(`${API}/api/aispm/sim`)
        .then(r => r.json())
        .then(({ cliLlmActive, chatgptActive }) => {
          if (cliLlmActive  && !prevCli.current)  triggerFlash('SIM-001')
          if (chatgptActive && !prevCgpt.current) triggerFlash('SIM-002')
          prevCli.current  = cliLlmActive
          prevCgpt.current = chatgptActive
          setCliLlm(cliLlmActive)
          setChatgpt(chatgptActive)
        })
        .catch(() => {})
    poll()
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [])

  const triggerFlash = (id) => {
    setFlashIds(prev => new Set([...prev, id]))
    setTimeout(() => setFlashIds(prev => { const n = new Set(prev); n.delete(id); return n }), 2500)
  }

  // Build sim events — prepend to list
  const simEvents = [
    ...(cliLlm  ? [SIM_CLI_EVENT]    : []),
    ...(chatgpt ? [SIM_CHATGPT_EVENT] : []),
  ]
  const allEvents = [...simEvents, ...events]

  const filtered = allEvents.filter(e => {
    if (filter === 'Open')     return e.status === 'OPEN'
    if (filter === 'Blocked')  return e.status === 'BLOCKED'
    if (filter === 'Resolved') return e.status === 'RESOLVED'
    return true
  })

  const open     = allEvents.filter(e => e.status === 'OPEN').length
  const critical = allEvents.filter(e => e.sevCls === 'cr').length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Detection Events
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            <span style={{ color: 'var(--crit)' }}>{critical} critical</span> · {open} open
          </span>
          {simEvents.length > 0 && (
            <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 600, color: 'var(--crit)', background: 'rgba(239,68,68,.1)', padding: '2px 8px', borderRadius: 4 }}>
              {simEvents.length} live sim event{simEvents.length > 1 ? 's' : ''}
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
          <tr>{['ID', 'Event', 'AI asset', 'User / source', 'Detail', 'Severity', 'Time', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(e => (
            <tr
              key={e.id}
              style={flashIds.has(e.id) ? { animation: 'rowFlash 1.2s ease 2' } : {}}
            >
              <td className="mono" style={{ fontSize: 11, color: e.sim ? 'var(--crit)' : 'var(--txt3)', fontWeight: e.sim ? 700 : 400 }}>
                {e.id}
                {e.sim && (
                  <div style={{ marginTop: 2 }}>
                    <span className="dot" style={{ background: 'var(--crit)', width: 6, height: 6, display: 'inline-block' }} />
                  </div>
                )}
              </td>
              <td style={{ fontWeight: 600, fontSize: 13 }}>
                {e.event}
                {e.sim && (
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--crit)', marginTop: 2, letterSpacing: .3 }}>SIM · LIVE</div>
                )}
              </td>
              <td className="pr">{e.asset}</td>
              <td style={{ fontSize: 11, color: 'var(--txt2)' }}>{e.user}</td>
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
