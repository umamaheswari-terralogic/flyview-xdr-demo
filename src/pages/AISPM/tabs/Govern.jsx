import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { AISPMService } from '../../../services/AISPMService.js'

const TIER_COLOR = { 'HIGH RISK': 'var(--crit)', 'LIMITED RISK': 'var(--high)', 'MINIMAL RISK': 'var(--ok)', 'UNCLASSIFIED': 'var(--crit)' }

function RowBar({ label, pct, color, val }) {
  return (
    <div className="row">
      <span className="rn">{label}</span>
      <div className="pb" style={{ flex: 1 }}><i style={{ width: `${pct}%`, background: color }} /></div>
      <span className="rv" style={{ color }}>{val}</span>
    </div>
  )
}

export default function Govern() {
  const [registry, setRegistry] = useState([])
  const [policies, setPolicies] = useState([])
  const [nist, setNist] = useState([])

  useEffect(() => {
    AISPMService.getEuAiActRegistry().then(setRegistry)
    AISPMService.getGovernancePolicies().then(setPolicies)
    AISPMService.getNistRmf().then(setNist)
  }, [])

  const missing   = registry.filter(r => r.status === 'MISSING' || r.status === 'OVERDUE').length
  const draftPols = policies.filter(p => p.status !== 'ACTIVE').length

  return (
    <>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>EU AI Act Registry
            <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
              {missing > 0 && <span style={{ color: 'var(--crit)' }}>{missing} missing/overdue · </span>}
              {registry.length} assets classified
            </span>
          </h3>
          <button className="btn p">+ Register asset</button>
        </div>
        <table>
          <thead>
            <tr>{['AI system', 'EU AI Act tier', 'Description', 'Article', 'Assessment due', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {registry.map(r => (
              <tr key={r.name}>
                <td className="pr">{r.name}</td>
                <td>
                  <span style={{ fontSize: 11, fontWeight: 700, color: TIER_COLOR[r.euTier] ?? 'var(--txt2)', background: 'var(--bg3)', padding: '2px 7px', borderRadius: 4 }}>
                    {r.euTier}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{r.desc}</td>
                <td><span className="ch">{r.article}</span></td>
                <td className="mono" style={{ fontSize: 12, color: r.status === 'OVERDUE' || r.status === 'MISSING' ? 'var(--crit)' : 'var(--txt3)' }}>{r.due}</td>
                <td><StatusBadge status={r.status} cls={r.cls} /></td>
                <td><div className="brow"><button className="btn">View</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="g3">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-h">
            <h3>Governance policies
              <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>{draftPols} need attention</span>
            </h3>
            <button className="btn p">+ New policy</button>
          </div>
          <table>
            <thead>
              <tr>{['Policy', 'Scope', 'Version', 'Coverage', 'Last updated', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {policies.map(p => (
                <tr key={p.id}>
                  <td className="pr">{p.name}</td>
                  <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{p.scope}</td>
                  <td><span className="ch">{p.version}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="pb" style={{ width: 60 }}><i style={{ width: `${p.coverage}%`, background: p.coverage === 100 ? 'var(--ok)' : p.coverage >= 70 ? 'var(--high)' : 'var(--crit)' }} /></div>
                      <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{p.coverage}%</span>
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{p.lastUpdated}</td>
                  <td><StatusBadge status={p.status} cls={p.statusCls} /></td>
                  <td><div className="brow"><button className="btn">Edit</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-h"><h3>NIST AI RMF posture</h3></div>
          <div className="card-b">
            {nist.map(n => <RowBar key={n.label} {...n} />)}
            <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)', marginTop: 8, fontSize: 12, color: 'var(--txt3)' }}>
              Average posture: <span style={{ fontWeight: 700, color: 'var(--high)' }}>64%</span> — target 80% by Q4
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
