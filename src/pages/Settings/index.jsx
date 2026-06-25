import { useState } from 'react'

const CONNECTORS = [
  'Google Workspace', 'Microsoft 365', 'Slack', 'GitHub',
  'Palo Alto Panorama', 'AWS Config', 'Azure Resource Graph',
]

const TEAM = [
  { initials: 'AM', name: 'Ahmed M.', role: 'Security Admin', roleKey: 'admin' },
  { initials: 'SK', name: 'Sarah Kim', role: 'Security Analyst', roleKey: 'analyst' },
  { initials: 'JD', name: 'John Doe', role: 'Viewer', roleKey: 'viewer' },
  { initials: 'PV', name: 'Priya V.', role: 'Security Analyst', roleKey: 'analyst' },
]

function Toggle({ defaultOn = false }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button className={`tog ${on ? 'on' : ''}`} onClick={() => setOn(p => !p)} />
  )
}

export default function Settings() {
  return (
    <>
      <div className="g22" style={{ marginBottom: 18 }}>
        {[
          { icon: '🔌', title: 'Connectors', sub: '12 connected', desc: 'API connectors to cloud apps and vendors — credentials KMS-encrypted' },
          { icon: '🤖', title: 'Agent Management', sub: '847 agents active', desc: 'Endpoint agent configuration, updates, and platform coverage' },
          { icon: '🔔', title: 'Notifications', sub: '4 channels configured', desc: 'Alert routing: PagerDuty · Slack · Email · SMS — per severity policy' },
          { icon: '🔗', title: 'API & Integrations', sub: '3 active API keys', desc: 'Webhooks, ServiceNow, Zapier — rate limited per tenant' },
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
        {/* Connector health */}
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
          {/* Platform settings */}
          <div className="card">
            <div className="card-h"><h3>Platform settings</h3></div>
            <div className="card-b">
              {[
                { label: 'Auto-remediate P2/P3 findings', desc: 'Cloud CSPM auto-fix for low-severity', on: true },
                { label: 'MSSP cross-client threat intel', desc: 'Share anonymised IoC signals', on: true },
                { label: 'Autonomous AI actions (>0.85)', desc: 'COACH auto-execute on high confidence', on: false },
                { label: 'Browser DLP monitoring', desc: 'Input scanning in AI tools (DPO approval required)', on: false },
                { label: 'Weekly posture digest email', desc: 'Sent every Monday 08:00', on: true },
              ].map(s => (
                <div key={s.label} className="sr">
                  <div className="sm"><div className="sn">{s.label}</div><div className="sd">{s.desc}</div></div>
                  <Toggle defaultOn={s.on} />
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
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
