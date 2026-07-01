import { useState, useEffect, useRef } from 'react'
import MetricCard from '../../../components/MetricCard.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import WidgetCard from '../../../components/WidgetCard.jsx'
import AlertDrawer from '../../../components/AlertDrawer.jsx'
import { IdentityService } from '../../../services/IdentityService.js'
import { Icons } from '../../../shared/icons.jsx'
import { API_BASE } from '../../../config.js'

const API     = `${API_BASE}/api/identity`
const POLL_MS = 4000

function RowBar({ label, pct, color, val }) {
  return (
    <div className="row">
      <span className="rn">{label}</span>
      <div className="pb" style={{ flex: 1 }}>
        <i style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="rv" style={{ color }}>{val}</span>
    </div>
  )
}

function RiskBar({ risk, riskCls }) {
  const color = riskCls === 'cr' ? 'var(--crit)' : riskCls === 'hi' ? 'var(--high)' : riskCls === 'me' ? 'var(--med)' : 'var(--ok)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className="pb" style={{ width: 60 }}>
        <i style={{ width: `${risk}%`, background: color }} />
      </div>
      <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: riskCls === 'cr' || riskCls === 'hi' ? color : 'var(--txt2)' }}>{risk}</span>
    </div>
  )
}

function SegControl({ options, active, onSelect }) {
  return (
    <div className="seg">
      {options.map(o => (
        <button key={o} className={active === o ? 'on' : ''} onClick={() => onSelect(o)}>{o}</button>
      ))}
    </div>
  )
}

// Build the drawer payload for a given user's alert
function buildDrawer(u) {
  if (!u?.alert) return null

  if (u.alert.type === 'IMPOSSIBLE_TRAVEL') {
    return {
      title: 'Impossible Travel Detected',
      subtitle: `${u.email} · ${u.dept}`,
      severity: 'CRITICAL', sevCls: 'cr',
      status: 'UNDER REVIEW', statusCls: 'cr',
      sections: [
        {
          label: 'What happened',
          desc: `${u.name} authenticated from Nellore (IN) at 09:41, then from Texas (US) at 09:59 — only 18 minutes apart. The physical distance between these locations makes simultaneous or sequential access impossible, indicating either credential theft or account sharing. The MFA challenge was not completed during the second login.`,
        },
        {
          label: 'Event details',
          items: [
            { key: 'User', value: u.email },
            { key: 'Department', value: u.dept },
            { key: 'First login', value: 'Nellore, IN — 09:41' },
            { key: 'Second login', value: 'Texas, US — 09:59', color: 'var(--crit)' },
            { key: 'Time between logins', value: '18 minutes', color: 'var(--crit)' },
            { key: 'MFA', value: 'BYPASSED — challenge skipped on second login', color: 'var(--crit)', wide: true },
          ],
        },
      ],
      tags: ['T1078 – Valid Accounts', 'T1556 – Modify Authentication Process'],
      analystNote: 'Suspend session immediately. Verify with the employee if travel was legitimate. If not, assume credential compromise and rotate all credentials.',
      actions: [{ label: 'Suspend account', danger: true }],
    }
  }

  if (u.alert.type === 'DATA_EXFILTRATION') {
    return {
      title: 'Bulk Cloud Data Download — Possible Exfiltration',
      subtitle: `${u.email} · ${u.dept} · PIP employee`,
      severity: 'HIGH', sevCls: 'hi',
      status: 'MONITORING', statusCls: 'hi',
      sections: [
        {
          label: 'What happened',
          desc: `${u.name} logged into AWS at 02:47 AM and made 4,200 S3 GetObject API calls on the corp-data-prod bucket within 12 minutes, downloading 4.2 GB of data. This user is currently on a Performance Improvement Plan (PIP). The access time is outside all normal business hours and the download volume significantly exceeds their historical baseline. A correlated finding has been raised in the Cloud module.`,
        },
        {
          label: 'Activity details',
          items: [
            { key: 'User', value: u.email },
            { key: 'Login time', value: '02:47 AM', color: 'var(--high)' },
            { key: 'S3 bucket', value: 'corp-data-prod', mono: true },
            { key: 'API calls', value: '4,200 GetObject requests', color: 'var(--high)' },
            { key: 'Data volume', value: '4.2 GB transferred', color: 'var(--high)' },
            { key: 'Duration', value: '12 minutes' },
            { key: 'HR status', value: 'Performance Improvement Plan (PIP)', color: 'var(--high)', wide: true },
          ],
        },
      ],
      tags: ['T1530 – Data from Cloud Storage', 'T1078 – Valid Accounts'],
      analystNote: 'Revoke IAM credentials immediately via the Cloud module "Revoke IAM" action. Preserve S3 access logs before rotation. Loop in HR given PIP status.',
      actions: [{ label: 'Revoke all access', danger: true }],
    }
  }

  if (u.alert.type === 'DEVICE_RISK') {
    return {
      title: 'Adaptive Authentication Triggered',
      subtitle: `${u.email} · ${u.dept}`,
      severity: 'CRITICAL', sevCls: 'cr',
      status: 'ADAPTIVE AUTH', statusCls: 'cr',
      sections: [
        {
          label: 'What happened',
          desc: `MDM reported that antivirus protection has been disabled on ${u.name} (LT-VyshnaviT-3941). FlyView IAM has automatically elevated the risk score for ${u.email} and enforced step-up MFA for all active and new sessions from this device.`,
        },
        {
          label: 'Device details',
          items: [
            { key: 'Device',    value: 'LT-VyshnaviT-3941' },
            { key: 'Platform',  value: 'Windows 11' },
            { key: 'Signal',    value: 'MDM → IAM (cross-module)', color: 'var(--crit)' },
            { key: 'Antivirus', value: 'DISABLED', color: 'var(--crit)' },
            { key: 'MFA',       value: 'Step-up enforcement active', color: 'var(--high)', wide: true },
          ],
        },
      ],
      tags: ['T1562.001 — Impair Defenses: Disable Security Tools'],
      analystNote: 'Re-enable antivirus via MDM profile push or Monitor remediation script. Until resolved, all sessions from this device require step-up MFA.',
      actions: [{ label: 'Force re-auth', danger: true }],
    }
  }

  return null
}

