import { useState, useEffect, useRef } from 'react'
import MetricCard from '../../../components/MetricCard.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import WidgetCard from '../../../components/WidgetCard.jsx'
import { IdentityService } from '../../../services/IdentityService.js'
import { Icons } from '../../../shared/icons.jsx'

const API = 'http://localhost:3001/api/identity'
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

// Alert banner shown inline on the sim user row when escalated
function ThreatBanner({ alert }) {
  return (
    <div style={{
      gridColumn: '1 / -1',
      background: 'rgba(239,68,68,.08)',
      border: '1px solid rgba(239,68,68,.25)',
      borderLeft: '3px solid var(--crit)',
      borderRadius: 6,
      padding: '7px 12px',
      fontSize: 11.5,
      color: 'var(--crit)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    }}>
      <span style={{ fontSize: 14 }}>⚠</span>
      <span><b>{alert.type.replace(/_/g, ' ')}</b> — {alert.detail}</span>
    </div>
  )
}

export default function IdentityOverview() {
  const [summary, setSummary]   = useState(null)
  const [users, setUsers]       = useState([])
  const [riskDist, setRiskDist] = useState([])
  const [pam, setPam]           = useState([])
  const [sso, setSso]           = useState([])
  const [filter, setFilter]     = useState('All')
  const [loading, setLoading]   = useState(true)
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
      setSummary(s)
      setRiskDist(rd)
      setPam(p)
      setSso(f)
    }).finally(() => setLoading(false))

    // Poll every 4s so the GUI reacts when /trigger is called externally
    pollRef.current = setInterval(fetchUsers, POLL_MS)
    return () => clearInterval(pollRef.current)
  }, [])

  if (loading) return <div className="loading-state">Loading identity data…</div>

  const vyshnavi   = users.find(u => u.simId === 'vyshnavi')
  const john       = users.find(u => u.simId === 'john')
  const simUser    = vyshnavi  // legacy ref used in table row flash
  const isEscalated = vyshnavi?.riskCls === 'cr' && vyshnavi?.alert
  const johnAlert   = john?.alert

  // Live KPI counts derived from current server state
  const highRiskCount = users.filter(u => u.riskCls === 'cr' || u.riskCls === 'hi').length
  const offboardCount = users.filter(u => u.status === 'OFFBOARDING').length

  const filtered = filter === 'All' ? users
    : filter === 'High Risk' ? users.filter(u => u.riskCls === 'cr' || u.riskCls === 'hi')
    : users.filter(u => u.status === 'OFFBOARDING')

  return (
    <>
      {/* KPI Cards — high-risk count is live from server state */}
      <div className="kg k4">
        <MetricCard cls="ok" num={summary.directory.count}    desc={summary.directory.label}   label="Directory"    foot={`<b>+${summary.directory.trend}</b> ${summary.directory.detail}`} icon={Icons.user} />
        <MetricCard cls="cr" num={String(highRiskCount)}      desc={summary.highRisk.label}    label="High Risk"    foot={`<b>▲ ${summary.highRisk.trend}</b> ${summary.highRisk.detail}`}  icon={Icons.alert} />
        <MetricCard cls="hi" num={String(offboardCount)}      desc={summary.offboarding.label} label="Offboarding"  foot={summary.offboarding.trend}                                         icon={Icons.user} />
        <MetricCard cls="ok" num={summary.mfa.count}          desc={summary.mfa.label}         label="MFA Coverage" foot={summary.mfa.trend}                                                 icon={Icons.lock} />
      </div>

      {/* Escalation banner — visible only when sim user is flagged */}
      {isEscalated && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          background: 'rgba(239,68,68,.07)',
          border: '1px solid rgba(239,68,68,.3)',
          borderLeft: '4px solid var(--crit)',
          borderRadius: 10, padding: '14px 18px', marginBottom: 18,
        }}>
          <div style={{ fontSize: 22, marginTop: 1 }}>🚨</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--crit)', marginBottom: 3 }}>
              Identity threat detected — Impossible Travel
            </div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', lineHeight: 1.5 }}>
              <b>{simUser.name}</b> ({simUser.email}) logged in from two geographically impossible locations within 18 minutes. MFA challenge was not completed. Account automatically placed under review.
            </div>
          </div>
          <span className="b cr" style={{ marginTop: 2, flexShrink: 0 }}><i />UNDER REVIEW</span>
        </div>
      )}

      {/* John P. — Insider threat / data exfil banner (HIGH) */}
      {johnAlert && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          background: 'rgba(249,115,22,.07)',
          border: '1px solid rgba(249,115,22,.3)',
          borderLeft: '4px solid var(--high)',
          borderRadius: 10, padding: '14px 18px', marginBottom: 18,
        }}>
          <div style={{ fontSize: 22, marginTop: 1 }}>🔍</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--high)', marginBottom: 3 }}>
              Insider threat — suspected data exfiltration by PIP employee
            </div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', lineHeight: 1.5 }}>
              <b>Shabbeer</b> ({john.email}) logged into AWS at <b>02:47 AM</b> and made <b>4,200 S3 GetObject calls</b> on <span className="mono">corp-data-prod</span> (4.2 GB) within 12 minutes.
              Employee is currently on a <b>Performance Improvement Plan (PIP)</b>. Access is outside business hours and far exceeds baseline.{' '}
              <span style={{ color: 'var(--high)', fontWeight: 600 }}>Correlated finding visible in Cloud module — click "Revoke IAM" there to resolve both.</span>
            </div>
          </div>
          <span className="b hi" style={{ marginTop: 2, flexShrink: 0 }}><i />MONITORING</span>
        </div>
      )}

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
            <tr>
              {['User', 'Dept', 'Risk Score', 'MFA', 'Last Login', 'Status', ''].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <>
                <tr
                  key={u.email}
                  style={
                    u.simId === 'vyshnavi' && isEscalated ? { animation: 'rowFlash 1.2s ease', background: 'rgba(239,68,68,.04)' } :
                    u.simId === 'john' && johnAlert        ? { animation: 'rowFlash 1.2s ease', background: 'rgba(249,115,22,.04)' } :
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
                      <button className="btn">View</button>
                      {u.risk > 80 && <button className="btn d">Suspend</button>}
                      {u.status === 'OFFBOARDING' && <button className="btn d">Revoke all</button>}
                      {u.status === 'UNDER REVIEW' && <button className="btn d">Lock</button>}
                    </div>
                  </td>
                </tr>
                {/* Inline alert row for escalated sim user */}
                {u.sim && u.alert && (
                  <tr key={`${u.email}-alert`} style={{ background: 'rgba(239,68,68,.03)' }}>
                    <td colSpan={7} style={{ padding: '0 14px 10px' }}>
                      <ThreatBanner alert={u.alert} />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Widgets */}
      <div className="g3">
        <WidgetCard title="Risk distribution">
          {riskDist.map(r => (
            <RowBar key={r.label} label={r.label} pct={r.pct} color={r.color} val={r.val} />
          ))}
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
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>
                  {f.note ?? `${f.sessions} active sessions`}
                </div>
              </div>
              <span className={`b ${f.status}`}><i />{f.status === 'ok' ? 'HEALTHY' : 'PLANNED'}</span>
            </div>
          ))}
        </WidgetCard>
      </div>
    </>
  )
}
