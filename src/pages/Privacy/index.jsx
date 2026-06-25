import MetricCard from '../../components/MetricCard.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { Icons } from '../../shared/icons.jsx'

const DSARS = [
  { id: 'DSAR-2026-041', type: 'Erasure', subject: 'John Smith', jurisdiction: 'GDPR', submitted: '2026-05-26', deadline: '2026-06-25 ⚠', deadlineColor: 'var(--crit)', status: 'OVERDUE', statusCls: 'cr' },
  { id: 'DSAR-2026-040', type: 'Access', subject: 'Maria Garcia', jurisdiction: 'CCPA', submitted: '2026-05-28', deadline: '2026-07-12', deadlineColor: 'var(--txt2)', status: 'IN PROGRESS', statusCls: 'hi' },
  { id: 'DSAR-2026-039', type: 'Portability', subject: 'Wei Zhang', jurisdiction: 'PIPL', submitted: '2026-05-29', deadline: '2026-06-13', deadlineColor: 'var(--high)', status: 'SUBMITTED', statusCls: 'ne' },
  { id: 'DSAR-2026-038', type: 'Correction', subject: 'Aisha Patel', jurisdiction: 'DPDP', submitted: '2026-05-20', deadline: '2026-06-19', deadlineColor: 'var(--txt2)', status: 'COMPLETED', statusCls: 'ok' },
]

const JUR_CLS = { GDPR: 'in', CCPA: 'in', PIPL: 'in', DPDP: 'in' }

export default function Privacy() {
  return (
    <>
      <div className="kg k4">
        <MetricCard cls="cr" num="1" desc="Erasure OVERDUE 3 days" label="DSARs Overdue" foot="GDPR Art.17 · Action now" icon={Icons.alert} />
        <MetricCard cls="hi" num="3" desc="Open DSARs in progress" label="Open DSARs" foot="30/45d SLA running" icon={Icons.lock} />
        <MetricCard cls="ok" num="96%" desc="RoPA entry completeness" label="RoPA" foot="4% missing lawful basis" icon={Icons.shield} />
        <MetricCard cls="in" num="2" desc="Active legal holds" label="Legal Holds" foot="Blocks DSAR deletion" icon={Icons.lock} />
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h"><h3>DSAR Queue</h3><button className="btn p">+ New DSAR</button></div>
        <table>
          <thead><tr>{['Request ID', 'Type', 'Subject', 'Jurisdiction', 'Submitted', 'Deadline', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {DSARS.map(d => (
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
          {[
            { name: 'Production DB', desc: 'PII · Financial data', cls: 'hi' },
            { name: 'CRM (Salesforce)', desc: 'PII · Contact info', cls: 'hi' },
            { name: 'Log archive S3', desc: 'PII in logs · 68% confidence', cls: 'me' },
            { name: 'Dev S3 bucket', desc: 'Credentials exposed', cls: 'cr' },
          ].map(p => (
            <div key={p.name} className="row">
              <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 500 }}>{p.name}</div><div style={{ fontSize: 11, color: 'var(--txt3)' }}>{p.desc}</div></div>
              <span className={`b ${p.cls}`}><i />{p.cls === 'cr' ? 'CRITICAL' : p.cls === 'hi' ? 'CONFIRMED' : 'PROBABLE'}</span>
            </div>
          ))}
        </div></div>

        <div className="card"><div className="card-h"><h3>Jurisdiction SLAs</h3></div><div className="card-b">
          {[
            { jur: 'GDPR', sla: '30 days', state: '1 overdue', cls: 'cr' },
            { jur: 'CCPA', sla: '45 days', state: 'On track', cls: 'ok' },
            { jur: 'PIPL', sla: '15 days', state: '1 pending', cls: 'hi' },
            { jur: 'DPDP', sla: '~30 days', state: 'On track', cls: 'ok' },
          ].map(j => (
            <div key={j.jur} className="row">
              <span className="rn">{j.jur}</span>
              <span style={{ flex: 1, fontSize: 11, color: 'var(--txt3)' }}>{j.sla}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: j.cls === 'cr' ? 'var(--crit)' : j.cls === 'hi' ? 'var(--high)' : 'var(--ok)' }}>{j.state}</span>
            </div>
          ))}
        </div></div>

        <div className="card"><div className="card-h"><h3>RoPA completeness</h3></div><div className="card-b">
          <div style={{ textAlign: 'center', padding: '8px 0 14px' }}>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 42, fontWeight: 700, color: 'var(--orange)' }}>96%</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>140 of 146 activities complete</div>
          </div>
          <div className="pb" style={{ marginBottom: 14 }}><i style={{ width: '96%', background: 'var(--orange)' }} /></div>
          <div className="row"><span style={{ flex: 1, fontSize: 12.5 }}>Missing lawful basis</span><span className="b cr"><i />4</span></div>
          <div className="row"><span style={{ flex: 1, fontSize: 12.5 }}>Missing retention period</span><span className="b hi"><i />2</span></div>
        </div></div>
      </div>
    </>
  )
}
