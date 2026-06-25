import MetricCard from '../../components/MetricCard.jsx'
import { Icons } from '../../shared/icons.jsx'

const REPORTS = [
  { title: 'SOC 2 Type II Evidence Pack', meta: 'Compliance · PDF · 84 pages', status: 'ok' },
  { title: 'ISO 27001 Posture Gap Analysis', meta: 'Posture · PDF · 41 pages', status: 'ok' },
  { title: 'Monthly Executive Summary – May 2026', meta: 'Executive · PDF · 12 pages', status: 'ok' },
  { title: 'MITRE ATT&CK Coverage Report', meta: 'Threats · PDF · 28 pages', status: 'ok' },
  { title: 'GDPR Article 30 RoPA Export', meta: 'Privacy · PDF · 18 pages', status: 'ok' },
]

const CLIENTS = [
  { name: 'Acme Corp', industry: 'Technology', devices: 847, threats: 3, threatCls: 'cr', posture: 'B+', postureColor: 'var(--high)', status: 'ok' },
  { name: 'GlobalBank Ltd', industry: 'Financial Services', devices: 2341, threats: 1, threatCls: 'hi', posture: 'A−', postureColor: 'var(--ok)', status: 'ok' },
  { name: 'HealthFirst', industry: 'Healthcare', devices: 612, threats: 0, threatCls: 'ne', posture: 'A', postureColor: 'var(--ok)', status: 'ok' },
  { name: 'RetailCo', industry: 'Retail', devices: 1204, threats: 5, threatCls: 'cr', posture: 'C+', postureColor: 'var(--crit)', status: 'cr' },
  { name: 'MegaLogistics', industry: 'Logistics', devices: 489, threats: 2, threatCls: 'hi', posture: 'B', postureColor: 'var(--ok)', status: 'ok' },
]

export default function Reports() {
  return (
    <>
      <div className="kg k3">
        <MetricCard cls="ok" num="8" desc="Reports generated this month" label="Generated" foot="All frameworks" icon={Icons.shield} />
        <MetricCard cls="hi" num="2" desc="SOC 2 evidence gaps" label="SOC 2 Gaps" foot="CC6.1 · CC7.2" icon={Icons.alert} />
        <MetricCard cls="in" num="A−" desc="Overall compliance grade" label="Grade" foot="↑ from B+ last quarter" icon={Icons.check} />
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h"><h3>Client Portfolio</h3><span className="meta">12 clients · 9,314 endpoints</span></div>
        <table>
          <thead><tr>{['Client', 'Industry', 'Devices', 'Open Threats', 'Posture', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {CLIENTS.map(c => (
              <tr key={c.name}>
                <td className="pr">{c.name}</td>
                <td>{c.industry}</td>
                <td className="mono">{c.devices.toLocaleString()}</td>
                <td><span className={`b ${c.threatCls}`}><i />{c.threats}</span></td>
                <td><span className="mono" style={{ fontWeight: 700, color: c.postureColor }}>{c.posture}</span></td>
                <td><span className={`b ${c.status}`}><i />{c.status === 'ok' ? 'ACTIVE' : 'CRITICAL'}</span></td>
                <td><div className="brow">{c.status === 'cr' ? <button className="btn d">Escalate</button> : <button className="btn p">Enter client</button>}<button className="btn">Report</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-h"><h3>Report Library</h3><button className="btn p">+ Generate</button></div>
        <div className="card-b">
          {REPORTS.map(r => (
            <div key={r.title} className="row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.title}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{r.meta}</div>
              </div>
              <span className={`b ${r.status}`}><i />READY</span>
              <button className="btn" style={{ marginLeft: 8 }}>Download</button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
