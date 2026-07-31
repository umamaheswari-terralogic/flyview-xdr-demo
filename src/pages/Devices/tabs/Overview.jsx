import { Ico, KpiCard, devicesSeed } from './_prototypeShared.jsx'

/* --- original implementation (kept for reference) ---

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
  const [displayDevices, setDisplayDevices] = useState([])
  const [platformSplit, setPlatformSplit] = useState([])
  const [failingChecks, setFailingChecks] = useState([])
  const [apnsCert, setApnsCert] = useState(null)
  const [selectedDevice, setSelectedDevice] = useState(null)

  useEffect(() => {
    DeviceService.getMetrics().then(setMetrics)
    DeviceService.getInventory().then(setInventory)
    DeviceService.getPlatformSplit().then(setPlatformSplit)
    DeviceService.getFailingChecks().then(setFailingChecks)
    DeviceService.getApnsCert().then(setApnsCert)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function poll() {
      if (cancelled) return
      try {
        const res = await fetch(`${API_BASE}/api/devices`)
        if (res.ok) {
          const { devices } = await res.json()
          setDisplayDevices(devices)
        }
      } catch { }
      if (!cancelled) setTimeout(poll, 3000)
    }
    poll()
    return () => { cancelled = true }
  }, [])

  if (!metrics || !inventory || !apnsCert) return null

  const nonCompliantNum = String(displayDevices.filter(d => d.statusCls === 'cr').length)

  const simFailingLabels = displayDevices
    .filter(d => d.sim && d.failingChecks?.length > 0)
    .flatMap(d => d.failingChecks)
  const displayFailingChecks = simFailingLabels.length > 0
    ? [...failingChecks, ...simFailingLabels.map(label => ({ label, pct: 8, color: 'var(--crit)', val: '1' }))]
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
              <tr key={d.id ?? d.name}>
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

--- end original implementation --- */

// Ported from OverviewTab in src/assets/flyview-windows-prototype_15.html
export default function DevicesOverview({ onView }) {
  const devices = devicesSeed

  const encrypted = devices.filter((d) => d.checks.some((c) => (c.name === 'BitLocker encryption' || c.name === 'FileVault encryption') && c.pass)).length
  const win = devices.filter((d) => d.os.startsWith('Windows')).length
  const mac = devices.filter((d) => d.os.startsWith('macOS')).length

  return (
    <div className="p-8">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <KpiCard color="emerald" icon="monitor" label="FLEET" value={devices.length} sub="Total enrolled devices" trend="+2 this week" />
        <KpiCard color="emerald" icon="lock" label="ENCRYPTED" value={encrypted} sub="Disk encryption enabled" trend={`${Math.round((encrypted / devices.length) * 100)}% of fleet`} />
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="font-medium text-gray-800">Device Inventory</div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{devices.length} devices · 2 platforms</span>
            <button className="text-xs px-3 py-1.5 rounded bg-orange-500 text-white font-medium flex items-center gap-1">{Ico('plus', { size: 12 })} Enroll</button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] tracking-wider text-gray-400 border-b border-gray-100">
              <th className="py-2.5 px-4 font-medium">DEVICE</th>
              <th className="py-2.5 px-4 font-medium">USER</th>
              <th className="py-2.5 px-4 font-medium">PLATFORM</th>
              <th className="py-2.5 px-4 font-medium">ENROLLMENT</th>
              <th className="py-2.5 px-4 font-medium">OS VERSION</th>
              <th className="py-2.5 px-4 font-medium">LAST SEEN</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-3 px-4 text-sm">
                  <button onClick={() => onView(d.id)} className="font-medium text-gray-800 hover:text-orange-600 hover:underline text-left">{d.name}</button>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">{d.user}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{d.os.startsWith('Windows') ? '🪟' : '🍎'} {d.os}</td>
                <td className="py-3 px-4"><span className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600">{d.enrollment}</span></td>
                <td className="py-3 px-4 text-sm text-gray-400 font-mono">{d.osVersion}</td>
                <td className="py-3 px-4 text-sm text-gray-500">{d.lastSeen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="font-medium text-gray-800 mb-3">Platform split</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm"><span className="text-gray-600">🪟 Windows</span><span className="text-gray-800 font-medium">{win}</span></div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full"><div className="h-1.5 bg-orange-400 rounded-full" style={{ width: `${(win / devices.length) * 100}%` }}></div></div>
            <div className="flex items-center justify-between text-sm mt-3"><span className="text-gray-600">🍎 macOS</span><span className="text-gray-800 font-medium">{mac}</span></div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full"><div className="h-1.5 bg-gray-400 rounded-full" style={{ width: `${(mac / devices.length) * 100}%` }}></div></div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="font-medium text-gray-800 mb-3">APNs certificate</div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Expires</span>
            <span className="text-gray-800 font-medium">Sep 14, 2026</span>
          </div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Days remaining</span>
            <span className="text-emerald-600 font-medium">55 days</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full"><div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: '70%' }}></div></div>
          <div className="text-xs text-gray-400 mt-2">Without a valid APNs cert, macOS/iOS devices stop checking in — no MDM commands or inventory updates.</div>
        </div>
      </div>
    </div>
  )
}
