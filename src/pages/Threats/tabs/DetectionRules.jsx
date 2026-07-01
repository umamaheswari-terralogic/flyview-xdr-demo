import { useState } from 'react'

const RULES = [
  { id: 'RW-001', name: 'Ransomware file-encryption burst',    type: 'EDR Behavioral',    status: 'ENABLED', sev: 'CRITICAL', sevCls: 'cr', triggered: '3 / 30d',  lastHit: '09:13 today'   },
  { id: 'RW-002', name: 'Impossible travel sign-in',           type: 'IAM UEBA',          status: 'ENABLED', sev: 'HIGH',     sevCls: 'hi', triggered: '7 / 30d',  lastHit: '2 days ago'    },
  { id: 'RW-003', name: 'Brute-force then success',            type: 'Auth Correlation',  status: 'ENABLED', sev: 'HIGH',     sevCls: 'hi', triggered: '2 / 30d',  lastHit: '09:02 today'   },
  { id: 'RW-004', name: 'Encoded PowerShell execution',        type: 'EDR Behavioral',    status: 'ENABLED', sev: 'MEDIUM',   sevCls: 'me', triggered: '14 / 30d', lastHit: '08:58 today'   },
  { id: 'RW-005', name: 'DNS tunneling pattern',               type: 'Network Anomaly',   status: 'ENABLED', sev: 'MEDIUM',   sevCls: 'me', triggered: '5 / 30d',  lastHit: '08:54 today'   },
  { id: 'RW-006', name: 'Large outbound transfer (exfil)',     type: 'NetFlow Anomaly',   status: 'ENABLED', sev: 'CRITICAL', sevCls: 'cr', triggered: '1 / 30d',  lastHit: '09:10 today'   },
  { id: 'RW-007', name: 'Off-hours service-account login',     type: 'IAM Rule',          status: 'TUNING',  sev: 'LOW',      sevCls: 'ok', triggered: '31 / 30d', lastHit: '2h ago'        },
  { id: 'RW-008', name: 'Public cloud bucket exposure',        type: 'CSPM Rule',         status: 'ENABLED', sev: 'HIGH',     sevCls: 'hi', triggered: '2 / 30d',  lastHit: 'Yesterday'     },
  { id: 'RW-009', name: 'Privileged credential reuse',         type: 'IAM Correlation',   status: 'ENABLED', sev: 'HIGH',     sevCls: 'hi', triggered: '0 / 30d',  lastHit: 'Never'         },
  { id: 'RW-010', name: 'Shadow AI data submission',           type: 'Browser DLP',       status: 'ENABLED', sev: 'HIGH',     sevCls: 'hi', triggered: '3 / 30d',  lastHit: '08:47 today'   },
  { id: 'RW-011', name: 'Insider bulk-download behaviour',     type: 'UEBA',              status: 'ENABLED', sev: 'HIGH',     sevCls: 'hi', triggered: '1 / 30d',  lastHit: '4 days ago'    },
  { id: 'RW-012', name: 'Kerberoasting detection',             type: 'EDR Behavioral',    status: 'DISABLED',sev: 'CRITICAL', sevCls: 'cr', triggered: '0 / 30d',  lastHit: 'Never'         },
]

const TYPE_FILTERS = ['All', 'EDR Behavioral', 'IAM UEBA', 'Auth Correlation', 'Network Anomaly', 'CSPM Rule', 'Browser DLP', 'UEBA']
const STATUS_CLS   = { ENABLED: 'ok', TUNING: 'me', DISABLED: 'neutral' }

export default function DetectionRulesTab() {
  const [typeFilter, setTypeFilter]   = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = RULES.filter(r => {
    const matchType   = typeFilter === 'All' || r.type === typeFilter
    const matchStatus = statusFilter === 'All' || r.status === statusFilter
    return matchType && matchStatus
  })

  const enabled = RULES.filter(r => r.status === 'ENABLED').length
  const tuning  = RULES.filter(r => r.status === 'TUNING').length

  return (
    <>
      <div className="kg k3" style={{ marginBottom: 18 }}>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ok)' }}>{enabled}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Active rules</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--med)' }}>{tuning}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Rules in tuning</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--txt)' }}>{RULES.length}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Total detection rules</div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Detection Rules
            <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>Behavioral · UEBA · correlation · network anomaly</span>
          </h3>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <div className="seg">
              {['All', 'ENABLED', 'TUNING', 'DISABLED'].map(s => (
                <button key={s} className={statusFilter === s ? 'on' : ''} onClick={() => setStatusFilter(s)}>{s}</button>
              ))}
            </div>
            <button className="btn p">+ New rule</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>{['ID', 'Rule Name', 'Type', 'Status', 'Severity', 'Triggered', 'Last Hit', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{r.id}</td>
                <td className="pr">{r.name}</td>
                <td><span className="ch">{r.type}</span></td>
                <td><span className={`b ${STATUS_CLS[r.status]}`}><i />{r.status}</span></td>
                <td><span className={`b ${r.sevCls}`}><i />{r.sev}</span></td>
                <td className="mono" style={{ fontSize: 12 }}>{r.triggered}</td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{r.lastHit}</td>
                <td>
                  <div className="brow">
                    <button className="btn">Edit</button>
                    <button className="btn">{r.status === 'ENABLED' ? 'Disable' : 'Enable'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
