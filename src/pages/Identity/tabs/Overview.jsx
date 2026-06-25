import { useState, useEffect } from 'react'
import MetricCard from '../../../components/MetricCard.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import WidgetCard from '../../../components/WidgetCard.jsx'
import { IdentityService } from '../../../services/IdentityService.js'
import { Icons } from '../../../shared/icons.jsx'

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

export default function IdentityOverview() {
  const [summary, setSummary]   = useState(null)
  const [users, setUsers]       = useState([])
  const [riskDist, setRiskDist] = useState([])
  const [pam, setPam]           = useState([])
  const [sso, setSso]           = useState([])
  const [filter, setFilter]     = useState('All')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      IdentityService.getSummary(),
      IdentityService.getUsers(),
      IdentityService.getRiskDistribution(),
      IdentityService.getPamSessions(),
      IdentityService.getSsoFederation(),
    ]).then(([s, u, rd, p, f]) => {
      setSummary(s)
      setUsers(u)
      setRiskDist(rd)
      setPam(p)
      setSso(f)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading-state">Loading identity data…</div>

  const filtered = filter === 'All' ? users
    : filter === 'High Risk' ? users.filter(u => u.riskCls === 'cr' || u.riskCls === 'hi')
    : users.filter(u => u.status === 'OFFBOARDING')

  return (
    <>
      {/* KPI Cards */}
      <div className="kg k4">
        <MetricCard cls="ok" num={summary.directory.count}   desc={summary.directory.label}    label="Directory"   foot={`<b>+${summary.directory.trend}</b> ${summary.directory.detail}`}  icon={Icons.user} />
        <MetricCard cls="cr" num={summary.highRisk.count}    desc={summary.highRisk.label}     label="High Risk"   foot={`<b>▲ ${summary.highRisk.trend}</b> ${summary.highRisk.detail}`}   icon={Icons.alert} />
        <MetricCard cls="hi" num={summary.offboarding.count} desc={summary.offboarding.label}  label="Offboarding" foot={summary.offboarding.trend}                                          icon={Icons.user} />
        <MetricCard cls="ok" num={summary.mfa.count}         desc={summary.mfa.label}          label="MFA Coverage" foot={summary.mfa.trend}                                                icon={Icons.lock} />
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
            <tr>
              {['User', 'Dept', 'Risk Score', 'MFA', 'Last Login', 'Status', ''].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.email}>
                <td>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{u.email}</div>
                </td>
                <td>{u.dept}</td>
                <td><RiskBar risk={u.risk} riskCls={u.riskCls} /></td>
                <td>{u.mfa ? <span className="ch">{u.mfa}</span> : <span className="b cr"><i />NONE</span>}</td>
                <td className="mono">{u.login}</td>
                <td><StatusBadge status={u.status} cls={u.statusCls} /></td>
                <td>
                  <div className="brow">
                    <button className="btn">View</button>
                    {u.risk > 80 && <button className="btn d">Suspend</button>}
                    {u.status === 'OFFBOARDING' && <button className="btn d">Revoke all</button>}
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
