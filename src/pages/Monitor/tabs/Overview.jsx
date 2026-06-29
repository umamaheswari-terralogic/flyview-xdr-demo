import { useState, useEffect, useRef } from 'react'
import MetricCard from '../../../components/MetricCard.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { MonitorService } from '../../../services/MonitorService.js'
import { Icons } from '../../../shared/icons.jsx'

const API     = 'http://localhost:3001/api/monitor'
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

// Inline detail card shown under the BEC alert row
function BecDetail({ detail }) {
  return (
    <tr style={{ background: 'rgba(239,68,68,.03)' }}>
      <td colSpan={7} style={{ padding: '0 14px 14px' }}>
        <div style={{
          background: 'rgba(239,68,68,.06)',
          border: '1px solid rgba(239,68,68,.22)',
          borderLeft: '3px solid var(--crit)',
          borderRadius: 8, padding: '12px 14px',
          fontSize: 11.5, display: 'flex', flexDirection: 'column', gap: 10,
        }}>

          {/* Primary trigger — what actually fired the alert */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--crit)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>
              Alert trigger (primary signal)
            </div>
            <div style={{ background: 'rgba(239,68,68,.1)', borderRadius: 6, padding: '8px 12px' }}>
              <div className="mono" style={{ color: 'var(--crit)', fontWeight: 700, fontSize: 12.5, marginBottom: 2 }}>{detail.primarySignal?.value}</div>
              <div style={{ color: 'var(--txt2)', fontSize: 11 }}>{detail.primarySignal?.why}</div>
            </div>
          </div>

          {/* Supporting signal — auto-correlated */}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>
              Correlated network activity (supporting signal)
            </div>
            <div style={{ background: 'rgba(249,115,22,.08)', borderRadius: 6, padding: '8px 12px' }}>
              <div className="mono" style={{ color: 'var(--orange)', fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{detail.supportingSignal?.value}</div>
              <div style={{ color: 'var(--txt2)', fontSize: 11 }}>{detail.supportingSignal?.why}</div>
            </div>
          </div>

          {/* Process chain + MITRE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--txt3)', fontSize: 11 }}>Full process chain: </span>
              <span className="mono" style={{ color: 'var(--crit)', fontWeight: 600 }}>{detail.processChain}</span>
            </div>
            {detail.technique?.split(' / ').map(t => (
              <span key={t} style={{ background: 'var(--purpleL)', color: 'var(--purple)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, fontWeight: 600, padding: '2px 7px', borderRadius: 5 }}>{t}</span>
            ))}
          </div>

          {/* Analyst note — what FlyView cannot tell you */}
          <div style={{
            background: 'rgba(148,163,184,.07)', border: '1px solid rgba(148,163,184,.15)',
            borderRadius: 6, padding: '7px 11px', fontSize: 11, color: 'var(--txt3)',
            display: 'flex', gap: 7, alignItems: 'flex-start',
          }}>
            <span style={{ flexShrink: 0 }}>ⓘ</span>
            <span><b>Analyst action required:</b> {detail.analystNote}</span>
          </div>

        </div>
      </td>
    </tr>
  )
}

export default function MonitorOverview() {
  const [metrics, setMetrics]           = useState(null)
  const [alerts, setAlerts]             = useState([])
  const [fleetHealth, setFleetHealth]   = useState([])
  const [scriptCatalog, setScriptCatalog] = useState([])
  const [patchGaps, setPatchGaps]       = useState([])
  const [simTriggered, setSimTriggered] = useState(false)
  const pollRef = useRef(null)

  async function fetchAlerts() {
    try {
      const r = await fetch(API)
      if (!r.ok) throw new Error()
      const data = await r.json()
      setAlerts(data.alerts)
      setSimTriggered(data.simTriggered)
    } catch {
      const alerts = await MonitorService.getAlerts()
      setAlerts(alerts)
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
      setMetrics(m)
      setFleetHealth(fh)
      setScriptCatalog(sc)
      setPatchGaps(pg)
    })

    pollRef.current = setInterval(fetchAlerts, POLL_MS)
    return () => clearInterval(pollRef.current)
  }, [])

  if (!metrics) return null

  const becAlert     = alerts.find(a => a.sim)
  const activeCount  = simTriggered
    ? String(parseInt(metrics.activeAlerts.num) + 1)
    : metrics.activeAlerts.num

  return (
    <>
      {/* BEC incident banner */}
      {simTriggered && becAlert && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          background: 'rgba(239,68,68,.07)',
          border: '1px solid rgba(239,68,68,.3)',
          borderLeft: '4px solid var(--crit)',
          borderRadius: 10, padding: '14px 18px', marginBottom: 18,
        }}>
          <div style={{ fontSize: 22, marginTop: 1 }}>🎣</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--crit)', marginBottom: 3 }}>
              Suspicious process spawn — chrome.exe launched a shell on {becAlert.device}
            </div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', lineHeight: 1.5 }}>
              <b>vyshnavi.thatikonda@terralogic.com</b> — <span className="mono">chrome.exe</span> spawned{' '}
              <span className="mono" style={{ color: 'var(--crit)' }}>cmd.exe → powershell.exe</span> with encoded arguments.
              OS-level network telemetry (SNI) shows chrome.exe had an open socket to{' '}
              <span className="mono" style={{ color: 'var(--crit)' }}>hr-portal-secure[.]ru:443</span> at the time of spawn —
              the user may have been redirected there without knowing.
              Browser-spawned shells are almost never legitimate — isolate the endpoint immediately.
            </div>
          </div>
          <span className="b cr" style={{ marginTop: 2, flexShrink: 0 }}><i />CRITICAL</span>
        </div>
      )}

      {/* KPI Cards — active alerts count is live */}
      <div className="kg k4">
        <MetricCard cls={metrics.fleet.cls}        num={metrics.fleet.num}        desc={metrics.fleet.desc}        label={metrics.fleet.label}        foot={metrics.fleet.foot}        icon={Icons.activity} />
        <MetricCard cls="cr"                        num={activeCount}              desc={metrics.activeAlerts.desc} label={metrics.activeAlerts.label} foot={metrics.activeAlerts.foot} icon={Icons.alert} />
        <MetricCard cls={metrics.autoFixed.cls}    num={metrics.autoFixed.num}    desc={metrics.autoFixed.desc}    label={metrics.autoFixed.label}    foot={metrics.autoFixed.foot}    icon={Icons.check} />
        <MetricCard cls={metrics.epssPatches.cls}  num={metrics.epssPatches.num}  desc={metrics.epssPatches.desc}  label={metrics.epssPatches.label}  foot={metrics.epssPatches.foot}  icon={Icons.shield} />
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
              <>
                <tr
                  key={a.id}
                  style={a.sim && simTriggered ? { animation: 'rowFlash 1.2s ease', background: 'rgba(239,68,68,.04)' } : {}}
                >
                  <td className="pr">
                    {a.device}
                    {a.user && (
                      <div style={{ fontSize: 10.5, color: 'var(--txt3)', marginTop: 1, fontFamily: 'JetBrains Mono, monospace' }}>{a.user}</div>
                    )}
                  </td>
                  <td>
                    {a.sim
                      ? <span style={{ color: 'var(--crit)', fontWeight: 600 }}>{a.type}</span>
                      : a.type
                    }
                  </td>
                  <td><span className={`b ${a.sevCls}`}><i />{a.severity}</span></td>
                  <td className="mono">{a.metric}</td>
                  <td><span className="ch">{a.rule}</span></td>
                  <td className="mono">{a.time}</td>
                  <td>
                    <div className="brow">
                      {a.sim
                        ? <>
                            <button className="btn d">Isolate device</button>
                            <button className="btn">View</button>
                          </>
                        : <>
                            <button className="btn p">Run fix</button>
                            <button className="btn">View</button>
                          </>
                      }
                    </div>
                  </td>
                </tr>
                {/* Inline BEC detail row */}
                {a.sim && simTriggered && a.detail && (
                  <BecDetail key={`${a.id}-detail`} detail={a.detail} />
                )}
              </>
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
