import StatusBadge from '../../../components/StatusBadge.jsx'

const POLICIES = [
  {
    name: 'CIS Endpoint Baseline v2',
    scope: 'All devices',
    rules: 14,
    compliant: 831,
    total: 847,
    cls: 'ok',
    status: 'ACTIVE',
    evaluated: '10 min ago',
    checks: ['OS version ≥ min supported', 'Disk encryption enforced', 'Screen lock ≤ 5 min', 'Required apps installed', 'Firewall enabled', 'Antivirus active'],
  },
  {
    name: 'BYOD Policy',
    scope: 'iOS · Android personal',
    rules: 8,
    compliant: 181,
    total: 183,
    cls: 'hi',
    status: 'PARTIAL',
    evaluated: '15 min ago',
    checks: ['Work profile isolated', 'Pin/biometric enabled', 'Jailbreak not detected', 'Approved apps only'],
  },
  {
    name: 'Executive Device Policy',
    scope: 'VP+ role group',
    rules: 18,
    compliant: 24,
    total: 24,
    cls: 'ok',
    status: 'ACTIVE',
    evaluated: '8 min ago',
    checks: ['FileVault/BitLocker on', 'VPN always-on', 'Remote wipe enabled', 'No local admin'],
  },
  {
    name: 'PCI-DSS Endpoint Controls',
    scope: 'Finance · Payments team',
    rules: 22,
    compliant: 38,
    total: 41,
    cls: 'cr',
    status: 'VIOLATION',
    evaluated: '5 min ago',
    checks: ['No unmanaged USB', 'Screen share blocked', 'Audit logging on', 'Network isolation'],
  },
  {
    name: 'Developer Workstation',
    scope: 'Engineering group',
    rules: 10,
    compliant: 98,
    total: 102,
    cls: 'hi',
    status: 'PARTIAL',
    evaluated: '20 min ago',
    checks: ['Local admin allowed (scoped)', 'VPN not required', 'Dev tools whitelisted'],
  },
]

const [expanded, setExpanded] = [null, () => {}]

import { useState } from 'react'

export default function CompliancePolicies() {
  const [open, setOpen] = useState(null)

  return (
    <>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>Compliance policies</h3>
          <button className="btn p">+ New policy</button>
        </div>
        <table>
          <thead>
            <tr>{['Policy', 'Scope', 'Rules', 'Compliant devices', 'Coverage', 'Status', 'Last evaluated', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {POLICIES.map(p => {
              const pct = Math.round((p.compliant / p.total) * 100)
              const barColor = p.cls === 'ok' ? 'var(--ok)' : p.cls === 'cr' ? 'var(--crit)' : 'var(--high)'
              return (
                <tr key={p.name}>
                  <td className="pr">{p.name}</td>
                  <td style={{ fontSize: 11, color: 'var(--txt3)' }}>{p.scope}</td>
                  <td className="mono">{p.rules}</td>
                  <td className="mono">{p.compliant} / {p.total}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="pb" style={{ width: 80 }}><i style={{ width: `${pct}%`, background: barColor }} /></div>
                      <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{pct}%</span>
                    </div>
                  </td>
                  <td><StatusBadge status={p.status} cls={p.cls} /></td>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{p.evaluated}</td>
                  <td>
                    <div className="brow">
                      <button className="btn" onClick={() => setOpen(open === p.name ? null : p.name)}>
                        {open === p.name ? 'Hide' : 'Rules'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {open && (() => {
        const p = POLICIES.find(x => x.name === open)
        return (
          <div className="card">
            <div className="card-h">
              <h3>{p.name} — rules</h3>
              <StatusBadge status={p.status} cls={p.cls} />
            </div>
            <div className="card-b" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {p.checks.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: 'var(--ok)', fontSize: 14 }}>✓</span>
                  <span style={{ fontSize: 13 }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })()}
    </>
  )
}
