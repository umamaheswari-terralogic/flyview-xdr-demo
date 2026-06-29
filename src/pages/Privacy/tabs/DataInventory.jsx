import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { PrivacyService } from '../../../services/PrivacyService.js'

export default function DataInventory() {
  const [assets, setAssets] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => { PrivacyService.getDataInventory().then(setAssets) }, [])

  const filtered = assets.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase())
  )

  const critical = assets.filter(a => a.riskCls === 'cr').length
  const unencrypted = assets.filter(a => !a.encrypted).length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Data Inventory
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            {assets.length} assets ·
            <span style={{ color: 'var(--crit)', marginLeft: 4 }}>{critical} critical risk</span>
            {unencrypted > 0 && <span style={{ color: 'var(--high)', marginLeft: 4 }}>· {unencrypted} unencrypted</span>}
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="srch" placeholder="Search assets…" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn p">Run scan</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>{['Asset name', 'Type', 'Host / endpoint', 'PII categories', 'Records', 'Confidence', 'Encrypted', 'Risk', 'Last scan', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(a => (
            <tr key={a.name}>
              <td className="pr">{a.name}</td>
              <td><span className="ch">{a.type}</span></td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.host}</td>
              <td>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {a.piiTypes.map(p => <span key={p} className="ch">{p}</span>)}
                </div>
              </td>
              <td className="mono" style={{ fontWeight: 600 }}>{a.records}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="pb" style={{ width: 50 }}>
                    <i style={{ width: `${a.confidence}%`, background: a.confidence >= 90 ? 'var(--crit)' : 'var(--high)' }} />
                  </div>
                  <span className="mono" style={{ fontSize: 11 }}>{a.confidence}%</span>
                </div>
              </td>
              <td>
                {a.encrypted
                  ? <span className="b ok"><i />YES</span>
                  : <span className="b cr"><i />NO</span>
                }
              </td>
              <td><StatusBadge status={a.risk} cls={a.riskCls} /></td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.lastScan}</td>
              <td>
                <div className="brow">
                  {a.riskCls === 'cr' && <button className="btn d">Remediate</button>}
                  <button className="btn">View</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
