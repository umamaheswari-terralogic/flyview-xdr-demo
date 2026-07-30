import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MetricCard from "../../../components/MetricCard";
import StatusBadge from "../../../components/StatusBadge";
import { Icons } from "../../../shared/icons";

const USERS = [
  { name: 'John Doe', email: 'john.d@acme.com', dept: 'Finance', risk: 87, riskCls: 'cr', mfa: 'TOTP', login: '09:14', status: 'ACTIVE', statusCls: 'ok', "identityProvider": "okta", "externalId": "00u1venkateshBAB01" },
  { name: 'Robert Chen', email: 'r.chen@acme.com', dept: 'Finance', risk: 91, riskCls: 'cr', mfa: null, login: 'Yesterday', status: 'OFFBOARDING', statusCls: 'hi', "identityProvider": "okta", "externalId": "00u1kamaksheeM02"},
  { name: 'Sarah Kim', email: 'sarah.k@acme.com', dept: 'Engineering', risk: 72, riskCls: 'hi', mfa: 'WebAuthn', login: '09:02', status: 'ACTIVE', statusCls: 'ok', "identityProvider": "okta", "externalId": "00u1anuragP03" },
  { name: 'Mike Ross', email: 'mike.r@acme.com', dept: 'Sales', risk: 44, riskCls: 'me', mfa: 'Push', login: '08:55', status: 'ACTIVE', statusCls: 'ok', "identityProvider": "okta", "externalId": "00u1soujanyaA04" },
  { name: 'Emma Clark', email: 'emma.c@acme.com', dept: 'HR', risk: 21, riskCls: 'ok', mfa: 'WebAuthn', login: '08:30', status: 'ACTIVE', statusCls: 'ok', "identityProvider": "okta", "externalId": "00u1bharathiV05" },
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

export default function IdentityOverview() {
  const navigate = useNavigate()
  return (
    <>
      <div className="kg k2">
        <MetricCard cls="ok" num="930" desc="Total managed users" label="Directory" foot="" icon={Icons.user} />
        {/* <MetricCard cls="cr" num="4" desc="High-risk users" label="High Risk" foot="<b>▲ +1</b> today" icon={Icons.alert} /> */}
        {/* <MetricCard cls="hi" num="1" desc="User in offboarding" label="Offboarding" foot="≤15min deprovision" icon={Icons.user} /> */}
        <MetricCard cls="ok" num="12" desc="" label="MFA Gap Detection" foot="" icon={Icons.lock} />
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>User Directory</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="seg">
              <button className="on">All</button>
              {/* <button>High Risk</button><button>Offboarding</button> */}
            </div>
            <button className="btn p">Invite user</button>
          </div>
        </div>
        <table>
          <thead><tr>{['User', 'Dept', 'Identity Provider', 'Last Login', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {USERS.map(u => (
              <tr key={u.email}>
                <td><div style={{ fontWeight: 600 }}>{u.name}</div><div style={{ fontSize: 11, color: 'var(--txt3)' }}>{u.email}</div></td>
                <td>{u.dept}</td>
                {/* <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="pb" style={{ width: 60 }}><i style={{ width: `${u.risk}%`, background: u.riskCls === 'cr' ? 'var(--crit)' : u.riskCls === 'hi' ? 'var(--high)' : u.riskCls === 'me' ? 'var(--med)' : 'var(--ok)' }} /></div>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: u.riskCls === 'cr' ? 'var(--crit)' : u.riskCls === 'hi' ? 'var(--high)' : 'var(--txt2)' }}>{u.risk}</span>
                  </div>
                </td> */}
                <td>{u.identityProvider}</td>
                <td className="mono">{u.login}</td>
                <td><StatusBadge status={u.status} cls={u.statusCls} /></td>
                <td>
                  <div className="brow">
                    <button className="btn" onClick={() => navigate(`/identity/users/${u.externalId}`)}>View</button>
                    {/* {u.risk > 80 && <button className="btn d">Suspend</button>}
                    {u.status === 'OFFBOARDING' && <button className="btn d">Revoke all</button>} */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* <div className="g3">
        <div className="card"><div className="card-h"><h3>Risk distribution</h3></div><div className="card-b">
          <RowBar label="CRITICAL" pct={11} color="var(--crit)" val="1" />
          <RowBar label="HIGH" pct={33} color="var(--high)" val="3" />
          <RowBar label="MEDIUM" pct={100} color="var(--med)" val="48" />
          <RowBar label="LOW" pct={100} color="var(--ok)" val="878" />
        </div></div>

        <div className="card"><div className="card-h"><h3>Active PAM sessions</h3></div><div className="card-b">
          {[{ user: 'alice@acme.com', host: 'prod-db-01', time: '47m left' }, { user: 'bob@acme.com', host: 'gke-cluster', time: '1h 12m' }].map(s => (
            <div key={s.user} className="row">
              <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.user}</div><div className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{s.host}</div></div>
              <span style={{ fontSize: 11, color: 'var(--high)' }}>{s.time}</span>
              <button className="btn d" style={{ marginLeft: 8 }}>Revoke</button>
            </div>
          ))}
          <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)', marginTop: 8 }}><button className="btn">Request JIT access</button></div>
        </div></div>

        <div className="card"><div className="card-h"><h3>SSO federation</h3></div><div className="card-b">
          {[{ name: 'Google Workspace', sessions: 847, status: 'ok' }, { name: 'Microsoft 365', sessions: 83, status: 'ok' }, { name: 'Okta', sessions: null, status: 'ne', note: 'Phase 2 – not connected' }].map(f => (
            <div key={f.name} className="row">
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</div><div style={{ fontSize: 11, color: 'var(--txt3)' }}>{f.note ?? `${f.sessions} active sessions`}</div></div>
              <span className={`b ${f.status}`}><i />{f.status === 'ok' ? 'HEALTHY' : 'PLANNED'}</span>
            </div>
          ))}
        </div></div>
      </div> */}
    </>
  )
}