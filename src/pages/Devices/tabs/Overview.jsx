import { useState, useEffect } from 'react'
import MetricCard from '../../../components/MetricCard.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import DeviceDrawer from '../../../components/DeviceDrawer.jsx'
import { DeviceService } from '../../../services/DeviceService.js'
import { Icons } from '../../../shared/icons.jsx'
import { API_BASE } from '../../../config.js'

function RowBar({ label, pct, color, val }) {
  return (
    <div className="row">
      <span className="rn">{label}</span>
      <div className="pb" style={{ flex: 1 }}><i style={{ width: `${pct}%`, background: color }} /></div>
      <span className="rv" style={{ color }}>{val}</span>
    </div>
  )
}

export default function DevicesOverview() {
  const [metrics, setMetrics] = useState(null)
  const [inventory, setInventory] = useState(null)
  const [devices, setDevices] = useState([])
  const [platformSplit, setPlatformSplit] = useState([])
  const [failingChecks, setFailingChecks] = useState([])
  const [apnsCert, setApnsCert] = useState(null)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [simDevice, setSimDevice] = useState(null)

  // All data from JSON
  useEffect(() => {
    DeviceService.getMetrics().then(setMetrics)
    DeviceService.getInventory().then(inv => { setInventory(inv); setDevices(inv.devices) })
    DeviceService.getPlatformSplit().then(setPlatformSplit)
    DeviceService.getFailingChecks().then(setFailingChecks)
    DeviceService.getApnsCert().then(setApnsCert)
  }, [])

  // Poll server for live sim device — use server's actual failingChecks
  useEffect(() => {
    let cancelled = false
    async function poll() {
      if (cancelled) return
      try {
        const res = await fetch(`${API_BASE}/api/devices/LT-VyshnaviT-3941`)
        if (res.ok) setSimDevice(await res.json())
      } catch { /* server not running */ }
      if (!cancelled) setTimeout(poll, 3000)
    }
    poll()
    return () => { cancelled = true }
  }, [])

  if (!metrics || !inventory || !apnsCert) return null

  const simIsNonCompliant = simDevice?.statusCls === 'cr'

  // Replace the JSON sim placeholder with live server data
  const displayDevices = devices.map(d =>
    d.sim && simDevice ? simDevice : d
  )

  const nonCompliantNum = String(displayDevices.filter(d => d.statusCls === 'cr').length)

  // Add the right failing check label based on what server reports
  const simFailingLabel = simDevice?.failingChecks?.[0]
  const displayFailingChecks = simIsNonCompliant && simFailingLabel
    ? [...failingChecks, { label: simFailingLabel, pct: 8, color: 'var(--crit)', val: '1' }]
    : failingChecks

  return (
    <>
      {selectedDevice && (
        <DeviceDrawer device={selectedDevice} onClose={() => setSelectedDevice(null)} />
      )}

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
              <tr key={d.name}>
                <td className="pr">{d.name}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{d.user}</td>
                <td>{d.platform}</td>
                <td><StatusBadge status={d.status} cls={d.statusCls} /></td>
                <td><span className="ch">{d.enrollment}</span></td>
                <td className="mono">{d.lastSeen}</td>
                <td>
                  <div className="brow">
                    <button className="btn" onClick={() => setSelectedDevice(d)}>View</button>
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
