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

// ── Simulation triggers ───────────────────────────────────────────
const SCENARIOS = [
  {
    module:   'Monitor',
    modulecls: 'cr',
    id:       'monitor-bec',
    title:    'BEC / Phishing — Suspicious process spawn',
    desc:     'Simulates a user clicking a spearphishing link in Gmail. chrome.exe spawns cmd.exe → powershell.exe. FlyView detects via process tree + SNI telemetry.',
    endpoint: '/api/monitor/trigger',
    effect:   'CRITICAL alert appears in Monitor → Overview. Red banner + flashing row. View drawer shows detection chain.',
  },
  {
    module:   'Identity',
    modulecls: 'cr',
    id:       'identity-vyshnavi',
    title:    'Impossible Travel — Vyshnavi T.',
    desc:     'Simulates a login from Hyderabad (09:41) followed by Singapore (09:59) — 18 minutes apart. MFA challenge skipped on second login.',
    endpoint: '/api/identity/vyshnavi.t%40terralogic.com/trigger',
    effect:   'Risk jumps to CRITICAL (94). Status → UNDER REVIEW. MFA shows BYPASSED. Orange banner in Identity → Overview.',
  },
  {
    module:   'Identity',
    modulecls: 'hi',
    id:       'identity-shabbeer',
    title:    'Insider Threat — Shabbeer (PIP employee)',
    desc:     'Simulates a PIP employee bulk-downloading 4.2 GB from S3 (corp-data-prod) at 02:47 AM via 4,200 GetObject API calls.',
    endpoint: '/api/identity/shabbeer%40terralogic.com/trigger',
    effect:   'Risk jumps to HIGH (76). Status → MONITORING. Row floats to top of Identity table. Correlated finding appears in Cloud module automatically.',
  },
  {
    module:   'Devices',
    modulecls: 'hi',
    id:       'devices-compliance',
    title:    'Non-Compliance — LT-VyshnaviT-3941',
    desc:     'Simulates Vyshnavi\'s device becoming non-compliant (policy violation detected by the endpoint agent).',
    endpoint: '/api/devices/LT-VyshnaviT-3941/trigger',
    effect:   'Device status toggles between COMPLIANT and NON-COMPLIANT in the Devices module.',
  },
  {
    module:   'Devices',
    modulecls: 'cr',
    id:       'devices-blockedapp',
    title:    'Blocked Application — LT-VyshnaviT-3941',
    desc:     'Simulates a blocked/unauthorised application execution attempt detected on Vyshnavi\'s device.',
    endpoint: '/api/devices/LT-VyshnaviT-3941/trigger/blockedapp',
    effect:   'Blocked app event surfaces on the device record in the Devices module.',
  },
]

function Toggle({ defaultOn = false }) {
  const [on, setOn] = useState(defaultOn)
  return <button className={`tog ${on ? 'on' : ''}`} onClick={() => setOn(p => !p)} />
}

// Individual simulation trigger card
function SimCard({ scenario }) {
  const [status, setStatus]   = useState('idle')   // idle | loading | triggered | error
  const [triggered, setTriggered] = useState(false)

  async function handleTrigger() {
    setStatus('loading')
    try {
      const r = await fetch(`${API_BASE}${scenario.endpoint}`, { method: 'POST' })
      if (!r.ok) throw new Error()
      setTriggered(t => !t)
      setStatus(triggered ? 'idle' : 'triggered')
    } catch {
      setStatus('error')
      setTimeout(() => setStatus(triggered ? 'triggered' : 'idle'), 3000)
    }
  }

  const clsMap = { cr: 'var(--crit)', hi: 'var(--high)', me: 'var(--med)', ok: 'var(--ok)' }
  const moduleColor = clsMap[scenario.modulecls] ?? 'var(--txt2)'

  return (
    <div style={{
      background: 'var(--card)',
      border: `1px solid ${triggered ? moduleColor : 'var(--border)'}`,
      borderLeft: `4px solid ${moduleColor}`,
      borderRadius: 10, padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'border-color .3s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em',
              color: moduleColor, background: `${moduleColor}18`, padding: '2px 7px', borderRadius: 4,
            }}>{scenario.module}</span>
            {triggered && (
              <span className={`b ${scenario.moduleclass}`} style={{ fontSize: 10, background: `${moduleColor}18`, color: moduleColor, border: `1px solid ${moduleColor}40`, borderRadius: 4, padding: '2px 7px', fontWeight: 700 }}>
                ACTIVE
              </span>
            )}
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--txt)', marginBottom: 3 }}>{scenario.title}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', lineHeight: 1.55 }}>{scenario.desc}</div>
        </div>
      </div>

      {/* Effect description */}
      <div style={{
        background: 'var(--bg)', borderRadius: 6, padding: '8px 12px',
        fontSize: 11.5, color: 'var(--txt3)', lineHeight: 1.5,
      }}>
        <span style={{ fontWeight: 600, color: 'var(--txt2)' }}>GUI effect: </span>{scenario.effect}
      </div>

      {/* Endpoint + trigger button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <code style={{
          flex: 1, fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--txt3)', background: 'var(--bg)',
          padding: '5px 10px', borderRadius: 5, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>POST {scenario.endpoint}</code>
        <button
          className={`btn${triggered ? '' : ' p'}`}
          style={{
            minWidth: 90, flexShrink: 0,
            ...(triggered ? { borderColor: moduleColor, color: moduleColor } : {}),
          }}
          onClick={handleTrigger}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? '⟳ …'
            : status === 'error'   ? '✕ Error'
            : triggered            ? 'Reset'
            : 'Trigger'}
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

      {/* Scenario cards */}
      {SCENARIOS.map(s => <SimCard key={s.id} scenario={s} />)}
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
