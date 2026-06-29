import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { CloudService } from '../../../services/CloudService.js'

const FILTERS = ['All', 'Critical', 'Stale', 'Cross-account']

export default function CloudIdentities() {
  const [identities, setIdentities] = useState([])
  const [filter, setFilter] = useState('All')

  useEffect(() => { CloudService.getCloudIdentities().then(setIdentities) }, [])

  const filtered = identities.filter(i => {
    if (filter === 'Critical')     return i.riskCls === 'cr'
    if (filter === 'Stale')        return i.stale
    if (filter === 'Cross-account')return i.crossAccount
    return true
  })

  const critical     = identities.filter(i => i.riskCls === 'cr').length
  const stale        = identities.filter(i => i.stale).length
  const crossAccount = identities.filter(i => i.crossAccount).length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Cloud Identities (CIEM)
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            <span style={{ color: 'var(--crit)' }}>{critical} critical</span>
            {' · '}<span style={{ color: 'var(--high)' }}>{stale} stale</span>
            {' · '}{crossAccount} cross-account
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
          <tr>{['Identity', 'Type', 'Provider', 'Permissions granted', 'Permissions used', 'Usage', 'Flags', 'Risk', 'Finding', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(i => {
            const barColor = i.usagePct <= 20 ? 'var(--crit)' : i.usagePct <= 50 ? 'var(--high)' : 'var(--ok)'
            return (
              <tr key={i.id}>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{i.id}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--txt3)' }}>{i.email}</div>
                </td>
                <td><span className="ch">{i.type}</span></td>
                <td><span style={{ fontSize: 11, fontWeight: 700, color: i.providerColor }}>{i.provider}</span></td>
                <td className="mono" style={{ fontSize: 12 }}>{i.permissionsGranted === 9999 ? 'ALL (*)' : i.permissionsGranted}</td>
                <td className="mono" style={{ fontSize: 12 }}>{i.permissionsUsed}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="pb" style={{ width: 60 }}><i style={{ width: `${Math.min(i.usagePct, 100)}%`, background: barColor }} /></div>
                    <span className="mono" style={{ fontSize: 11, color: barColor, fontWeight: 700 }}>{i.usagePct}%</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {i.stale        && <span className="b hi" style={{ fontSize: 10 }}><i />STALE</span>}
                    {i.crossAccount && <span className="b in" style={{ fontSize: 10 }}><i />CROSS</span>}
                  </div>
                </td>
                <td><StatusBadge status={i.risk} cls={i.riskCls} /></td>
                <td style={{ fontSize: 11, color: 'var(--txt2)', maxWidth: 240 }}>{i.finding}</td>
                <td>
                  <div className="brow">
                    {i.riskCls === 'cr' && <button className="btn d">Revoke</button>}
                    <button className="btn">Review</button>
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
