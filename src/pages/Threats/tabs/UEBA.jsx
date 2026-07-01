import { useState } from 'react'

const USERS = [
  { user: 'amy.wong',             dept: 'Finance',    risk: 94, riskLvl: 'CRITICAL', sevCls: 'cr', mfa: 'None',      signals: ['Brute-force then success', 'Off-hours login', 'Bulk data download'],         status: 'SUSPENDED' },
  { user: 'john.doe',             dept: 'IT Admin',   risk: 81, riskLvl: 'HIGH',     sevCls: 'hi', mfa: 'TOTP',      signals: ['Privileged access 02:00', 'New admin tool installed', '4 failed MFA'],         status: 'MONITORING'},
  { user: 'vyshnavi.thatikonda',  dept: 'Engineering',risk: 76, riskLvl: 'HIGH',     sevCls: 'hi', mfa: 'Push',      signals: ['Impossible travel (IND→SG)', 'MFA skipped once', 'Antivirus disabled'],       status: 'MONITORING'},
  { user: 'shabbeer',             dept: 'Engineering',risk: 68, riskLvl: 'HIGH',     sevCls: 'hi', mfa: 'TOTP',      signals: ['Bulk cloud download 02:30', 'PIP status', 'Unusual access hours'],             status: 'MONITORING'},
  { user: 'contractor-mjones',    dept: 'External',   risk: 55, riskLvl: 'MEDIUM',   sevCls: 'me', mfa: 'SMS',       signals: ['Unmanaged IAM user', 'Access from personal device', 'No security training'],   status: 'REVIEW'    },
  { user: 'mike.chen',            dept: 'IT Admin',   risk: 42, riskLvl: 'MEDIUM',   sevCls: 'me', mfa: 'WebAuthn',  signals: ['Prod DB access after hours', 'Remote session 5h duration'],                    status: 'NORMAL'    },
  { user: 'sarah.kim',            dept: 'Security',   risk: 18, riskLvl: 'LOW',      sevCls: 'ok', mfa: 'WebAuthn',  signals: [],                                                                             status: 'NORMAL'    },
  { user: 'diana.r',              dept: 'Marketing',  risk: 12, riskLvl: 'LOW',      sevCls: 'ok', mfa: 'Push',      signals: [],                                                                             status: 'NORMAL'    },
]

const BEHAVIOR_EVENTS = [
  { ts: '09:02', user: 'amy.wong',            event: 'Successful login after 47 failed attempts',  sev: 'CRITICAL', sevCls: 'cr' },
  { ts: '08:58', user: 'john.doe',            event: 'Admin tool installed at 08:56 on CORP-IT-01', sev: 'HIGH',    sevCls: 'hi' },
  { ts: '08:45', user: 'contractor-mjones',   event: 'Login from personal device (not enrolled)',   sev: 'MEDIUM',  sevCls: 'me' },
  { ts: '07:30', user: 'mike.chen',           event: 'SSH session to DB-PROD-01 — duration 1h 4m',  sev: 'MEDIUM',  sevCls: 'me' },
  { ts: '02:31', user: 'shabbeer',            event: 'Downloaded 4.2 GB from SharePoint at 02:31', sev: 'HIGH',    sevCls: 'hi' },
  { ts: '00:07', user: 'john.doe',            event: 'Privileged access at 00:07 — outside hours',  sev: 'HIGH',    sevCls: 'hi' },
]

function RiskBar({ score }) {
  const color = score >= 75 ? 'var(--crit)' : score >= 50 ? 'var(--high)' : score >= 30 ? 'var(--med)' : 'var(--ok)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="pb" style={{ width: 80 }}><i style={{ width: `${score}%`, background: color }} /></div>
      <span className="mono" style={{ fontSize: 12, color, fontWeight: 600 }}>{score}</span>
    </div>
  )
}

const STATUS_CLS = { SUSPENDED: 'cr', MONITORING: 'hi', REVIEW: 'me', NORMAL: 'ok' }

export default function UEBATab() {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? USERS : USERS.filter(u => u.risk >= 40)

  return (
    <>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>User & Entity Behavior Analytics (UEBA)
            <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>ITDR · risk-ranked · 930 users monitored</span>
          </h3>
          <div style={{ display: 'flex', gap: 6 }}>
            <div className="seg">
              <button className={!showAll ? 'on' : ''} onClick={() => setShowAll(false)}>High-risk only</button>
              <button className={showAll ? 'on' : ''} onClick={() => setShowAll(true)}>All users</button>
            </div>
          </div>
        </div>
        <table>
          <thead>
            <tr>{['User', 'Department', 'Risk Score', 'Risk Level', 'MFA', 'Active Signals', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {visible.map(u => (
              <tr key={u.user}>
                <td className="pr">{u.user}</td>
                <td style={{ color: 'var(--txt2)', fontSize: 12 }}>{u.dept}</td>
                <td><RiskBar score={u.risk} /></td>
                <td><span className={`b ${u.sevCls}`}><i />{u.riskLvl}</span></td>
                <td className="mono" style={{ fontSize: 12, color: u.mfa === 'None' ? 'var(--crit)' : 'var(--txt2)' }}>{u.mfa}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)', maxWidth: 280 }}>
                  {u.signals.length > 0 ? u.signals.slice(0, 2).join(' · ') + (u.signals.length > 2 ? ` + ${u.signals.length - 2} more` : '') : <span style={{ color: 'var(--txt3)' }}>No signals</span>}
                </td>
                <td><span className={`b ${STATUS_CLS[u.status]}`}><i />{u.status}</span></td>
                <td>
                  <div className="brow">
                    <button className="btn p">Investigate</button>
                    {u.status !== 'NORMAL' && <button className="btn d">Suspend</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-h"><h3>Recent behavioral events</h3><span className="meta">Last 12 hours · anomalous only</span></div>
        <table>
          <thead>
            <tr>{['Time', 'User', 'Behavioral Event', 'Severity', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {BEHAVIOR_EVENTS.map((e, i) => (
              <tr key={i}>
                <td className="mono" style={{ fontSize: 12 }}>{e.ts}</td>
                <td className="pr">{e.user}</td>
                <td style={{ fontSize: 12.5, color: 'var(--txt2)' }}>{e.event}</td>
                <td><span className={`b ${e.sevCls}`}><i />{e.sev}</span></td>
                <td><div className="brow"><button className="btn">Timeline</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
