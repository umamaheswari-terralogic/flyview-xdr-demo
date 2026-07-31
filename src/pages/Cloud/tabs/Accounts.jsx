import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { CloudService } from '../../../services/CloudService.js'
import { setPendingProviderFilter } from '../../../services/cloudFilterBridge.js'

const PROVIDER_ICON = { GCP: '☁', AWS: '⬡', Azure: '◈' }

// ── Link Account Modal ────────────────────────────────────────────
const PROVIDERS = [
  { id: 'gcp',   label: 'GCP',   icon: '☁',  color: '#4285F4', available: true  },
  { id: 'aws',   label: 'AWS',   icon: '⬡',  color: '#FF9900', available: true  },
  { id: 'azure', label: 'Azure', icon: '◈',  color: '#0078D4', available: false },
]

const ENVS = ['Production', 'Staging', 'Development', 'Testing']
const AWS_REGIONS = ['us-east-1', 'us-west-2', 'ap-south-1', 'eu-west-1']

function LinkAccountModal({ onClose, onLinked }) {
  const [provider,    setProvider]    = useState('gcp')
  const [projectId,   setProjectId]   = useState('')
  const [displayName, setDisplayName] = useState('')
  const [env,         setEnv]         = useState('Production')
  const [keyJson,     setKeyJson]     = useState('')
  const [accessKeyId, setAccessKeyId] = useState('')
  const [secretKey,   setSecretKey]   = useState('')
  const [region,      setRegion]      = useState(AWS_REGIONS[0])
  const [status,      setStatus]      = useState('IDLE') // IDLE | VALIDATING | CONNECTED | ERROR

  const credsDone = provider === 'gcp'
    ? !!keyJson
    : !!accessKeyId && !!secretKey && !!region

  const stepDone = {
    1: !!provider,
    2: !!projectId && !!displayName,
    3: credsDone,
    4: status === 'CONNECTED',
  }

  function handleValidate() {
    if (!projectId || !displayName || !credsDone) return
    setStatus('VALIDATING')
    setTimeout(() => {
      const ok = Math.random() > 0.15
      if (!ok) { setStatus('ERROR'); return }
      setStatus('CONNECTED')
      setTimeout(() => { onLinked?.(); onClose() }, 1400)
    }, 2200)
  }

  const inputStyle = {
    width: '100%', padding: '8px 11px', borderRadius: 7,
    border: '1px solid #e2e8f0', background: '#f8fafc',
    color: '#1e293b', fontSize: 13, outline: 'none',
    boxSizing: 'border-box',
  }
  const labelStyle = { fontSize: 12, color: '#64748b', marginBottom: 5, display: 'block' }

  return (
    /* Backdrop */
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={e => e.target === e.currentTarget && onClose()}>

      {/* Panel */}
      <div style={{
        width: 420, borderRadius: 16,
        background: '#ffffff', border: '1px solid #e2e8f0',
        boxShadow: '0 24px 64px rgba(0,0,0,.22)',
        padding: '24px 24px 20px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Add Account</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              US-East
            </span>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#94a3b8', fontSize: 20, lineHeight: 1, padding: '0 2px',
            }}>×</button>
          </div>
        </div>

        {/* Step 1 — Provider */}
        <div>
          <StepLabel n={1} text="Select provider" done={stepDone[1]} />
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {PROVIDERS.map(p => (
              <button key={p.id} onClick={() => p.available && setProvider(p.id)} style={{
                flex: 1, padding: '11px 8px', borderRadius: 10,
                border: `1.5px solid ${provider === p.id ? p.color : '#e2e8f0'}`,
                background: provider === p.id ? `${p.color}12` : '#f8fafc',
                cursor: p.available ? 'pointer' : 'default',
                opacity: p.available ? 1 : 0.5,
                transition: 'border-color .15s, background .15s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              }}>
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: p.available ? p.color : '#94a3b8' }}>{p.label}</span>
                {!p.available && <span style={{ fontSize: 9, color: '#94a3b8' }}>coming soon</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Account details */}
        <div>
          <StepLabel n={2} text="Enter account details" done={stepDone[2]} />
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: 10 }}>
              <span style={labelStyle}>{provider === 'gcp' ? 'GCP Project ID' : 'AWS Account ID'}</span>
              <input style={inputStyle} value={projectId} onChange={e => setProjectId(e.target.value)} placeholder={provider === 'gcp' ? 'my-project-123' : '123456789012'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: 10 }}>
              <span style={labelStyle}>Display name</span>
              <input style={inputStyle} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder={provider === 'gcp' ? 'Production GCP' : 'Production AWS'} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: 10 }}>
              <span style={labelStyle}>Environment</span>
              <select style={inputStyle} value={env} onChange={e => setEnv(e.target.value)}>
                {ENVS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            {provider === 'aws' && (
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: 10 }}>
                <span style={labelStyle}>Region</span>
                <select style={inputStyle} value={region} onChange={e => setRegion(e.target.value)}>
                  {AWS_REGIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Step 3 — Credentials */}
        <div>
          <StepLabel n={3} text="Set up credentials" done={stepDone[3]} />
          {provider === 'gcp' ? (
            <>
              <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0 10px', lineHeight: 1.6 }}>
                Paste or upload the service account <span className="mono">key.json</span> with the required read-only IAM roles.
              </p>
              <textarea
                rows={3}
                style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, resize: 'vertical' }}
                value={keyJson}
                onChange={e => setKeyJson(e.target.value)}
                placeholder='{ "type": "service_account", "project_id": "…", … }'
              />
              <label className="btn" style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                📁 Upload key.json
                <input
                  type="file"
                  accept="application/json"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) setKeyJson(`(uploaded: ${file.name})`)
                  }}
                />
              </label>
            </>
          ) : (
            <>
              <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0 12px', lineHeight: 1.6 }}>
                Enter an Access Key ID / Secret Access Key pair scoped to the required read-only IAM policy.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: 10 }}>
                  <span style={labelStyle}>Access Key ID</span>
                  <input style={inputStyle} value={accessKeyId} onChange={e => setAccessKeyId(e.target.value)} placeholder="AKIA…" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: 10 }}>
                  <span style={labelStyle}>Secret Access Key</span>
                  <input type="password" style={inputStyle} value={secretKey} onChange={e => setSecretKey(e.target.value)} placeholder="••••••••••••••••" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Step 4 — Validate */}
        <div>
          <StepLabel n={4} text="Validate & connect" done={stepDone[4]} />
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn"
              onClick={handleValidate}
              disabled={status === 'VALIDATING' || status === 'CONNECTED' || !projectId || !displayName || !credsDone}
              style={{ width: '100%', fontSize: 13, fontWeight: 600, padding: '10px',
                opacity: (!projectId || !displayName || !credsDone) ? 0.45 : 1,
                cursor: (!projectId || !displayName || !credsDone) ? 'not-allowed' : 'pointer',
              }}
            >
              {status === 'VALIDATING' ? '⟳ Validating…' : 'Validate credentials'}
            </button>

            {status === 'CONNECTED' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 8,
                background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.3)',
              }}>
                <span style={{ color: 'var(--ok)', fontSize: 15 }}>✓</span>
                <span style={{ fontSize: 12, color: 'var(--ok)', fontWeight: 600 }}>
                  Connected — triggering first scan…
                </span>
              </div>
            )}

            {status === 'ERROR' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 8,
                background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)',
              }}>
                <span style={{ color: 'var(--crit)', fontSize: 15 }}>✕</span>
                <span style={{ fontSize: 12, color: 'var(--crit)', fontWeight: 600 }}>
                  Validation failed — check credentials and try again.
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

