import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { MonitorService } from '../../../services/MonitorService.js'

const FILTERS = ['All', 'Unpatched', 'In Progress', 'Patched']

export default function Patches() {
  const [patches, setPatches] = useState([])
  const [filter, setFilter] = useState('All')

  useEffect(() => { MonitorService.getPatches().then(setPatches) }, [])

  const filtered = patches.filter(p => {
    if (filter === 'Unpatched')   return p.status === 'UNPATCHED'
    if (filter === 'In Progress') return p.status === 'IN PROGRESS'
    if (filter === 'Patched')     return p.status === 'PATCHED'
    return true
  })

  const unpatched   = patches.filter(p => p.status === 'UNPATCHED').length
  const inProgress  = patches.filter(p => p.status === 'IN PROGRESS').length
  const patched     = patches.filter(p => p.status === 'PATCHED').length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Patch Management
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            <span style={{ color: 'var(--crit)' }}>{unpatched} unpatched</span>
            {' · '}<span style={{ color: 'var(--high)' }}>{inProgress} in progress</span>
            {' · '}{patched} patched
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map(f => (
            <button key={f} className={`btn${filter === f ? ' p' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
          <button className="btn p" style={{ marginLeft: 4 }}>Deploy selected</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>{['CVE', 'Product', 'EPSS score', 'Severity', 'Affected', 'Patched', 'Coverage', 'Status', 'Published', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(p => {
            const pct = p.affected === 0 ? 0 : Math.round((p.patched / p.affected) * 100)
            const barColor = pct === 100 ? 'var(--ok)' : pct > 0 ? 'var(--high)' : 'var(--crit)'
            return (
              <tr key={p.cve}>
                <td className="mono" style={{ fontSize: 12 }}>{p.cve}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{p.product}</td>
                <td>
                  <span style={{
                    fontFamily: 'JetBrains Mono,monospace', fontSize: 12,
                    color: p.epss >= 0.7 ? 'var(--crit)' : p.epss >= 0.4 ? 'var(--high)' : 'var(--txt2)',
                    fontWeight: 700
                  }}>{p.epss.toFixed(2)}</span>
                </td>
                <td><span className={`b ${p.sevCls}`}><i />{p.severity}</span></td>
                <td className="mono" style={{ fontSize: 12 }}>{p.affected}</td>
                <td className="mono" style={{ fontSize: 12 }}>{p.patched}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="pb" style={{ width: 70 }}><i style={{ width: `${pct}%`, background: barColor }} /></div>
                    <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{pct}%</span>
                  </div>
                </td>
                <td><StatusBadge status={p.status} cls={p.statusCls} /></td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{p.published}</td>
                <td>
                  <div className="brow">
                    {p.status !== 'PATCHED' && <button className="btn p">Deploy</button>}
                    <button className="btn">Details</button>
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
