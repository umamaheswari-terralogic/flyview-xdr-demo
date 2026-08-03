import { useState } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { devicesSeed } from './_prototypeShared.jsx'

// Agent inventory derived from the endpoint fleet — one MDM agent per enrolled device.
// Moved here from the Settings module (was Settings > Agent Management tab).
const AGENTS_SEED = devicesSeed.map(d => ({
  id: `AGT-${d.serial}`,
  deviceName: d.name,
  deviceId: d.id,
  os: d.os,
  version: d.mdmState.agentVersion,
  installedAt: d.mdmState.enrolledAt,
  lastCheckInAt: d.mdmState.lastCheckInAt,
  installed: d.mdmState.mdmProfileInstalled,
  online: d.status !== 'NON-COMPLIANT' || d.lastSeen === 'Just now',
  enabled: true,
}))

function AgentDetail({ agent, onClose, onToggle }) {
  if (!agent) return null
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <StatusBadge status={agent.enabled ? 'ACTIVE' : 'OFFLINE'} cls={agent.enabled ? 'ok' : 'ne'} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--txt)' }}>{agent.deviceName}</div>
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--txt3)', marginTop: 3 }}>{agent.id}</div>
          </div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        <div className="drawer-body">
          <div>
            <div className="drawer-section-title">Agent metadata</div>
            <div className="drawer-meta-grid">
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Agent ID</div>
                <div className="drawer-meta-value mono">{agent.id}</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Agent version</div>
                <div className="drawer-meta-value">{agent.version}</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Platform</div>
                <div className="drawer-meta-value">{agent.os}</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Installed</div>
                <div className="drawer-meta-value" style={{ color: agent.installed ? 'var(--ok)' : 'var(--crit)' }}>
                  {agent.installed ? 'Yes' : 'No'}
                </div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Installed on</div>
                <div className="drawer-meta-value">{agent.installedAt}</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Last check-in</div>
                <div className="drawer-meta-value">{agent.lastCheckInAt}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="drawer-section-title">Current status</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <StatusBadge status={agent.online ? 'ONLINE' : 'OFFLINE'} cls={agent.online ? 'ok' : 'cr'} />
              <StatusBadge status={agent.enabled ? 'ACTIVE' : 'DISABLED'} cls={agent.enabled ? 'ok' : 'ne'} />
            </div>
          </div>

          <div>
            <div className="drawer-section-title">Control</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, color: 'var(--txt2)' }}>
                {agent.enabled ? 'Agent is currently enabled and reporting.' : 'Agent is disabled — no telemetry will be collected.'}
              </div>
              <button
                className={`btn ${agent.enabled ? 'd' : 'p'}`}
                onClick={() => onToggle(agent.id)}
              >
                {agent.enabled ? 'Disable agent' : 'Enable agent'}
              </button>
            </div>
          </div>
        </div>

        <div className="drawer-actions">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  )
}

export default function AgentManagement() {
  const [agents, setAgents] = useState(AGENTS_SEED)
  const [selected, setSelected] = useState(null)

  function toggleAgent(id) {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a))
    setSelected(prev => (prev && prev.id === id) ? { ...prev, enabled: !prev.enabled } : prev)
  }

  const activeCount = agents.filter(a => a.enabled).length

  return (
    <>
      <div className="card">
        <div className="card-h">
          <h3>Agent Management <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>{activeCount} of {agents.length} agents enabled</span></h3>
        </div>
        <table>
          <thead>
            <tr>{['Agent ID', 'Device', 'Platform', 'Installed', 'Status', 'Enabled', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {agents.map(a => (
              <tr key={a.id}>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.id}</td>
                <td className="pr">{a.deviceName}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{a.os}</td>
                <td style={{ color: a.installed ? 'var(--ok)' : 'var(--crit)', fontSize: 12, fontWeight: 600 }}>{a.installed ? 'Yes' : 'No'}</td>
                <td><StatusBadge status={a.online ? 'ONLINE' : 'OFFLINE'} cls={a.online ? 'ok' : 'cr'} /></td>
                <td><StatusBadge status={a.enabled ? 'ACTIVE' : 'DISABLED'} cls={a.enabled ? 'ok' : 'ne'} /></td>
                <td>
                  <div className="brow">
                    <button className={`btn ${a.enabled ? 'd' : 'p'}`} onClick={() => toggleAgent(a.id)}>
                      {a.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button className="btn" onClick={() => setSelected(a)}>View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <AgentDetail agent={selected} onClose={() => setSelected(null)} onToggle={toggleAgent} />
      )}
    </>
  )
}
