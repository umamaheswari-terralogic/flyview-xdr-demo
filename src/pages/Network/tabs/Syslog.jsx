import { useState, useEffect } from 'react'
import { NetworkService } from '../../../services/NetworkService.js'

const SEV_LEVELS = ['All', 'CRIT', 'ERROR', 'WARN', 'INFO']
const SEV_COLOR  = { CRIT: 'var(--crit)', ERROR: 'var(--crit)', WARN: 'var(--high)', INFO: 'var(--txt3)' }

export default function Syslog() {
  const [logs, setLogs] = useState([])
  const [sev, setSev] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => { NetworkService.getSyslogs().then(setLogs) }, [])

  const filtered = logs.filter(l => {
    const matchSev = sev === 'All' || l.severity === sev
    const q = search.toLowerCase()
    const matchSearch = !q || l.device.toLowerCase().includes(q) || l.message.toLowerCase().includes(q)
    return matchSev && matchSearch
  })

  const critCount  = logs.filter(l => l.severity === 'CRIT' || l.severity === 'ERROR').length
  const warnCount  = logs.filter(l => l.severity === 'WARN').length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Syslog
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            <span style={{ color: 'var(--crit)' }}>{critCount} critical/error</span> · {warnCount} warnings
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            className="srch"
            placeholder="Filter messages…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {SEV_LEVELS.map(s => (
            <button key={s} className={`btn${sev === s ? ' p' : ''}`} onClick={() => setSev(s)}>{s}</button>
          ))}
        </div>
      </div>
      <table>
        <thead>
          <tr>{['ID', 'Device', 'Severity', 'Facility', 'Message', 'Time'].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(l => (
            <tr key={l.id}>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{l.id}</td>
              <td className="pr">{l.device}</td>
              <td>
                <span style={{
                  fontFamily: 'JetBrains Mono,monospace', fontSize: 11, fontWeight: 700,
                  color: SEV_COLOR[l.severity] ?? 'var(--txt2)'
                }}>{l.severity}</span>
              </td>
              <td><span className="ch">{l.facility}</span></td>
              <td style={{ fontSize: 12, color: 'var(--txt2)', maxWidth: 420, wordBreak: 'break-word' }}>{l.message}</td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)', whiteSpace: 'nowrap' }}>{l.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
