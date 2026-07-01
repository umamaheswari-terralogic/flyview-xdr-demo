import { useState } from 'react'
import { API_BASE } from '../../config.js'

const CONNECTORS = [
  'Google Workspace', 'Microsoft 365', 'Slack', 'GitHub',
  'Palo Alto Panorama', 'AWS Config', 'Azure Resource Graph',
]

const TEAM = [
  { initials: 'AM', name: 'Ahmed M.',  role: 'Security Admin',   roleKey: 'admin'   },
  { initials: 'SK', name: 'Sarah Kim', role: 'Security Analyst',  roleKey: 'analyst' },
  { initials: 'JD', name: 'John Doe',  role: 'Viewer',            roleKey: 'viewer'  },
  { initials: 'PV', name: 'Priya V.',  role: 'Security Analyst',  roleKey: 'analyst' },
]

// ── Simulation scenarios ──────────────────────────────────────────
// modules: array of { label, cls } — shown as stacked badges
// triggerEndpoint / resetEndpoint: separate REST calls (not toggles)
const SCENARIOS = [
  {
    id:       'monitor-bec',
    title:    'Phishing Attack',
    desc:     'An employee clicks a suspicious link in an email and a malicious script runs on their laptop.',
    modules:  [{ label: 'Monitor', cls: 'cr' }],
    triggerEndpoint: '/api/monitor/trigger',
    resetEndpoint:   '/api/monitor/reset',
  },
  {
    id:       'identity-vyshnavi',
    title:    'Login from Two Countries at Once',
    desc:     'Vyshnavi logs in from Nellore, India, then from Texas, US 18 minutes later — physically impossible. MFA was skipped.',
    modules:  [{ label: 'Identity', cls: 'cr' }],
    triggerEndpoint: '/api/identity/vyshnavi.t%40terralogic.com/trigger',
    resetEndpoint:   '/api/identity/vyshnavi.t%40terralogic.com/reset',
  },
  {
    id:       'identity-santosh',
    title:    'PIP Employee Stealing Data Before Exit',
    desc:     'Santosh (PIP employee) downloads gigabytes of company files from cloud storage at 2 AM.',
    modules:  [{ label: 'Identity', cls: 'hi' }, { label: 'Cloud', cls: 'hi' }],
    triggerEndpoint: '/api/identity/santosh%40terralogic.com/trigger',
    resetEndpoint:   '/api/identity/santosh%40terralogic.com/reset',
  },
  {
    id:       'devices-antivirus',
    title:    'Antivirus Turned Off',
    desc:     'Antivirus is disabled on Vyshnavi\'s laptop, leaving it unprotected and out of company policy.',
    modules:  [{ label: 'Devices', cls: 'cr' }, { label: 'Threats', cls: 'cr' }, { label: 'Identity', cls: 'cr' }],
    triggerEndpoint: '/api/devices/LT-VyshnaviT-3941/trigger',
    resetEndpoint:   '/api/devices/LT-VyshnaviT-3941/reset',
  },
  {
    id:       'devices-blockedapp',
    title:    'Unauthorised AI Tool Installed',
    desc:     'An employee installs ChatGPT as a browser extension — a blocked app that could leak company data.',
    modules:  [{ label: 'Devices', cls: 'hi' }, { label: 'AI-SPM', cls: 'hi' }, { label: 'Threats', cls: 'hi' }],
    triggerEndpoint: '/api/devices/LT-VyshnaviT-3941/trigger/blockedapp',
    resetEndpoint:   '/api/devices/LT-VyshnaviT-3941/reset/blockedapp',
  },
]

function Toggle({ defaultOn = false }) {
  const [on, setOn] = useState(defaultOn)
  return <button className={`tog ${on ? 'on' : ''}`} onClick={() => setOn(p => !p)} />
}

