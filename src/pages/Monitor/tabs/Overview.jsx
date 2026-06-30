import { useState, useEffect, useRef } from 'react'
import MetricCard from '../../../components/MetricCard.jsx'
import AlertDrawer from '../../../components/AlertDrawer.jsx'
import { MonitorService } from '../../../services/MonitorService.js'
import { Icons } from '../../../shared/icons.jsx'
import { API_BASE } from '../../../config.js'

const API     = `${API_BASE}/api/monitor`
const POLL_MS = 4000

function RowBar({ label, pct, color, val }) {
  return (
    <div className="row">
      <span className="rn">{label}</span>
      <div className="pb" style={{ flex: 1 }}><i style={{ width: `${pct}%`, background: color }} /></div>
      <span className="rv" style={{ color }}>{val}</span>
    </div>
  )
}

function buildBecDrawer(alert) {
  if (!alert?.detail) return null
  const d = alert.detail
  return {
    title: 'Suspicious Process Spawn — Possible Phishing / BEC',
    subtitle: `${alert.device} · ${alert.user}`,
    severity: 'CRITICAL', sevCls: 'cr',
    status: 'FIRING', statusCls: 'cr',
    sections: [
      {
        label: 'How FlyView detected this',
        steps: d.detectionChain ?? [
          { signal: d.primarySignal?.label ?? 'Alert trigger', detail: d.primarySignal?.value ?? d.processChain },
          { signal: d.supportingSignal?.label ?? 'Network telemetry', detail: d.supportingSignal?.value ?? d.destination },
        ],
      },
      {
        label: 'Primary signal (what fired the alert)',
        desc: d.primarySignal?.value,
        items: [
          { key: 'Why this matters', value: d.primarySignal?.why ?? 'A browser spawning a shell is almost never legitimate.', wide: true },
        ],
      },
      {
        label: 'Correlated network activity',
        items: [
          { key: 'Connection (SNI)', value: d.supportingSignal?.value ?? d.destination, mono: true, color: 'var(--crit)', wide: true },
          { key: 'Note', value: d.supportingSignal?.why ?? 'Seen via OS-level TLS SNI telemetry. User may have been redirected there without knowing.', wide: true },
        ],
      },
      {
        label: 'Process & network details',
        items: [
          { key: 'Process chain', value: d.processChain, mono: true, color: 'var(--crit)' },
          { key: 'Destination', value: d.destination, mono: true, color: 'var(--crit)' },
          { key: 'Action', value: d.action ?? 'Browser spawned shell process' },
          { key: 'Device', value: alert.device },
          { key: 'User', value: alert.user },
        ],
      },
    ],
    tags: d.technique?.split(' / ') ?? ['T1566.002 – Spearphishing Link'],
    analystNote: d.analystNote ?? 'Source of the browser session (Gmail, web app, etc.) is not visible to the endpoint agent. Check Google Workspace alert logs or email gateway for the originating email.',
    actions: [{ label: 'Isolate device', danger: true }],
  }
}

