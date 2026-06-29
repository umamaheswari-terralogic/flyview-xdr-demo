import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { IdentityService } from '../../../services/IdentityService.js'

export default function SSOFederation() {
  const [providers, setProviders] = useState([])
  const [scim, setScim] = useState(null)

  useEffect(() => {
    IdentityService.getSsoProviders().then(setProviders)
    IdentityService.getScimConfig().then(setScim)
  }, [])

  if (!scim) return null

  const active = providers.filter(p => p.status === 'HEALTHY').length

  return (
    <>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>SSO Providers
            <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>{active} active</span>
          </h3>
          <button className="btn p">+ Add provider</button>
        </div>
        <table>
          <thead>
            <tr>{['Provider', 'Protocol', 'Domain', 'Users', 'Active sessions', 'Last sync', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {providers.map(p => (
              <tr key={p.name}>
                <td className="pr">{p.name}</td>
                <td><span className="ch">{p.protocol}</span></td>
                <td className="mono" style={{ fontSize: 12 }}>{p.domain}</td>
                <td className="mono">{p.users || '—'}</td>
                <td className="mono">{p.sessions || '—'}</td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{p.lastSync}</td>
                <td><StatusBadge status={p.status} cls={p.statusCls} /></td>
                <td>
                  <div className="brow">
                    {p.status === 'HEALTHY' ? <button className="btn">Configure</button> : <button className="btn p">Connect</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="g3">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-h"><h3>SCIM provisioning</h3></div>
          <div style={{ padding: '12px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {[
              { label: 'Provider', val: scim.provider },
              { label: 'Endpoint', val: scim.endpoint, mono: true },
              { label: 'Last sync', val: scim.lastSync },
              { label: 'Auto-provision', val: scim.autoProvision ? 'Enabled' : 'Disabled', cls: scim.autoProvision ? 'ok' : 'cr' },
              { label: 'Auto-deprovision', val: scim.autoDeprovision ? 'Enabled' : 'Disabled', cls: scim.autoDeprovision ? 'ok' : 'hi' },
              { label: 'Groups synced', val: String(scim.groupsSync) },
            ].map(row => (
              <div key={row.label}>
                <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 4 }}>{row.label}</div>
                <div className={row.mono ? 'mono' : ''} style={{ fontSize: 13, fontWeight: 500, color: row.cls === 'ok' ? 'var(--ok)' : row.cls === 'cr' ? 'var(--crit)' : 'var(--txt)' }}>{row.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3>MFA methods</h3></div>
          <div className="card-b">
            {[
              { method: 'WebAuthn / FIDO2', pct: 58, val: '540', color: 'var(--ok)' },
              { method: 'Push (Duo)',        pct: 28, val: '261', color: 'var(--info)' },
              { method: 'TOTP (Auth app)',   pct: 8,  val: '74',  color: 'var(--high)' },
              { method: 'No MFA',            pct: 6,  val: '55',  color: 'var(--crit)' },
            ].map(m => (
              <div key={m.method} className="row">
                <span className="rn">{m.method}</span>
                <div className="pb" style={{ flex: 1 }}><i style={{ width: `${m.pct}%`, background: m.color }} /></div>
                <span className="rv" style={{ color: m.color }}>{m.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
