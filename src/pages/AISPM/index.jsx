import MetricCard from '../../components/MetricCard.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { Icons } from '../../shared/icons.jsx'

const ASSETS = [
  { name: 'ChatGPT Plus', vendor: 'OpenAI', type: 'Hosted SaaS', users: 47, risk: 74, riskCls: 'hi', dataScope: 'INTERNAL', scopeCls: 'hi', sanction: 'SHADOW', sanctionCls: 'cr' },
  { name: 'Cursor AI', vendor: 'Cursor', type: 'IDE AI', users: 8, risk: 81, riskCls: 'cr', dataScope: 'CREDENTIALS', scopeCls: 'cr', sanction: 'SHADOW', sanctionCls: 'cr' },
  { name: 'procurement-assist', vendor: 'Internal', type: 'Agentic AI', users: 5, risk: 89, riskCls: 'cr', dataScope: 'CONFIDENTIAL', scopeCls: 'hi', sanction: 'REVIEW', sanctionCls: 'or' },
  { name: 'GitHub Copilot', vendor: 'GitHub/MS', type: 'IDE AI', users: 23, risk: 58, riskCls: 'me', dataScope: 'CONFIDENTIAL', scopeCls: 'hi', sanction: 'SANCTIONED', sanctionCls: 'ok' },
  { name: 'Notion AI', vendor: 'Notion', type: 'SaaS Feature', users: 31, risk: 42, riskCls: 'me', dataScope: 'INTERNAL', scopeCls: 'ne', sanction: 'SANCTIONED', sanctionCls: 'ok' },
  { name: 'Azure OpenAI CRM', vendor: 'Microsoft', type: 'API Integration', users: 2, risk: 36, riskCls: 'ok', dataScope: 'PII', scopeCls: 'cr', sanction: 'SANCTIONED', sanctionCls: 'ok' },
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

export default function AISPM() {
  return (
    <>
      <div className="kg k4">
        <MetricCard cls="cr" num="3" desc="Shadow AI tools found" label="Shadow AI" foot="<b>▲ +3</b> this week" icon={Icons.cpu} />
        <MetricCard cls="hi" num="1" desc="Critical risk AI system" label="Critical Risk" foot="procurement-assist" icon={Icons.alert} />
        <MetricCard cls="ok" num="6" desc="Approved AI assets" label="Sanctioned" foot="Active and governed" icon={Icons.check} />
        <MetricCard cls="hi" num="2" desc="EU AI Act gaps open" label="Compliance Gap" foot="Overdue assessments" icon={Icons.shield} />
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>AI Asset Inventory</h3>
          <div className="seg"><button className="on">All</button><button>Shadow</button><button>Sanctioned</button><button>Review</button></div>
        </div>
        <table>
          <thead><tr>{['Asset', 'Vendor', 'Type', 'Users', 'Risk Score', 'Data Scope', 'Sanction', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {ASSETS.map(a => (
              <tr key={a.name}>
                <td className="pr">{a.name}</td>
                <td>{a.vendor}</td>
                <td><span className="ch">{a.type}</span></td>
                <td className="mono">{a.users}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="pb" style={{ width: 60 }}><i style={{ width: `${a.risk}%`, background: a.riskCls === 'cr' ? 'var(--crit)' : a.riskCls === 'hi' ? 'var(--high)' : a.riskCls === 'me' ? 'var(--med)' : 'var(--ok)' }} /></div>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: a.riskCls === 'cr' ? 'var(--crit)' : a.riskCls === 'hi' ? 'var(--high)' : 'var(--txt2)' }}>{a.risk}</span>
                  </div>
                </td>
                <td><span className={`b ${a.scopeCls}`}><i />{a.dataScope}</span></td>
                <td><StatusBadge status={a.sanction} cls={a.sanctionCls} /></td>
                <td>
                  <div className="brow">
                    {a.sanctionCls === 'cr' && <button className="btn d">Block</button>}
                    <button className="btn">Review</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="g3">
        <div className="card"><div className="card-h"><h3>Detection events (24h)</h3></div><div className="card-b">
          {[
            { event: 'DLP – source code pasted', source: 'Cursor AI · 09:11', cls: 'cr' },
            { event: '.env file sent to model', source: 'Cursor AI · 08:47', cls: 'cr' },
            { event: 'Prompt injection attempt', source: 'procurement-assist · 08:22', cls: 'hi' },
            { event: 'Anomalous egress 3x baseline', source: 'GPT-4o API · 07:30', cls: 'me' },
          ].map(e => (
            <div key={e.event} className="row">
              <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 500 }}>{e.event}</div><div style={{ fontSize: 11, color: 'var(--txt3)' }}>{e.source}</div></div>
              <span className={`b ${e.cls}`}><i />{e.cls === 'cr' ? 'CRITICAL' : e.cls === 'hi' ? 'HIGH' : 'MEDIUM'}</span>
            </div>
          ))}
        </div></div>

        <div className="card"><div className="card-h"><h3>EU AI Act registry</h3></div><div className="card-b">
          {[
            { name: 'procurement-assist', desc: 'High risk · conformity assessment', cls: 'cr', status: 'OVERDUE' },
            { name: 'GPT-4o API (CRM)', desc: 'High risk · human oversight', cls: 'hi', status: 'IN REVIEW' },
            { name: 'churn-predictor-v3', desc: 'Limited risk · transparency', cls: 'ok', status: 'REGISTERED' },
            { name: 'Azure Doc Intelligence', desc: 'Minimal risk', cls: 'ok', status: 'REGISTERED' },
          ].map(r => (
            <div key={r.name} className="row">
              <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 500 }}>{r.name}</div><div style={{ fontSize: 11, color: 'var(--txt3)' }}>{r.desc}</div></div>
              <span className={`b ${r.cls}`}><i />{r.status}</span>
            </div>
          ))}
        </div></div>

        <div className="card"><div className="card-h"><h3>NIST AI RMF posture</h3></div><div className="card-b">
          <RowBar label="GOVERN" pct={62} color="var(--high)" val="62%" />
          <RowBar label="MAP" pct={71} color="var(--high)" val="71%" />
          <RowBar label="MEASURE" pct={55} color="var(--crit)" val="55%" />
          <RowBar label="MANAGE" pct={68} color="var(--high)" val="68%" />
        </div></div>
      </div>
    </>
  )
}
