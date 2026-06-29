import { useState, useEffect } from 'react'
import { CloudService } from '../../../services/CloudService.js'

const PROVIDERS = ['All', 'AWS', 'GCP', 'Azure']
const RISKS     = ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const RESULT_COLOR = { SUCCESS: 'var(--ok)', DENIED: 'var(--crit)' }

export default function AuditLog() {
  const [events, setEvents] = useState([])
  const [provider, setProvider] = useState('All')
  const [risk, setRisk] = useState('All')

  useEffect(() => { CloudService.getAuditLog().then(setEvents) }, [])

  const filtered = events.filter(e => {
    const matchProv = provider === 'All' || e.provider === provider
    const matchRisk = risk === 'All' || e.risk === risk
    return matchProv && matchRisk
  })

  const critical = events.filter(e => e.riskCls === 'cr').length
  const high     = events.filter(e => e.riskCls === 'hi').length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Cloud Audit Log
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            <span style={{ color: 'var(--crit)' }}>{critical} critical</span> · {high} high-risk events
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <div className="seg">
            {PROVIDERS.map(p => <button key={p} className={provider === p ? 'on' : ''} onClick={() => setProvider(p)}>{p}</button>)}
          </div>
          <div className="seg" style={{ marginLeft: 4 }}>
            {RISKS.map(r => <button key={r} className={risk === r ? 'on' : ''} onClick={() => setRisk(r)}>{r}</button>)}
          </div>
        </div>
      </div>
      <table>
        <thead>
          <tr>{['Event ID', 'Time', 'Provider', 'Actor', 'Action', 'Resource', 'Region', 'Result', 'Risk', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(e => (
            <tr key={e.id}>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{e.id}</td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{e.time}</td>
              <td><span style={{ fontSize: 11, fontWeight: 700, color: e.providerColor }}>{e.provider}</span></td>
              <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{e.actor}</td>
              <td className="mono" style={{ fontSize: 11 }}>{e.action}</td>
              <td style={{ fontSize: 12, color: 'var(--txt3)' }}>{e.resource}</td>
              <td style={{ fontSize: 11, color: 'var(--txt3)' }}>{e.region}</td>
              <td>
                <span style={{ fontSize: 11, fontWeight: 700, color: RESULT_COLOR[e.result] ?? 'var(--txt2)' }}>
                  {e.result}
                </span>
              </td>
              <td><span className={`b ${e.riskCls}`}><i />{e.risk}</span></td>
              <td><div className="brow"><button className="btn">Trace</button></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
