import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { MonitorService } from '../../../services/MonitorService.js'

const CATEGORY_COLORS = {
  Disk: 'var(--info)', Process: 'var(--orange)', Security: 'var(--crit)',
  Network: 'var(--ok)', Storage: 'var(--med)',
}

export default function Scripts() {
  const [scripts, setScripts] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => { MonitorService.getScripts().then(setScripts) }, [])

  const filtered = scripts.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    s.platform.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="card">
      <div className="card-h">
        <h3>Script Library
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>{scripts.length} scripts</span>
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="srch"
            placeholder="Search scripts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn p">+ New script</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>{['Script name', 'Category', 'Platform', 'Runs', 'Schedule', 'Last run', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(s => (
            <tr key={s.id}>
              <td className="pr">{s.name}</td>
              <td>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: CATEGORY_COLORS[s.category] ?? 'var(--txt2)',
                  background: 'var(--bg3)', padding: '2px 7px', borderRadius: 4
                }}>{s.category}</span>
              </td>
              <td style={{ fontSize: 12, color: 'var(--txt3)' }}>{s.platform}</td>
              <td className="mono" style={{ fontSize: 12 }}>{s.runs}</td>
              <td><span className="ch">{s.schedule}</span></td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{s.lastRun}</td>
              <td><StatusBadge status={s.status} cls={s.statusCls} /></td>
              <td>
                <div className="brow">
                  <button className={`btn${s.categoryCls === 'cr' ? ' p' : ''}`}>Run</button>
                  <button className="btn">Edit</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