export default function MonitorOverview() {
  const [metrics, setMetrics]             = useState(null)
  const [alerts, setAlerts]               = useState([])
  const [fleetHealth, setFleetHealth]     = useState([])
  const [scriptCatalog, setScriptCatalog] = useState([])
  const [patchGaps, setPatchGaps]         = useState([])
  const [simTriggered, setSimTriggered]   = useState(false)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const pollRef = useRef(null)

  async function fetchAlerts() {
    try {
      const r = await fetch(API)
      if (!r.ok) throw new Error()
      const data = await r.json()
      setAlerts(data.alerts)
      setSimTriggered(data.simTriggered)
    } catch {
      const a = await MonitorService.getAlerts()
      setAlerts(a)
    }
  }

  useEffect(() => {
    Promise.all([
      MonitorService.getMetrics(),
      MonitorService.getFleetHealth(),
      MonitorService.getScriptCatalog(),
      MonitorService.getPatchGaps(),
      fetchAlerts(),
    ]).then(([m, fh, sc, pg]) => {
      setMetrics(m); setFleetHealth(fh); setScriptCatalog(sc); setPatchGaps(pg)
    })

    pollRef.current = setInterval(fetchAlerts, POLL_MS)
    return () => clearInterval(pollRef.current)
  }, [])

  if (!metrics) return null

  const becAlert    = alerts.find(a => a.sim)
  const activeCount = simTriggered
    ? String(parseInt(metrics.activeAlerts.num) + 1)
    : metrics.activeAlerts.num

  const drawerAlert = selectedAlert ? buildBecDrawer(selectedAlert) : null

  return (
    <>
      {/* Single-line banner */}
      {simTriggered && becAlert && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.25)',
          borderLeft: '4px solid var(--crit)', borderRadius: 8, padding: '10px 16px', marginBottom: 12,
        }}>
          <span style={{ fontSize: 16 }}>🎣</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--crit)', flex: 1 }}>
            Suspicious process spawn — <span className="mono">chrome.exe → cmd.exe</span> on <b>{becAlert.device}</b> ({becAlert.user}). Possible phishing / BEC.
          </span>
          <span className="b cr"><i />CRITICAL</span>
          <button className="btn" style={{ marginLeft: 4 }} onClick={() => setSelectedAlert(becAlert)}>View</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="kg k4">
        <MetricCard cls={metrics.fleet.cls}       num={metrics.fleet.num}       desc={metrics.fleet.desc}       label={metrics.fleet.label}       foot={metrics.fleet.foot}       icon={Icons.activity} />
        <MetricCard cls="cr"                       num={activeCount}             desc={metrics.activeAlerts.desc} label={metrics.activeAlerts.label} foot={metrics.activeAlerts.foot} icon={Icons.alert} />
        <MetricCard cls={metrics.autoFixed.cls}   num={metrics.autoFixed.num}   desc={metrics.autoFixed.desc}   label={metrics.autoFixed.label}   foot={metrics.autoFixed.foot}   icon={Icons.check} />
        <MetricCard cls={metrics.epssPatches.cls} num={metrics.epssPatches.num} desc={metrics.epssPatches.desc} label={metrics.epssPatches.label} foot={metrics.epssPatches.foot} icon={Icons.shield} />
      </div>

      {/* Active Alerts table */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h"><h3>Active Alerts</h3><button className="btn p">+ Alert rule</button></div>
        <table>
          <thead>
            <tr>{['Device', 'Type', 'Severity', 'Metric', 'Rule', 'Time', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {alerts.map(a => (
              <tr
                key={a.id}
                style={a.sim && simTriggered ? { animation: 'rowFlash 1.2s ease', background: 'rgba(239,68,68,.04)' } : {}}
              >
                <td className="pr">
                  {a.device}
                  {a.user && <div style={{ fontSize: 10.5, color: 'var(--txt3)', marginTop: 1, fontFamily: 'JetBrains Mono, monospace' }}>{a.user}</div>}
                </td>
                <td>
                  {a.sim
                    ? <span style={{ color: 'var(--crit)', fontWeight: 600 }}>{a.type}</span>
                    : a.type}
                </td>
                <td><span className={`b ${a.sevCls}`}><i />{a.severity}</span></td>
                <td className="mono">{a.metric}</td>
                <td><span className="ch">{a.rule}</span></td>
                <td className="mono">{a.time}</td>
                <td>
                  <div className="brow">
                    {a.sim
                      ? <button className="btn d" onClick={() => setSelectedAlert(a)}>View</button>
                      : <><button className="btn p">Run fix</button><button className="btn" onClick={() => setSelectedAlert(a)}>View</button></>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom widgets */}
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
              <button className={`btn${s.cls === 'cr' ? ' p' : ''}`} style={{ marginLeft: 8 }}>Run</button>
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

      {/* Alert detail drawer */}
      {selectedAlert && drawerAlert && (
        <AlertDrawer alert={drawerAlert} onClose={() => setSelectedAlert(null)} />
      )}
    </>
  )
}
