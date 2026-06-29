import { useState, useEffect } from 'react'
import MetricCard from '../../../components/MetricCard.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { PrivacyService } from '../../../services/PrivacyService.js'
import { Icons } from '../../../shared/icons.jsx'

const JUR_CLS = { GDPR: 'in', CCPA: 'in', PIPL: 'in', DPDP: 'in' }

export default function PrivacyOverview() {
  const [metrics, setMetrics] = useState(null)
  const [dsars, setDsars] = useState([])
  const [piiDiscovery, setPiiDiscovery] = useState([])
  const [jurisdictionSlas, setJurisdictionSlas] = useState([])
  const [ropa, setRopa] = useState(null)

  useEffect(() => {
    PrivacyService.getMetrics().then(setMetrics)
    PrivacyService.getDsars().then(setDsars)
    PrivacyService.getPiiDiscovery().then(setPiiDiscovery)
    PrivacyService.getJurisdictionSlas().then(setJurisdictionSlas)
    PrivacyService.getRopaCompleteness().then(setRopa)
  }, [])

  if (!metrics || !ropa) return null

  return (
    <>
      <div className="kg k4">
        <MetricCard cls={metrics.dsarsOverdue.cls} num={metrics.dsarsOverdue.num} desc={metrics.dsarsOverdue.desc} label={metrics.dsarsOverdue.label} foot={metrics.dsarsOverdue.foot} icon={Icons.alert} />
        <MetricCard cls={metrics.openDsars.cls} num={metrics.openDsars.num} desc={metrics.openDsars.desc} label={metrics.openDsars.label} foot={metrics.openDsars.foot} icon={Icons.lock} />
        <MetricCard cls={metrics.ropa.cls} num={metrics.ropa.num} desc={metrics.ropa.desc} label={metrics.ropa.label} foot={metrics.ropa.foot} icon={Icons.shield} />
        <MetricCard cls={metrics.legalHolds.cls} num={metrics.legalHolds.num} desc={metrics.legalHolds.desc} label={metrics.legalHolds.label} foot={metrics.legalHolds.foot} icon={Icons.lock} />
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h"><h3>DSAR Queue</h3><button className="btn p">+ New DSAR</button></div>
        <table>
          <thead><tr>{['Request ID', 'Type', 'Subject', 'Jurisdiction', 'Submitted', 'Deadline', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {dsars.slice(0, 5).map(d => (
              <tr key={d.id}>
                <td className="mono pr">{d.id}</td>
                <td><span className="ch">{d.type}</span></td>
                <td>{d.subject}</td>
                <td><span className={`b ${JUR_CLS[d.jurisdiction] ?? 'in'}`}><i />{d.jurisdiction}</span></td>
                <td className="mono">{d.submitted}</td>
                <td className="mono" style={{ color: d.deadlineColor, fontWeight: d.statusCls === 'cr' ? 700 : 400 }}>{d.deadline}</td>
                <td><StatusBadge status={d.status} cls={d.statusCls} /></td>
                <td>
                  <div className="brow">
                    {d.statusCls === 'cr' && <button className="btn p">Execute</button>}
                    <button className="btn">View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="g3">
        <div className="card"><div className="card-h"><h3>PII discovery</h3></div><div className="card-b">
          {piiDiscovery.map(p => (
            <div key={p.name} className="row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{p.desc}</div>
              </div>
              <span className={`b ${p.cls}`}><i />{p.cls === 'cr' ? 'CRITICAL' : p.cls === 'hi' ? 'CONFIRMED' : 'PROBABLE'}</span>
            </div>
          ))}
        </div></div>

        <div className="card"><div className="card-h"><h3>Jurisdiction SLAs</h3></div><div className="card-b">
          {jurisdictionSlas.map(j => (
            <div key={j.jur} className="row">
              <span className="rn">{j.jur}</span>
              <span style={{ flex: 1, fontSize: 11, color: 'var(--txt3)' }}>{j.sla}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: j.cls === 'cr' ? 'var(--crit)' : j.cls === 'hi' ? 'var(--high)' : 'var(--ok)' }}>{j.state}</span>
            </div>
          ))}
        </div></div>

        <div className="card"><div className="card-h"><h3>RoPA completeness</h3></div><div className="card-b">
          <div style={{ textAlign: 'center', padding: '8px 0 14px' }}>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 42, fontWeight: 700, color: 'var(--orange)' }}>{ropa.pct}%</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>{ropa.complete} of {ropa.total} activities complete</div>
          </div>
          <div className="pb" style={{ marginBottom: 14 }}><i style={{ width: `${ropa.pct}%`, background: 'var(--orange)' }} /></div>
          {ropa.gaps.map(g => (
            <div key={g.label} className="row">
              <span style={{ flex: 1, fontSize: 12.5 }}>{g.label}</span>
              <span className={`b ${g.cls}`}><i />{g.count}</span>
            </div>
          ))}
        </div></div>
      </div>
    </>
  )
}
