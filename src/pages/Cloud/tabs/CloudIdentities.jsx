import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { CloudService } from '../../../services/CloudService.js'
import { consumePendingProviderFilter } from '../../../services/cloudFilterBridge.js'

const FILTERS  = ['All', 'Critical', 'Stale', 'Unmanaged']
const PROVIDERS = ['All', 'GCP', 'AWS']

const PRINCIPAL_LABEL = {
  service_account: 'Service Account',
  user_account:    'User Account',
  iam_role:        'IAM Role',
}

// MFA is only a meaningful concept for interactive human users — never for
// roles, service accounts, or key records (a key isn't the thing that logs in)
function showsMfa(i) {
  return i.cloudProvider === 'AWS' && i.principalType === 'user_account' && i.type !== 'Access Key'
}

function IdentityDrawer({ identity, onClose }) {
  if (!identity) return null
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="ch">{identity.type}</span>
              <StatusBadge status={identity.risk} cls={identity.riskCls} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--txt)' }}>{identity.id}</div>
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--txt3)', marginTop: 3 }}>{identity.email}</div>
          </div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        <div className="drawer-body">
          <div>
            <div className="drawer-section-title">Identity metadata</div>
            <div className="drawer-meta-grid">
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Provider</div>
                <div className="drawer-meta-value" style={{ color: identity.providerColor }}>{identity.provider}</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Principal type</div>
                <div className="drawer-meta-value">{PRINCIPAL_LABEL[identity.principalType] ?? identity.principalType}</div>
              </div>
              {identity.roles?.length > 0 && (
                <div className="drawer-meta-item" style={{ gridColumn: '1 / -1' }}>
                  <div className="drawer-meta-label">Roles / Permissions</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
                    {identity.roles.map(r => <span key={r} className="ch mono">{r}</span>)}
                  </div>
                </div>
              )}
              {identity.keyAge != null && (
                <div className="drawer-meta-item">
                  <div className="drawer-meta-label">Key age</div>
                  <div className="drawer-meta-value">{identity.keyAge} days</div>
                </div>
              )}
              {identity.lastUsedAt && (
                <div className="drawer-meta-item">
                  <div className="drawer-meta-label">Last used</div>
                  <div className="drawer-meta-value">{identity.lastUsedAt}</div>
                </div>
              )}
              {showsMfa(identity) && (
                <div className="drawer-meta-item">
                  <div className="drawer-meta-label">MFA enabled</div>
                  <div className="drawer-meta-value" style={{ color: identity.mfaEnabled ? 'var(--ok)' : 'var(--crit)' }}>
                    {identity.mfaEnabled ? 'Yes' : 'No'}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="drawer-section-title">Risk flags</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {identity.stale && <span className="b hi"><i />STALE (&gt;90d inactive)</span>}
              {identity.unmanaged && <span className="b in"><i />UNMANAGED</span>}
              {!identity.stale && !identity.unmanaged && <span className="b ok"><i />NONE</span>}
            </div>
          </div>

          {identity.enrichedOwner && (
            <div>
              <div className="drawer-section-title">Enriched owner</div>
              <div className="drawer-meta-grid">
                <div className="drawer-meta-item">
                  <div className="drawer-meta-label">User ID</div>
                  <div className="drawer-meta-value mono">{identity.enrichedOwner.userId}</div>
                </div>
                <div className="drawer-meta-item">
                  <div className="drawer-meta-label">Email</div>
                  <div className="drawer-meta-value">{identity.enrichedOwner.email}</div>
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="drawer-section-title">Finding</div>
            <div className="drawer-desc">{identity.finding}</div>
          </div>

          {identity.cloudProvider === 'GCP' && identity.privEscalationPath && (
            <div>
              <div className="drawer-section-title">Privilege escalation path</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {identity.privEscalationPath.map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--txt3)', width: 14 }}>{i + 1}</span>
                    <span style={{ fontSize: 12, color: 'var(--txt2)' }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="drawer-actions">
          <button className="btn p" disabled title="Not available in Phase-1" style={{ opacity: 0.45, cursor: 'not-allowed' }}>Remediate</button>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  )
}

export default function CloudIdentities() {
  const [identities, setIdentities] = useState([])
  const [filter, setFilter] = useState('All')
  const [provider, setProvider] = useState(() => consumePendingProviderFilter() ?? 'All')
  const [selected, setSelected] = useState(null)

  useEffect(() => { CloudService.getCloudIdentities().then(setIdentities) }, [])

  const filtered = identities.filter(i => {
    if (provider !== 'All' && i.cloudProvider !== provider) return false
    if (filter === 'Critical')  return i.riskCls === 'cr'
    if (filter === 'Stale')     return i.stale
    if (filter === 'Unmanaged') return i.unmanaged
    return true
  })

  const critical   = identities.filter(i => i.riskCls === 'cr').length
  const stale      = identities.filter(i => i.stale).length
  const unmanaged  = identities.filter(i => i.unmanaged).length

  return (
    <>
      <div className="card">
        <div className="card-h">
          <h3>Cloud Identities (CIEM)
            <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
              <span style={{ color: 'var(--crit)' }}>{critical} critical</span>
              {' · '}<span style={{ color: 'var(--high)' }}>{stale} stale</span>
              {' · '}{unmanaged} unmanaged
            </span>
          </h3>
          <div style={{ display: 'flex', gap: 6 }}>
            <div className="seg">
              {PROVIDERS.map(p => <button key={p} className={provider === p ? 'on' : ''} onClick={() => setProvider(p)}>{p}</button>)}
            </div>
            <div style={{ display: 'flex', gap: 6, marginLeft: 4 }}>
              {FILTERS.map(f => (
                <button key={f} className={`btn${filter === f ? ' p' : ''}`} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
          </div>
        </div>
        <table>
          <thead>
            <tr>{['Identity', 'Type', 'Provider', 'Flags', 'Risk', 'Finding', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(i => {
              return (
                <tr key={i.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{i.id}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--txt3)' }}>{i.email}</div>
                  </td>
                  <td><span className="ch">{i.type}</span></td>
                  <td><span style={{ fontSize: 11, fontWeight: 700, color: i.providerColor }}>{i.provider}</span></td>
                  {/* <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 200 }}>
                      {(i.roles ?? []).map(r => <span key={r} className="ch mono" style={{ fontSize: 10 }}>{r}</span>)}
                    </div>
                  </td> */}
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {i.stale     && <span className="b hi" style={{ fontSize: 10 }}><i />STALE</span>}
                      {i.unmanaged && <span className="b in" style={{ fontSize: 10 }}><i />UNMANAGED</span>}
                      {showsMfa(i) && (
                        <span className={`b ${i.mfaEnabled ? 'ok' : 'cr'}`} style={{ fontSize: 10 }}><i />{i.mfaEnabled ? 'MFA' : 'NO MFA'}</span>
                      )}
                    </div>
                  </td>
                  <td><StatusBadge status={i.risk} cls={i.riskCls} /></td>
                  <td style={{ fontSize: 11, color: 'var(--txt2)', maxWidth: 240 }}>{i.finding}</td>
                  <td>
                    <div className="brow">
                      <button className="btn" onClick={() => setSelected(i)}>View</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selected && <IdentityDrawer identity={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
