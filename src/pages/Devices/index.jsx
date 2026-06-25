import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import MetricCard from '../../components/MetricCard.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { DeviceService } from '../../services/DeviceService.js'
import { Icons } from '../../shared/icons.jsx'

const SIM_DELAY = 10000

function RowBar({ label, pct, color, val }) {
  return (
    <div className="row">
      <span className="rn">{label}</span>
      <div className="pb" style={{ flex: 1 }}><i style={{ width: `${pct}%`, background: color }} /></div>
      <span className="rv" style={{ color }}>{val}</span>
    </div>
  )
}

function SimToast({ device, onDismiss }) {
  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      background: '#1e1e2e', border: '1px solid var(--crit)',
      borderLeft: '4px solid var(--crit)',
      borderRadius: 10, padding: '14px 18px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      minWidth: 320, maxWidth: 380,
      animation: 'slideInRight 0.35s cubic-bezier(.16,1,.3,1)',
      color: '#fff'
    }}>
      <div style={{ fontSize: 20, marginTop: 1 }}>⚠</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>Compliance violation detected</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
          <span style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--crit)', fontWeight: 600 }}>{device.name}</span>
          {' '}— {device.simEvent.failingCheck}
        </div>
        <div style={{ fontSize: 11, opacity: 0.6 }}>Status changed · COMPLIANT → NON-COMPLIANT</div>
      </div>
      <button onClick={onDismiss} style={{
        background: 'none', border: 'none', color: '#fff', opacity: 0.5,
        cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0, marginTop: 2
      }}>✕</button>
    </div>
  )
}

export default function Devices() {
  const { activeTab } = useOutletContext()

  const [metrics, setMetrics] = useState(null)
  const [inventory, setInventory] = useState(null)
  const [platformSplit, setPlatformSplit] = useState([])
  const [failingChecks, setFailingChecks] = useState([])
  const [apnsCert, setApnsCert] = useState(null)

  const [eventFired, setEventFired] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    DeviceService.getMetrics().then(setMetrics)
    DeviceService.getInventory().then(setInventory)
    DeviceService.getPlatformSplit().then(setPlatformSplit)
    DeviceService.getFailingChecks().then(setFailingChecks)
    DeviceService.getApnsCert().then(setApnsCert)
  }, [])

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setEventFired(true)
      setToastVisible(true)
    }, SIM_DELAY)
    return () => clearTimeout(timerRef.current)
  }, [])

  function replay() {
    setEventFired(false)
    setToastVisible(false)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setEventFired(true)
      setToastVisible(true)
    }, SIM_DELAY)
  }

  if (!metrics || !inventory || !apnsCert) return null

  const simDevice = inventory.devices.find(d => d.sim)

  const displayDevices = inventory.devices.map(d =>
    d.sim && eventFired ? { ...d, ...d.simEvent } : d
  )

  const nonCompliantNum = eventFired
    ? String(parseInt(metrics.nonCompliant.num) + 1)
    : metrics.nonCompliant.num

  const displayFailingChecks = eventFired
    ? [...failingChecks, { label: 'Antivirus', pct: 8, color: 'var(--crit)', val: '1' }]
    : failingChecks

  return (
    <>
      {toastVisible && simDevice && (
        <SimToast device={simDevice} onDismiss={() => setToastVisible(false)} />
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="btn" onClick={replay} style={{ fontSize: 11, gap: 6, display: 'flex', alignItems: 'center' }}>
          ↺ Replay demo
        </button>
      </div>

      <div className="kg k4">
        <MetricCard cls={metrics.totalEnrolled.cls} num={metrics.totalEnrolled.num} desc={metrics.totalEnrolled.desc} label={metrics.totalEnrolled.label} foot={metrics.totalEnrolled.foot} icon={Icons.laptop} />
        <MetricCard cls={metrics.nonCompliant.cls} num={nonCompliantNum} desc={metrics.nonCompliant.desc} label={metrics.nonCompliant.label} foot={metrics.nonCompliant.foot} icon={Icons.alert} />
        <MetricCard cls={metrics.gracePeriod.cls} num={metrics.gracePeriod.num} desc={metrics.gracePeriod.desc} label={metrics.gracePeriod.label} foot={metrics.gracePeriod.foot} icon={Icons.alert} />
        <MetricCard cls={metrics.encrypted.cls} num={metrics.encrypted.num} desc={metrics.encrypted.desc} label={metrics.encrypted.label} foot={metrics.encrypted.foot} icon={Icons.lock} />
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>Device Inventory</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="meta">{inventory.total} devices · {inventory.platforms} platforms</span>
            <button className="btn p">+ Enroll</button>
          </div>
        </div>
        <table>
          <thead><tr>{['Device', 'User', 'Platform', 'Status', 'Enrollment', 'Last Seen', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {displayDevices.map(d => (
              <tr
                key={d.name}
                style={d.sim && eventFired ? { animation: 'rowFlash 1.2s ease' } : {}}
              >
                <td className="pr">
                  {d.name}
                  {d.sim && eventFired && (
                    <span style={{ marginLeft: 6, fontSize: 10, fontFamily: 'JetBrains Mono,monospace', color: 'var(--crit)', fontWeight: 600 }}>
                      ● {d.failingCheck}
                    </span>
                  )}
                </td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{d.user}</td>
                <td>{d.platform}</td>
                <td><StatusBadge status={d.status} cls={d.statusCls} /></td>
                <td><span className="ch">{d.enrollment}</span></td>
                <td className="mono">{d.lastSeen}</td>
                <td>
                  <div className="brow">
                    <button className="btn">View</button>
                    {d.statusCls === 'cr' && <button className="btn d">Lock</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="g3">
        <div className="card"><div className="card-h"><h3>Platform split</h3></div><div className="card-b">
          {platformSplit.map(r => <RowBar key={r.label} {...r} />)}
        </div></div>

        <div className="card"><div className="card-h"><h3>Failing checks</h3></div><div className="card-b">
          {displayFailingChecks.map(r => <RowBar key={r.label} {...r} />)}
        </div></div>

        <div className="card"><div className="card-h"><h3>APNs certificate</h3></div><div className="card-b">
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 40, fontWeight: 700, color: 'var(--ok)' }}>{apnsCert.daysRemaining}d</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>until expiry · {apnsCert.expiryLabel}</div>
            <span className={`b ${apnsCert.statusCls}`} style={{ marginTop: 8, display: 'inline-flex' }}><i />{apnsCert.status}</span>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12 }}>
            <button className="btn">Renew APNs certificate</button>
          </div>
        </div></div>
      </div>
    </>
  )
}
