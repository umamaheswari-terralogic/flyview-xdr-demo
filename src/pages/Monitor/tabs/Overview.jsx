import { useState, useEffect } from 'react'
import MetricCard from '../../../components/MetricCard.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { MonitorService } from '../../../services/MonitorService.js'
import { Icons } from '../../../shared/icons.jsx'

function RowBar({ label, pct, color, val }) {
  return (
    <div className="row">
      <span className="rn">{label}</span>
      <div className="pb" style={{ flex: 1 }}><i style={{ width: `${pct}%`, background: color }} /></div>
      <span className="rv" style={{ color }}>{val}</span>
    </div>
  )
}

export default function MonitorOverview() {
  const [metrics, setMetrics] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [fleetHealth, setFleetHealth] = useState([])
  const [scriptCatalog, setScriptCatalog] = useState([])
  const [patchGaps, setPatchGaps] = useState([])

  useEffect(() => {
    MonitorService.getMetrics().then(setMetrics)
    MonitorService.getAlerts().then(setAlerts)
    MonitorService.getFleetHealth().then(setFleetHealth)
    MonitorService.getScriptCatalog().then(setScriptCatalog)
    MonitorService.getPatchGaps().then(setPatchGaps)
  }, [])

  if (!metrics) return null

  return (
    <>
      <div className="kg k4">
        <MetricCard cls={metrics.fleet.cls} num={metrics.fleet.num} desc={metrics.fleet.desc} label={metrics.fleet.label} foot={metrics.fleet.foot} icon={Icons.activity} />
        <MetricCard cls={metrics.activeAlerts.cls} num={metrics.activeAlerts.num} desc={metrics.activeAlerts.desc} label={metrics.activeAlerts.label} foot={metrics.activeAlerts.foot} icon={Icons.alert} />
        <MetricCard cls={metrics.autoFixed.cls} num={metrics.autoFixed.num} desc={metrics.autoFixed.desc} label={metrics.autoFixed.label} foot={metrics.autoFixed.foot} icon={Icons.check} />
        <MetricCard cls={metrics.epssPatches.cls} num={metrics.epssPatches.num} desc={metrics.epssPatches.desc} label={metrics.epssPatches.label} foot={metrics.epssPatches.foot} icon={Icons.shield} />
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h"><h3>Active Alerts</h3><button className="btn p">+ Alert rule</button></div>
        <table>
          <thead><tr>{['Device', 'Type', 'Severity', 'Metric', 'Rule', 'Time', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {alerts.map(a => (
              <tr key={a.id}>
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
          {fleetHealth.map(r => <RowBar key={r.label} {...r} />)}
        </div></div>

        <div className="card"><div className="card-h"><h3>Script catalog</h3></div><div className="card-b">
          {scriptCatalog.map(s => (
            <div key={s.name} className="row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{s.platform}</div>
              </div>
              <span className={`b ${s.cls}`}><i />{s.type}</span>
              <button className={`btn ${s.cls === 'cr' ? 'p' : ''}`} style={{ marginLeft: 8 }}>Run</button>
            </div>
          ))}
        </div></div>

        <div className="card"><div className="card-h"><h3>Patch gaps (EPSS)</h3></div><div className="card-b">
          {patchGaps.map(p => (
            <div key={p.cve} className="row">
              <div style={{ flex: 1 }}>
                <div className="mono" style={{ fontSize: 12 }}>{p.cve}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>EPSS {p.epss} · {p.sev}</div>
              </div>
              <span style={{ fontSize: 12 }}>{p.devices} devices</span>
              <button className="btn p" style={{ marginLeft: 8 }}>Deploy</button>
            </div>
          ))}
        </div></div>
      </div>
    </>
  )
}
