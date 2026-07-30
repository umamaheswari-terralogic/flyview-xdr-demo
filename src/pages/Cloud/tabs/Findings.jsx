import { useState, useEffect } from 'react'
import SeverityBadge from '../../../components/SeverityBadge.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import FindingDrawer from '../../../components/FindingDrawer.jsx'
import { CloudService } from '../../../services/CloudService.js'
import { consumePendingProviderFilter } from '../../../services/cloudFilterBridge.js'

const PROVIDERS  = ['All', 'GCP', 'AWS']
const SEVERITIES = ['All', 'CRITICAL', 'HIGH', 'MEDIUM']

export default function Findings() {
  const [findings, setFindings] = useState([])
  const [provider, setProvider] = useState(() => consumePendingProviderFilter() ?? 'All')
  const [severity, setSeverity] = useState('All')
  const [selected, setSelected] = useState(null)

  useEffect(() => { CloudService.getFindings().then(setFindings) }, [])

  const filtered = findings.filter(f => {
    const matchProv = provider === 'All' || f.cloudProvider === provider
    const matchSev  = severity === 'All' || f.severity === severity
    return matchProv && matchSev
  })

  const crit = findings.filter(f => f.sevCls === 'cr').length
  const high = findings.filter(f => f.sevCls === 'hi').length

  return (
    <>
      <div className="card">
        <div className="card-h">
          <h3>CSPM Findings
            <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
              <span style={{ color: 'var(--crit)' }}>{crit} critical</span> · {high} high · {findings.length} total
            </span>
          </h3>
          <div style={{ display: 'flex', gap: 6 }}>
            <div className="seg">
              {PROVIDERS.map(p => <button key={p} className={provider === p ? 'on' : ''} onClick={() => setProvider(p)}>{p}</button>)}
            </div>
            <div className="seg" style={{ marginLeft: 4 }}>
              {SEVERITIES.map(s => <button key={s} className={severity === s ? 'on' : ''} onClick={() => setSeverity(s)}>{s}</button>)}
            </div>
          </div>
        </div>
        <table>
          <thead>
            <tr>{['ID', 'Severity', 'Resource', 'Provider', 'Issue', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(f => {
              const isActive = f.issue === 'Public read access'
              return (
                <tr key={f.id} style={!isActive ? { opacity: 0.45 } : undefined}>
                  <td className="mono">{f.id}</td>
                  <td><SeverityBadge severity={f.severity} cls={f.sevCls} /></td>
                  <td className="mono pr">{f.resource}</td>
                  <td><span style={{ fontSize: 11, fontWeight: 700, color: f.providerColor }}>{f.provider}</span></td>
                  <td>{f.issue}</td>
                  <td><StatusBadge status={f.status} cls={f.statusCls} /></td>
                  <td>
                    <div className="brow">
                      <button className="btn" onClick={() => setSelected(f)}>View</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selected && <FindingDrawer finding={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
