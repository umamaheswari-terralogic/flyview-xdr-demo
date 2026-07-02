import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { CloudService } from '../../../services/CloudService.js'

// ── Link Account Modal ────────────────────────────────────────────
const PROVIDERS = [
  { id: 'gcp',   label: 'GCP',   icon: '☁',  color: '#4285F4', available: true  },
  { id: 'aws',   label: 'AWS',   icon: '⬡',  color: '#FF9900', available: false },
  { id: 'azure', label: 'Azure', icon: '◈',  color: '#0078D4', available: false },
]

const ENVS = ['Production', 'Staging', 'Development', 'Testing']

function LinkAccountModal({ onClose, onLinked }) {
  const [provider,    setProvider]    = useState('gcp')
  const [projectId,   setProjectId]   = useState('')
  const [displayName, setDisplayName] = useState('')
  const [env,         setEnv]         = useState('Production')
  const [validating,  setValidating]  = useState(false)
  const [connected,   setConnected]   = useState(false)

  const stepDone = {
    1: !!provider,
    2: !!projectId && !!displayName,
    3: true,
    4: connected,
  }

  function handleValidate() {
    if (!projectId || !displayName) return
    setValidating(true)
    setTimeout(() => {
      setValidating(false)
      setConnected(true)
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
              <span style={labelStyle}>GCP Project ID</span>
              <input style={inputStyle} value={projectId} onChange={e => setProjectId(e.target.value)} placeholder="my-project-123" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: 10 }}>
              <span style={labelStyle}>Display name</span>
              <input style={inputStyle} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Production GCP" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', gap: 10 }}>
              <span style={labelStyle}>Environment</span>
              <select style={inputStyle} value={env} onChange={e => setEnv(e.target.value)}>
                {ENVS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Step 3 — Credentials */}
        <div>
          <StepLabel n={3} text="Set up credentials" done={stepDone[3]} />
          <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0 12px', lineHeight: 1.6 }}>
            Instructions for creating GCP Workload Identity with the required read-only IAM roles
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12,
            }}>
              📋 Copy setup script
            </button>
            <button className="btn" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12,
            }}>
              🔗 Open GCP Console →
            </button>
          </div>
        </div>

        {/* Step 4 — Validate */}
        <div>
          <StepLabel n={4} text="Validate & connect" done={stepDone[4]} />
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn"
              onClick={handleValidate}
              disabled={validating || connected || !projectId || !displayName}
              style={{ width: '100%', fontSize: 13, fontWeight: 600, padding: '10px',
                opacity: (!projectId || !displayName) ? 0.45 : 1,
                cursor: (!projectId || !displayName) ? 'not-allowed' : 'pointer',
              }}
            >
              {validating ? '⟳ Validating…' : 'Validate credentials'}
            </button>

            {connected && (
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

// ── Accounts tab ──────────────────────────────────────────────────
export default function Accounts() {
  const [accounts, setAccounts]     = useState([])
  const [showModal, setShowModal]   = useState(false)

  useEffect(() => { CloudService.getAccounts().then(setAccounts) }, [])

  const totalFindings = accounts.reduce((s, a) => s + a.findings.critical + a.findings.high + a.findings.medium + a.findings.low, 0)

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 18 }}>
        {accounts.map(a => (
          <div key={a.id} className="card">
            <div className="card-h">
              <h3>
                <span style={{ fontSize: 13, fontWeight: 700, color: a.providerColor, marginRight: 8 }}>{a.provider}</span>
                {a.name}
              </h3>
              <StatusBadge status={a.status} cls={a.statusCls} />
            </div>
            <div style={{ padding: '8px 0 4px' }}>
              <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 10 }}>
                <span className="mono">{a.accountId}</span> · {a.region}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Critical', val: a.findings.critical, color: 'var(--crit)' },
                  { label: 'High',     val: a.findings.high,     color: 'var(--high)' },
                  { label: 'Medium',   val: a.findings.medium,   color: 'var(--med)'  },
                  { label: 'Low',      val: a.findings.low,      color: 'var(--txt3)' },
                ].map(f => (
                  <div key={f.label} style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--bg3)', borderRadius: 6 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: f.color }}>{f.val}</div>
                    <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 2 }}>{f.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--txt3)', marginBottom: 4 }}>
                  <span>Compliance score</span>
                  <span style={{ fontWeight: 700, color: a.complianceCls === 'ok' ? 'var(--ok)' : 'var(--high)' }}>{a.compliance}%</span>
                </div>
                <div className="pb">
                  <i style={{ width: `${a.compliance}%`, background: a.complianceCls === 'ok' ? 'var(--ok)' : a.compliance >= 70 ? 'var(--high)' : 'var(--crit)' }} />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 6 }}>Active services</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {a.services.map(s => <span key={s} className="ch">{s}</span>)}
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--txt3)', borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span>Last scan: {a.lastScan}</span>
                <button className="btn p" style={{ fontSize: 11, padding: '2px 10px' }}>Scan now</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Account summary <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>{totalFindings} total findings across {accounts.length} accounts</span></h3>
          <button className="btn p" onClick={() => setShowModal(true)}>+ Link Account</button>
        </div>
        <table>
          <thead>
            <tr>{['Account', 'Provider', 'Account ID', 'Region', 'Critical', 'High', 'Compliance', 'Last scan', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
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
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="pb" style={{ width: 60 }}><i style={{ width: `${a.compliance}%`, background: a.complianceCls === 'ok' ? 'var(--ok)' : 'var(--high)' }} /></div>
                    <span className="mono" style={{ fontSize: 11 }}>{a.compliance}%</span>
                  </div>
                </td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.lastScan}</td>
                <td><StatusBadge status={a.status} cls={a.statusCls} /></td>
                <td><div className="brow"><button className="btn">View</button></div></td>
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
    </>
  )
}