export default function IdentityOverview() {
  const [summary, setSummary]   = useState(null)
  const [users, setUsers]       = useState([])
  const [riskDist, setRiskDist] = useState([])
  const [pam, setPam]           = useState([])
  const [sso, setSso]           = useState([])
  const [filter, setFilter]     = useState('All')
  const [loading, setLoading]   = useState(true)
  const [drawerUser, setDrawerUser] = useState(null)
  const [antivirusSignal, setAntivirusSignal] = useState(null)
  const pollRef = useRef(null)

  async function fetchUsers() {
    try {
      const r = await fetch(API)
      if (!r.ok) throw new Error()
      const data = await r.json()
      setUsers(data.users)
    } catch {
      const u = await IdentityService.getUsers()
      setUsers(u)
    }
  }

  useEffect(() => {
    Promise.all([
      IdentityService.getSummary(),
      IdentityService.getRiskDistribution(),
      IdentityService.getPamSessions(),
      IdentityService.getSsoFederation(),
      fetchUsers(),
    ]).then(([s, rd, p, f]) => {
      setSummary(s); setRiskDist(rd); setPam(p); setSso(f)
    }).finally(() => setLoading(false))

    pollRef.current = setInterval(fetchUsers, POLL_MS)

    // Poll antivirus device risk signal from MDM
    const pollSim = () =>
      fetch(`${API}/sim`)
        .then(r => r.json())
        .then(({ riskSignal }) => setAntivirusSignal(riskSignal ?? null))
        .catch(() => {})
    pollSim()
    const simId = setInterval(pollSim, 3000)

    return () => { clearInterval(pollRef.current); clearInterval(simId) }
  }, [])

  if (loading) return <div className="loading-state">Loading identity data…</div>

  const vyshnavi       = users.find(u => u.simId === 'vyshnavi')
  const john           = users.find(u => u.simId === 'john')
  const vyshnaviDevice = users.find(u => u.simId === 'vyshnavi-device')
  const isEscalated    = vyshnavi?.riskCls === 'cr' && vyshnavi?.alert
  const johnAlert      = john?.alert
  const deviceRiskAlert = vyshnaviDevice?.alert?.type === 'DEVICE_RISK' ? vyshnaviDevice : null

  const highRiskCount = users.filter(u => u.riskCls === 'cr' || u.riskCls === 'hi').length
  const offboardCount = users.filter(u => u.status === 'OFFBOARDING').length

  const filtered = filter === 'All' ? users
    : filter === 'High Risk' ? users.filter(u => u.riskCls === 'cr' || u.riskCls === 'hi')
    : users.filter(u => u.status === 'OFFBOARDING')

  const drawerAlert = drawerUser ? buildDrawer(drawerUser) : null

  return (
    <>
      {/* ── MDM Device Risk → Adaptive Auth banner ───────────────── */}
      {deviceRiskAlert && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.25)',
          borderLeft: '4px solid var(--crit)', borderRadius: 8, padding: '10px 16px', marginBottom: 12,
        }}>
          <span style={{ fontSize: 16 }}>🛡️</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--crit)', flex: 1 }}>
            Adaptive Auth Triggered — <b>{deviceRiskAlert.name}</b> ({deviceRiskAlert.email}): Antivirus disabled on LT-VyshnaviT-3941. Step-up MFA enforced for all sessions from this device.
          </span>
          <span className="b cr"><i />CRITICAL</span>
          <button className="btn" style={{ marginLeft: 4 }} onClick={() => setDrawerUser(deviceRiskAlert)}>View</button>
        </div>
      )}

      {/* Single-line banners — detail is in the View drawer */}
      {isEscalated && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.25)',
          borderLeft: '4px solid var(--crit)', borderRadius: 8, padding: '10px 16px', marginBottom: 12,
        }}>
          <span style={{ fontSize: 16 }}>🚨</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--crit)', flex: 1 }}>
            Impossible Travel — <b>{vyshnavi.name}</b> ({vyshnavi.email}) logged in from two impossible locations within 18 min. MFA bypassed.
          </span>
          <span className="b cr"><i />CRITICAL</span>
          <button className="btn" style={{ marginLeft: 4 }} onClick={() => setDrawerUser(vyshnavi)}>View</button>
        </div>
      )}

      {johnAlert && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(249,115,22,.07)', border: '1px solid rgba(249,115,22,.25)',
          borderLeft: '4px solid var(--high)', borderRadius: 8, padding: '10px 16px', marginBottom: 12,
        }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--high)', flex: 1 }}>
            Data Exfiltration — <b>Santosh</b> ({john.email}) bulk-downloaded 4.2 GB from S3 at 02:47 AM. PIP employee.
          </span>
          <span className="b hi"><i />HIGH</span>
          <button className="btn" style={{ marginLeft: 4 }} onClick={() => setDrawerUser(john)}>View</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="kg k4">
        <MetricCard cls="ok" num={summary.directory.count}    desc={summary.directory.label}   label="Directory"    foot={`<b>+${summary.directory.trend}</b> ${summary.directory.detail}`} icon={Icons.user} />
        <MetricCard cls="cr" num={String(highRiskCount)}      desc={summary.highRisk.label}    label="High Risk"    foot={`<b>▲ ${summary.highRisk.trend}</b> ${summary.highRisk.detail}`}  icon={Icons.alert} />
        <MetricCard cls="hi" num={String(offboardCount)}      desc={summary.offboarding.label} label="Offboarding"  foot={summary.offboarding.trend}                                         icon={Icons.user} />
        <MetricCard cls="ok" num={summary.mfa.count}          desc={summary.mfa.label}         label="MFA Coverage" foot={summary.mfa.trend}                                                 icon={Icons.lock} />
      </div>

      {/* User Directory Table */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>User Directory</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <SegControl options={['All', 'High Risk', 'Offboarding']} active={filter} onSelect={setFilter} />
            <button className="btn p">Invite user</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>{['User', 'Dept', 'Risk Score', 'MFA', 'Last Login', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr
                key={u.email}
                style={
                  u.simId === 'vyshnavi' && isEscalated ? { animation: 'rowFlash 1.2s ease', background: 'rgba(239,68,68,.04)' } :
                  u.simId === 'john'     && johnAlert   ? { animation: 'rowFlash 1.2s ease', background: 'rgba(249,115,22,.04)' } :
                  {}
                }
              >
                <td>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{u.email}</div>
                </td>
                <td>{u.dept}</td>
                <td><RiskBar risk={u.risk} riskCls={u.riskCls} /></td>
                <td>
                  {u.mfa === 'BYPASSED'
                    ? <span className="b cr"><i />BYPASSED</span>
                    : u.mfa
                      ? <span className="ch">{u.mfa}</span>
                      : <span className="b cr"><i />NONE</span>
                  }
                </td>
                <td className="mono">{u.login}</td>
                <td><StatusBadge status={u.status} cls={u.statusCls} /></td>
                <td>
                  <div className="brow">
                    <button className="btn" onClick={() => setDrawerUser(u)}>View</button>
                    {u.risk > 80 && <button className="btn d">Suspend</button>}
                    {u.status === 'OFFBOARDING' && <button className="btn d">Revoke all</button>}
                    {u.status === 'UNDER REVIEW' && <button className="btn d">Lock</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Widgets */}
      <div className="g3">
        <WidgetCard title="Risk distribution">
          {riskDist.map(r => <RowBar key={r.label} {...r} />)}
        </WidgetCard>

        <WidgetCard title="Active PAM sessions">
          {pam.map(s => (
            <div key={s.user} className="row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.user}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{s.host}</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--high)' }}>{s.timeLeft}</span>
              <button className="btn d" style={{ marginLeft: 8 }}>Revoke</button>
            </div>
          ))}
          <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)', marginTop: 8 }}>
            <button className="btn">Request JIT access</button>
          </div>
        </WidgetCard>

        <WidgetCard title="SSO federation">
          {sso.map(f => (
            <div key={f.name} className="row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{f.note ?? `${f.sessions} active sessions`}</div>
              </div>
              <span className={`b ${f.status}`}><i />{f.status === 'ok' ? 'HEALTHY' : 'PLANNED'}</span>
            </div>
          ))}
        </WidgetCard>
      </div>

      {/* Alert detail drawer */}
      {drawerUser && drawerAlert && (
        <AlertDrawer alert={drawerAlert} onClose={() => setDrawerUser(null)} />
      )}
    </>
  )
}
