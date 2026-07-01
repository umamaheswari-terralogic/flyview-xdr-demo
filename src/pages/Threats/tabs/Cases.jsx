import { useState } from 'react'

const CASES = [
  { id: 'CASE-2026-0041', title: 'Ransomware activity — WIN-FIN-04',             severity: 'CRITICAL', sevCls: 'cr', status: 'IN_PROGRESS', statusCls: 'hi', assignee: 'sarah.kim',  created: '09:01 today',   alerts: 3, tags: ['EDR', 'Ransomware']    },
  { id: 'CASE-2026-0040', title: 'Credential exfiltration — amy.wong',           severity: 'CRITICAL', sevCls: 'cr', status: 'IN_PROGRESS', statusCls: 'hi', assignee: 'r.lee',     created: '08:45 today',   alerts: 2, tags: ['IAM', 'BruteForce']   },
  { id: 'CASE-2026-0039', title: 'Large outbound transfer — 185.220.101.47',     severity: 'HIGH',     sevCls: 'hi', status: 'OPEN',        statusCls: 'cr', assignee: 'Unassigned', created: '08:30 today',  alerts: 1, tags: ['Network', 'Exfil']    },
  { id: 'CASE-2026-0038', title: 'Shadow AI data exposure — Cursor AI',          severity: 'HIGH',     sevCls: 'hi', status: 'ACKNOWLEDGED',statusCls: 'me', assignee: 'mike.chen', created: 'Yesterday',     alerts: 2, tags: ['AI-SPM', 'DLP']       },
  { id: 'CASE-2026-0037', title: 'Impossible travel — vyshnavi.t',               severity: 'HIGH',     sevCls: 'hi', status: 'RESOLVED',    statusCls: 'ok', assignee: 'sarah.kim',  created: '2 days ago',   alerts: 1, tags: ['IAM', 'UEBA']         },
  { id: 'CASE-2026-0036', title: 'Unauthorised ACL change — CAT2960-ACCESS-07',  severity: 'MEDIUM',   sevCls: 'me', status: 'RESOLVED',    statusCls: 'ok', assignee: 'r.lee',     created: '3 days ago',    alerts: 1, tags: ['Network', 'Config']   },
  { id: 'CASE-2026-0035', title: 'PIP user downloading bulk files — santosh',   severity: 'HIGH',     sevCls: 'hi', status: 'RESOLVED',    statusCls: 'ok', assignee: 'sarah.kim',  created: '4 days ago',   alerts: 2, tags: ['Cloud', 'Insider']    },
]

const STATUSES = ['All', 'OPEN', 'IN_PROGRESS', 'ACKNOWLEDGED', 'RESOLVED']

export default function CasesTab() {
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = CASES.filter(c => statusFilter === 'All' || c.status === statusFilter)
  const openCount = CASES.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Cases
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            <span style={{ color: 'var(--crit)' }}>{openCount} active</span> · {CASES.length} total
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <div className="seg">
            {STATUSES.map(s => <button key={s} className={statusFilter === s ? 'on' : ''} onClick={() => setStatusFilter(s)}>{s.replace('_', ' ')}</button>)}
          </div>
          <button className="btn p">+ New case</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>{['Case ID', 'Title', 'Severity', 'Status', 'Assignee', 'Alerts', 'Tags', 'Created', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(c => (
            <tr key={c.id}>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{c.id}</td>
              <td className="pr">{c.title}</td>
              <td><span className={`b ${c.sevCls}`}><i />{c.severity}</span></td>
              <td><span className={`b ${c.statusCls}`}><i />{c.status.replace('_', ' ')}</span></td>
              <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{c.assignee}</td>
              <td className="mono" style={{ textAlign: 'center' }}>{c.alerts}</td>
              <td>{c.tags.map(t => <span key={t} className="ch" style={{ marginRight: 4, fontSize: 11 }}>{t}</span>)}</td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{c.created}</td>
              <td>
                <div className="brow">
                  <button className="btn p">Open</button>
                  {c.assignee === 'Unassigned' && <button className="btn">Assign</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