function StepLabel({ n, text, done }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        background: done ? 'rgba(34,197,94,.12)' : '#f1f5f9',
        border: `1.5px solid ${done ? '#22c55e' : '#e2e8f0'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: done ? '#22c55e' : '#94a3b8',
      }}>
        {done ? '✓' : n}
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{text}</span>
    </div>
  )
}

// ── Account Detail popup ───────────────────────────────────────────
function AccountDetailDrawer({ account, onClose, onScan, onDisconnect, scanning, discovery, onNavigate }) {
  if (!account) return null
  const d = discovery

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        {/* Header */}
        <div className="drawer-head">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>{PROVIDER_ICON[account.provider] ?? '•'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: account.providerColor }}>{account.provider}</span>
              <StatusBadge status={account.status} cls={account.statusCls} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--txt)' }}>{account.name}</div>
          </div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        <div className="drawer-body">
          {/* Account metadata */}
          <div>
            <div className="drawer-section-title">Account metadata</div>
            <div className="drawer-meta-grid">
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">{account.provider === 'GCP' ? 'GCP Project ID' : `${account.provider} Account ID`}</div>
                <div className="drawer-meta-value mono">{account.accountId}</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Environment</div>
                <div className="drawer-meta-value">{account.environment ?? '—'}</div>
              </div>
              {account.provider === 'AWS' && (
                <div className="drawer-meta-item">
                  <div className="drawer-meta-label">Region</div>
                  <div className="drawer-meta-value">{account.region}</div>
                </div>
              )}
              <div className="drawer-meta-item" style={{ gridColumn: '1 / -1' }}>
                <div className="drawer-meta-label">Credential</div>
                <div className="drawer-meta-value">{account.credentialType ?? '—'}</div>
              </div>
            </div>
          </div>

          {/* Scan info */}
          <div>
            <div className="drawer-section-title">Scan info</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, color: 'var(--txt3)' }}>Last scan: <span className="mono">{account.lastScan}</span></div>
              <button className="btn p" disabled={scanning || account.status === 'DISCONNECTED'} onClick={() => onScan(account.id)}>
                {scanning ? '⟳ Scanning…' : 'Scan now'}
              </button>
            </div>
          </div>

          {/* Discovery summary */}
          <div>
            <div className="drawer-section-title">Discovery summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="row" style={{ all: 'unset', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: 'var(--bg3)' }}
                onClick={() => onNavigate('Findings', account.provider)}>
                <span style={{ fontSize: 12, color: 'var(--txt2)' }}>CSPM Findings</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>
                  <span style={{ color: 'var(--crit)' }}>{d.findingsCrit} Critical</span>, <span style={{ color: 'var(--high)' }}>{d.findingsHigh} High</span>, {d.findingsMed} Medium
                </span>
              </button>
              <button className="row" style={{ all: 'unset', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: 'var(--bg3)' }}
                onClick={() => onNavigate('Cloud Identities', account.provider)}>
                <span style={{ fontSize: 12, color: 'var(--txt2)' }}>Cloud Identities</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{d.identities} identities discovered</span>
              </button>
              <button className="row" style={{ all: 'unset', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: 'var(--bg3)' }}
                onClick={() => onNavigate('Data Repositories', account.provider)}>
                <span style={{ fontSize: 12, color: 'var(--txt2)' }}>Data Repositories</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{d.repos} repositories</span>
              </button>
            </div>
          </div>
        </div>

        <div className="drawer-actions">
          <button className="btn d" disabled={account.status === 'DISCONNECTED'} onClick={() => onDisconnect(account.id)}>Disconnect</button>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  )
}

// ── Accounts tab ──────────────────────────────────────────────────
export default function Accounts() {
  const { setActiveTab } = useOutletContext()
  const [accounts, setAccounts]     = useState([])
  const [showModal, setShowModal]   = useState(false)
  const [selected, setSelected]     = useState(null)
  const [scanningId, setScanningId] = useState(null)
  const [findings, setFindings]     = useState([])
  const [identities, setIdentities] = useState([])
  const [repos, setRepos]           = useState([])

  useEffect(() => {
    CloudService.getAccounts().then(setAccounts)
    CloudService.getFindings().then(setFindings)
    CloudService.getCloudIdentities().then(setIdentities)
    CloudService.getDataRepositories().then(setRepos)
  }, [])

  function handleScan(id) {
    if (scanningId) return
    setScanningId(id)
    setTimeout(() => {
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, lastScan: 'Just now' } : a))
      setSelected(prev => (prev && prev.id === id) ? { ...prev, lastScan: 'Just now' } : prev)
      setScanningId(null)
    }, 2200)
  }

  function handleDisconnect(id) {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status: 'DISCONNECTED', statusCls: 'ne' } : a))
    setSelected(prev => (prev && prev.id === id) ? { ...prev, status: 'DISCONNECTED', statusCls: 'ne' } : prev)
  }

  function handleNavigate(tab, provider) {
    setPendingProviderFilter(provider)
    setActiveTab(tab)
  }

  function discoveryFor(account) {
    const accFindings   = findings.filter(f => f.cloudProvider === account.provider)
    const accIdentities = identities.filter(i => i.cloudProvider === account.provider)
    const accRepos      = repos.filter(r => r.cloudProvider === account.provider)
    return {
      findingsCrit: accFindings.filter(f => f.sevCls === 'cr').length,
      findingsHigh: accFindings.filter(f => f.sevCls === 'hi').length,
      findingsMed:  accFindings.filter(f => f.sevCls === 'me').length,
      identities:   accIdentities.length,
      repos:        accRepos.length,
    }
  }

  const totalFindings = accounts.reduce((s, a) => s + a.findings.critical + a.findings.high + a.findings.medium + a.findings.low, 0)

  return (
    <>
      <div className="card">
        <div className="card-h">
          <h3>Account summary <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>{totalFindings} total findings across {accounts.length} accounts</span></h3>
          <button className="btn p" onClick={() => setShowModal(true)}>+ Link Account</button>
        </div>
        <table>
          <thead>
            <tr>{['Account', 'Provider', 'Account ID', 'Region', 'Critical', 'High', 'Last scan', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {accounts.map(a => (
              <tr key={a.id}>
                <td className="pr">{a.name}</td>
                <td><span style={{ fontSize: 11, fontWeight: 700, color: a.providerColor }}>{a.provider}</span></td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.accountId}</td>
                <td style={{ fontSize: 12, color: 'var(--txt3)' }}>{a.region}</td>
                <td className="mono" style={{ color: a.findings.critical > 0 ? 'var(--crit)' : 'var(--txt3)', fontWeight: 700 }}>{a.findings.critical}</td>
                <td className="mono" style={{ color: a.findings.high > 0 ? 'var(--high)' : 'var(--txt3)', fontWeight: 600 }}>{a.findings.high}</td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.lastScan}</td>
                <td><StatusBadge status={a.status} cls={a.statusCls} /></td>
                <td>
                  <div className="brow">
                    <button className="btn p" disabled={a.status === 'DISCONNECTED' || scanningId === a.id} onClick={() => handleScan(a.id)}>
                      {scanningId === a.id ? '⟳ Scanning…' : 'Scan now'}
                    </button>
                    <button className="btn d" disabled={a.status === 'DISCONNECTED'} onClick={() => handleDisconnect(a.id)}>Disconnect</button>
                    <button className="btn" onClick={() => setSelected(a)}>View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <LinkAccountModal
          onClose={() => setShowModal(false)}
          onLinked={() => CloudService.getAccounts().then(setAccounts)}
        />
      )}

      {selected && (
        <AccountDetailDrawer
          account={selected}
          onClose={() => setSelected(null)}
          onScan={handleScan}
          onDisconnect={handleDisconnect}
          scanning={scanningId === selected.id}
          discovery={discoveryFor(selected)}
          onNavigate={handleNavigate}
        />
      )}
    </>
  )
}