// Individual simulation trigger card — compact, 2-column grid
function SimCard({ scenario }) {
  const [active, setActive]         = useState(false)
  const [loading, setLoading]       = useState(null)  // 'trigger' | 'reset' | null
  const [flash,   setFlash]         = useState(null)  // 'ok' | 'err'

  const clsMap = { cr: 'var(--crit)', hi: 'var(--high)', me: 'var(--med)', ok: 'var(--ok)' }
  // Use the first module's colour for the card accent
  const accentColor = clsMap[scenario.modules[0]?.cls] ?? 'var(--txt2)'

  async function call(endpoint, type) {
    setLoading(type)
    try {
      const r = await fetch(`${API_BASE}${endpoint}`, { method: 'POST' })
      if (!r.ok) throw new Error()
      setActive(type === 'trigger')
      setFlash('ok')
    } catch {
      setFlash('err')
    } finally {
      setLoading(null)
      setTimeout(() => setFlash(null), 1800)
    }
  }

  return (
    <div style={{
      background: 'var(--card)',
      border: `1px solid ${active ? accentColor + '60' : 'var(--border)'}`,
      borderLeft: `4px solid ${accentColor}`,
      borderRadius: 10, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'border-color .3s',
      boxShadow: active ? `0 0 0 1px ${accentColor}20` : 'none',
    }}>
      {/* Module badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {scenario.modules.map(m => (
          <span key={m.label} style={{
            fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em',
            color: clsMap[m.cls], background: clsMap[m.cls] + '18',
            padding: '2px 7px', borderRadius: 4,
          }}>{m.label}</span>
        ))}
        {active && (
          <span style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: '.07em',
            color: accentColor, background: accentColor + '15',
            border: `1px solid ${accentColor}40`,
            padding: '2px 7px', borderRadius: 4,
          }}>● ACTIVE</span>
        )}
        {flash === 'err' && (
          <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--crit)' }}>✕ Error</span>
        )}
      </div>

      {/* Title + desc */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--txt)', marginBottom: 4 }}>
          {scenario.title}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--txt2)', lineHeight: 1.55 }}>
          {scenario.desc}
        </div>
      </div>

      {/* Trigger + Reset buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
        <button
          className="btn p"
          style={{ flex: 1, fontSize: 12 }}
          disabled={!!loading}
          onClick={() => call(scenario.triggerEndpoint, 'trigger')}
        >
          {loading === 'trigger' ? '⟳ …' : '▶ Trigger'}
        </button>
        <button
          className="btn"
          style={{ flex: 1, fontSize: 12 }}
          disabled={!!loading}
          onClick={() => call(scenario.resetEndpoint, 'reset')}
        >
          {loading === 'reset' ? '⟳ …' : '↺ Reset'}
        </button>
      </div>
    </div>
  )
}

// ── General tab (existing settings content) ───────────────────────
function GeneralTab() {
  return (
    <>
      <div className="g22" style={{ marginBottom: 18 }}>
        {[
          { icon: '🔌', title: 'Connectors',      sub: '12 connected',         desc: 'API connectors to cloud apps and vendors — credentials KMS-encrypted' },
          { icon: '🤖', title: 'Agent Management', sub: '847 agents active',    desc: 'Endpoint agent configuration, updates, and platform coverage' },
          { icon: '🔔', title: 'Notifications',    sub: '4 channels configured', desc: 'Alert routing: PagerDuty · Slack · Email · SMS — per severity policy' },
          { icon: '🔗', title: 'API & Integrations', sub: '3 active API keys',  desc: 'Webhooks, ServiceNow, Zapier — rate limited per tenant' },
        ].map(s => (
          <div key={s.title} className="setc">
            <div className="sh">
              <div className="si">{s.icon}</div>
              <div><div className="st">{s.title}</div><div className="ss">{s.sub}</div></div>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--txt2)' }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-h"><h3>Connector health</h3><button className="btn p">+ Add</button></div>
          <div className="card-b">
            {CONNECTORS.map(c => (
              <div key={c} className="sr">
                <div className="sm"><div className="sn">{c}</div><div className="sd">Connected · OAuth 2.0</div></div>
                <span className="b ok"><i />HEALTHY</span>
              </div>
            ))}
            <div className="sr">
              <div className="sm"><div className="sn">Zendesk</div><div className="sd">Disconnected — token expired</div></div>
              <span className="b cr" style={{ marginRight: 8 }}><i />ERROR</span>
              <button className="btn p">Reconnect</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="card-h"><h3>Platform settings</h3></div>
            <div className="card-b">
              {[
                { label: 'Auto-remediate P2/P3 findings',    desc: 'Cloud CSPM auto-fix for low-severity',             on: true  },
                { label: 'MSSP cross-client threat intel',   desc: 'Share anonymised IoC signals',                     on: true  },
                { label: 'Autonomous AI actions (>0.85)',    desc: 'COACH auto-execute on high confidence',            on: false },
                { label: 'Browser DLP monitoring',           desc: 'Input scanning in AI tools (DPO approval required)', on: false },
                { label: 'Weekly posture digest email',      desc: 'Sent every Monday 08:00',                          on: true  },
              ].map(s => (
                <div key={s.label} className="sr">
                  <div className="sm"><div className="sn">{s.label}</div><div className="sd">{s.desc}</div></div>
                  <Toggle defaultOn={s.on} />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-h"><h3>Team</h3><button className="btn p">+ Invite</button></div>
            <div className="card-b">
              {TEAM.map(u => (
                <div key={u.name} className="sr">
                  <div className="av" style={{ width: 28, height: 28, fontSize: 10, marginRight: 2 }}>{u.initials}</div>
                  <div className="sm" style={{ marginLeft: 8 }}><div className="sn">{u.name}</div><div className="sd">{u.role}</div></div>
                  <span className={`role r-${u.roleKey}`}>{u.roleKey}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Reset All card ────────────────────────────────────────────────
function ResetAllCard() {
  const [loading, setLoading] = useState(false)
  const [flash,   setFlash]   = useState(null) // 'ok' | 'err'

  async function handleResetAll() {
    setLoading(true)
    try {
      const r = await fetch(`${API_BASE}/api/sim/reset-all`, { method: 'POST' })
      if (!r.ok) throw new Error()
      setFlash('ok')
    } catch {
      setFlash('err')
    } finally {
      setLoading(false)
      setTimeout(() => setFlash(null), 2500)
    }
  }

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderLeft: '4px solid #64748b',
      borderRadius: 10, padding: '14px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      boxShadow: '0 2px 10px rgba(0,0,0,.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          background: '#64748b18', border: '1px solid #64748b30',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
        }}>↺</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--txt)', marginBottom: 3 }}>
            Reset All Simulations
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--txt2)' }}>
            Calls <code style={{ fontSize: 11, background: 'var(--bg3)', padding: '1px 5px', borderRadius: 4 }}>POST /api/sim/reset-all</code> — reverts every active scenario to baseline state instantly.
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {flash === 'ok' && (
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ok)' }}>✓ All reset</span>
        )}
        {flash === 'err' && (
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--crit)' }}>✕ Error</span>
        )}
        <button
          className="btn d"
          style={{ fontSize: 12, padding: '6px 18px', opacity: loading ? .6 : 1 }}
          disabled={loading}
          onClick={handleResetAll}
        >
          {loading ? '⟳ Resetting…' : '↺ Reset All'}
        </button>
      </div>
    </div>
  )
}

// ── Simulation tab ────────────────────────────────────────────────
function SimulationTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Info banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(99,102,241,.07)', border: '1px solid rgba(99,102,241,.2)',
        borderLeft: '4px solid var(--purple)', borderRadius: 8, padding: '12px 16px',
      }}>
        <span style={{ fontSize: 18 }}>⚡</span>
        <div style={{ fontSize: 12.5, color: 'var(--txt2)', lineHeight: 1.5 }}>
          Each trigger button calls the backend REST API and <b>toggles</b> the scenario on/off.
          The relevant module's GUI updates automatically within 4 seconds via polling.
          All state is in-memory — restarting the server resets everything to baseline.
        </div>
      </div>

      {/* Reset All */}
      <ResetAllCard />

      {/* Scenario cards — 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {SCENARIOS.map(s => <SimCard key={s.id} scenario={s} />)}
      </div>
    </div>
  )
}

// ── Main Settings page ────────────────────────────────────────────
export default function Settings() {
  const [tab, setTab] = useState('General')
  const simEnabled = new URLSearchParams(window.location.search).get('sim') === '1'
  const TABS = simEnabled ? ['General', 'Simulation'] : ['General']

  return (
    <>
      {/* Tab bar */}
      <div className="seg" style={{ marginBottom: 20, alignSelf: 'flex-start' }}>
        {TABS.map(t => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'General'    && <GeneralTab />}
      {tab === 'Simulation' && <SimulationTab />}
    </>
  )
}
