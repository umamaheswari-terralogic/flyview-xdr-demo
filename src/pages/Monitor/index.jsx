import { useOutletContext } from 'react-router-dom'
import MetricCard from '../../components/MetricCard.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { Icons } from '../../shared/icons.jsx'

const ALERTS = [
  { device: 'WEB-PROD-02', type: 'Service stopped', severity: 'HIGH', sevCls: 'hi', metric: 'nginx stopped 15m', rule: 'Service health', time: '5m' },
  { device: 'DB-MASTER-01', type: 'Disk pressure', severity: 'HIGH', sevCls: 'hi', metric: '87% (+1.2%/hr)', rule: 'Disk trend', time: '12m' },
  { device: 'CORP-WIN-088', type: 'CPU spike', severity: 'MEDIUM', sevCls: 'me', metric: 'CPU 94% for 8m', rule: 'CPU threshold', time: '19m' },
  { device: 'CORP-MAC-055', type: 'Agent offline', severity: 'HIGH', sevCls: 'hi', metric: 'No check-in 32m', rule: 'Heartbeat', time: '32m' },
  { device: 'CORP-LAPTOP-007', type: 'Patch missing', severity: 'MEDIUM', sevCls: 'me', metric: 'CVE-2026-1337', rule: 'Vuln policy', time: '1h' },
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

export default function Monitor() {
  return (
    <>
      <div className="kg k4">
        <MetricCard cls="ok" num="847" desc="Online endpoints" label="Fleet" foot="98.2% uptime" icon={Icons.activity} />
        <MetricCard cls="hi" num="5" desc="Firing health alerts" label="Active Alerts" foot="<b>▲ +1</b> this hour" icon={Icons.alert} />
        <MetricCard cls="ok" num="3" desc="Auto-remediated today" label="Auto-fixed" foot="Avg MTTR 4 min" icon={Icons.check} />
        <MetricCard cls="in" num="23" desc="Endpoints missing patch" label="EPSS Patches" foot="CVE-2026-1337" icon={Icons.shield} />
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h"><h3>Active Alerts</h3><button className="btn p">+ Alert rule</button></div>
        <table>
          <thead><tr>{['Device', 'Type', 'Severity', 'Metric', 'Rule', 'Time', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {ALERTS.map(a => (
              <tr key={a.device + a.type}>
                <td className="pr">{a.device}</td>
                <td>{a.type}</td>
                <td><span className={`b ${a.sevCls}`}><i />{a.severity}</span></td>
                <td className="mono">{a.metric}</td>
                <td><span className="ch">{a.rule}</span></td>
                <td className="mono">{a.time}</td>
                <td><div className="brow"><button className="btn p">Run fix</button><button className="btn">View</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="g3">
        <div className="card"><div className="card-h"><h3>Fleet health</h3></div><div className="card-b">
          <RowBar label="CPU > 90%" pct={35} color="var(--crit)" val="3" />
          <RowBar label="Disk > 85%" pct={59} color="var(--high)" val="5" />
          <RowBar label="Memory > 90%" pct={24} color="var(--med)" val="2" />
          <RowBar label="Offline" pct={12} color="var(--crit)" val="1" />
        </div></div>

        <div className="card"><div className="card-h"><h3>Script catalog</h3></div><div className="card-b">
          {[
            { name: 'Clear temp files', platform: 'macOS + Windows', type: 'disk', cls: 'in' },
            { name: 'Restart service', platform: 'All platforms', type: 'process', cls: 'in' },
            { name: 'Patch CVE-2026-1337', platform: 'Windows only', type: 'security', cls: 'cr' },
            { name: 'Quarantine endpoint', platform: 'All platforms', type: 'security', cls: 'cr' },
          ].map(s => (
            <div key={s.name} className="row">
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div><div style={{ fontSize: 11, color: 'var(--txt3)' }}>{s.platform}</div></div>
              <span className={`b ${s.cls}`}><i />{s.type}</span>
              <button className={`btn ${s.cls === 'cr' ? 'p' : ''}`} style={{ marginLeft: 8 }}>Run</button>
            </div>
          ))}
        </div></div>

        <div className="card"><div className="card-h"><h3>Patch gaps (EPSS)</h3></div><div className="card-b">
          {[
            { cve: 'CVE-2026-1337', epss: '0.81', sev: 'HIGH', devices: 23 },
            { cve: 'CVE-2026-0422', epss: '0.61', sev: 'HIGH', devices: 11 },
            { cve: 'CVE-2025-9981', epss: '0.44', sev: 'MEDIUM', devices: 8 },
          ].map(p => (
            <div key={p.cve} className="row">
              <div style={{ flex: 1 }}><div className="mono" style={{ fontSize: 12 }}>{p.cve}</div><div style={{ fontSize: 11, color: 'var(--txt3)' }}>EPSS {p.epss} · {p.sev}</div></div>
              <span style={{ fontSize: 12 }}>{p.devices} devices</span>
              <button className="btn p" style={{ marginLeft: 8 }}>Deploy</button>
            </div>
          ))}
        </div></div>
      </div>
    </>
  )
}
