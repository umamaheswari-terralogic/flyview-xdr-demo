import MetricCard from '../../components/MetricCard.jsx'
import SeverityBadge from '../../components/SeverityBadge.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { Icons } from '../../shared/icons.jsx'

const FINDINGS = [
  { id: 'CF-0412', severity: 'CRITICAL', sevCls: 'cr', resource: 'S3: prod-billing-exports', provider: 'AWS', providerColor: '#FF9900', issue: 'Public read access', sla: '4h', slaColor: 'var(--crit)', status: 'OPEN', statusCls: 'cr' },
  { id: 'CF-0411', severity: 'CRITICAL', sevCls: 'cr', resource: 'Cloud SQL: prod-db', provider: 'GCP', providerColor: '#4285F4', issue: 'Public IP · No SSL', sla: '4h', slaColor: 'var(--crit)', status: 'OPEN', statusCls: 'cr' },
  { id: 'CF-0410', severity: 'HIGH', sevCls: 'hi', resource: 'IAM User: dev-admin', provider: 'GCP', providerColor: '#4285F4', issue: 'Owner role · 12% used', sla: '24h', slaColor: 'var(--high)', status: 'OPEN', statusCls: 'hi' },
  { id: 'CF-0409', severity: 'HIGH', sevCls: 'hi', resource: 'Storage: acme-prod', provider: 'Azure', providerColor: '#0089D6', issue: 'Public blob access', sla: '24h', slaColor: 'var(--high)', status: 'IN REVIEW', statusCls: 'or' },
  { id: 'CF-0408', severity: 'HIGH', sevCls: 'hi', resource: 'EC2 SG: sg-0a1b2c', provider: 'AWS', providerColor: '#FF9900', issue: '0.0.0.0/0 inbound 22', sla: '24h', slaColor: 'var(--high)', status: 'OPEN', statusCls: 'hi' },
  { id: 'CF-0407', severity: 'MEDIUM', sevCls: 'me', resource: 'CloudTrail: us-east-1', provider: 'AWS', providerColor: '#FF9900', issue: 'Logging disabled', sla: '7d', slaColor: 'var(--txt2)', status: 'OPEN', statusCls: 'hi' },
]

function RowBar({ label, pct, color, val }) {
  return (
    <div className="row">
      <span className="rn">{label}</span>
      <div className="pb" style={{ flex: 1 }}><i style={{ width: `${pct}%`, background: color }} /></div>
      <span className="rv" style={{ color }}>{val}</span>
    </div>
  )
}

export default function Cloud() {
  return (
    <>
      <div className="kg k4">
        <MetricCard cls="cr" num="2" desc="P0 findings – 4h SLA" label="P0 Critical" foot="Immediate action" icon={Icons.alert} />
        <MetricCard cls="hi" num="5" desc="P1 findings – 24h SLA" label="P1 High" foot="2 SLAs at risk" icon={Icons.cloud} />
        <MetricCard cls="in" num="3" desc="Cloud accounts linked" label="Accounts" foot="AWS · GCP · Azure" icon={Icons.cloud} />
        <MetricCard cls="ok" num="C+" desc="Overall cloud posture" label="Posture Grade" foot="↑ from D last month" icon={Icons.shield} />
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>CSPM Findings</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="seg"><button className="on">All</button><button>AWS</button><button>GCP</button><button>Azure</button></div>
            <button className="btn p">Scan now</button>
          </div>
        </div>
        <table>
          <thead><tr>{['ID', 'Severity', 'Resource', 'Provider', 'Issue', 'SLA', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {FINDINGS.map(f => (
              <tr key={f.id}>
                <td className="mono">{f.id}</td>
                <td><SeverityBadge severity={f.severity} cls={f.sevCls} /></td>
                <td className="mono pr">{f.resource}</td>
                <td><span style={{ fontSize: 11, fontWeight: 700, color: f.providerColor }}>{f.provider}</span></td>
                <td>{f.issue}</td>
                <td className="mono" style={{ color: f.slaColor }}>{f.sla}</td>
                <td><StatusBadge status={f.status} cls={f.statusCls} /></td>
                <td><div className="brow"><button className="btn p">Remediate</button><button className="btn">View</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="g3">
        <div className="card"><div className="card-h"><h3>Compliance posture</h3></div><div className="card-b">
          <RowBar label="CIS AWS v3.0" pct={68} color="var(--high)" val="68%" />
          <RowBar label="SOC 2" pct={74} color="var(--high)" val="74%" />
          <RowBar label="ISO 27001" pct={81} color="var(--ok)" val="81%" />
          <RowBar label="PCI DSS" pct={59} color="var(--crit)" val="59%" />
        </div></div>

        <div className="card"><div className="card-h"><h3>CIEM top risks</h3></div><div className="card-b">
          {[
            { id: 'dev-admin SA', desc: 'Owner role · only 12% used', cls: 'hi' },
            { id: 'allAuthenticatedUsers', desc: 'GCS cross-tenant binding', cls: 'cr' },
            { id: 'contractor-mjones', desc: '90 days stale · not in HR', cls: 'hi' },
          ].map(r => (
            <div key={r.id} className="row">
              <div style={{ flex: 1 }}><div className="mono" style={{ fontSize: 12 }}>{r.id}</div><div style={{ fontSize: 11, color: 'var(--txt3)' }}>{r.desc}</div></div>
              <span className={`b ${r.cls}`}><i />{r.cls === 'cr' ? 'CRIT' : 'HIGH'}</span>
            </div>
          ))}
        </div></div>

        <div className="card"><div className="card-h"><h3>Linked accounts</h3></div><div className="card-b">
          {[
            { name: 'AWS – us-east-1', findings: '212 findings', cls: 'cr' },
            { name: 'GCP – asia-south1', findings: '88 findings', cls: 'hi' },
            { name: 'Azure – East US', findings: '42 findings', cls: 'hi' },
          ].map(a => (
            <div key={a.name} className="row">
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div><div style={{ fontSize: 11, color: a.cls === 'cr' ? 'var(--crit)' : 'var(--high)' }}>{a.findings}</div></div>
              <button className="btn">Scan</button>
            </div>
          ))}
        </div></div>
      </div>
    </>
  )
}
