import { useState } from 'react'
import { Ico, DeviceRow, devicesSeed } from './_prototypeShared.jsx'

/* --- original implementation (kept for reference) ---

import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import DeviceDrawer from '../../../components/DeviceDrawer.jsx'
import { DeviceService } from '../../../services/DeviceService.js'
import { API_BASE } from '../../../config.js'

const EXTRA_DEVICES = [
  { name: 'MAC-Sandeep-4102',  user: 'sandeep.m@terralogic.com',   platform: '🍎 macOS 14.5',  status: 'COMPLIANT',     statusCls: 'ok', enrollment: 'DEP',         lastSeen: '3 min'  },
  { name: 'MAC-Girish-4103',   user: 'girish.d@terralogic.com',    platform: '🍎 macOS 14.4',  status: 'COMPLIANT',     statusCls: 'ok', enrollment: 'DEP',         lastSeen: '5 min'  },
  { name: 'LT-Laiju-4711',     user: 'laiju.g@terralogic.com',     platform: '⊞ Windows 11',   status: 'COMPLIANT',     statusCls: 'ok', enrollment: 'MSI',         lastSeen: '7 min'  },
  { name: 'LT-Maqsood-4712',   user: 'maqsood.a@terralogic.com',   platform: '⊞ Windows 11',   status: 'NON-COMPLIANT', statusCls: 'cr', enrollment: 'MSI',         lastSeen: '22 min' },
  { name: 'MOB-Sagarika-4905', user: 'sagarika.d@terralogic.com',  platform: '📱 iOS 17.5',     status: 'COMPLIANT',     statusCls: 'ok', enrollment: 'DEP',         lastSeen: '1 min'  },
  { name: 'MOB-Sugam-4906',    user: 'sugam.y@terralogic.com',     platform: '📱 iOS 17.4',     status: 'COMPLIANT',     statusCls: 'ok', enrollment: 'DEP',         lastSeen: '4 min'  },
  { name: 'MOB-Monika-4703',   user: 'monika.m@terralogic.com',    platform: '🤖 Android 14',   status: 'GRACE PERIOD',  statusCls: 'hi', enrollment: 'Work Profile', lastSeen: '11 min' },
  { name: 'LT-Praveen-4421',   user: 'praveen.s@terralogic.com',   platform: '⊞ Windows 10',   status: 'NON-COMPLIANT', statusCls: 'cr', enrollment: 'MSI',         lastSeen: '45 min' },
  { name: 'MAC-Lavanya-4055',  user: 'lavanya.v@terralogic.com',   platform: '🍎 macOS 13.6',  status: 'COMPLIANT',     statusCls: 'ok', enrollment: 'DEP',         lastSeen: '9 min'  },
  { name: 'MOB-Praneetha-4923',user: 'praneetha.m@terralogic.com', platform: '📱 iPadOS 17.3', status: 'COMPLIANT',     statusCls: 'ok', enrollment: 'DEP',         lastSeen: '2 min'  },
]

const PLATFORMS = ['All', 'macOS', 'Windows', 'iOS / iPadOS', 'Android']
const STATUSES  = ['All', 'Compliant', 'Non-Compliant', 'Grace Period']

export default function AllDevices() {
  const [serverDevices, setServerDevices] = useState([])
  const [platform, setPlatform] = useState('All')
  const [status, setStatus]     = useState('All')
  const [search, setSearch]     = useState('')
  const [selectedDevice, setSelectedDevice] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/devices`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setServerDevices(data.devices))
      .catch(() => DeviceService.getInventory().then(inv => setServerDevices(inv.devices)))
  }, [])

  const all = [...serverDevices, ...EXTRA_DEVICES]

  const filtered = all.filter(d => {
    const matchPlatform = platform === 'All' || d.platform.toLowerCase().includes(platform.toLowerCase().split(' ')[0])
    const matchStatus =
      status === 'All' ||
      (status === 'Compliant'     && d.statusCls === 'ok') ||
      (status === 'Non-Compliant' && d.statusCls === 'cr') ||
      (status === 'Grace Period'  && d.statusCls === 'hi')
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.user.toLowerCase().includes(search.toLowerCase())
    return matchPlatform && matchStatus && matchSearch
  })

  return (
    <>
      {selectedDevice && (
        <DeviceDrawer device={selectedDevice} onClose={() => setSelectedDevice(null)} />
      )}

      <div className="card">
        <div className="card-h">
          <h3>All Devices <span className="meta" style={{ fontWeight: 400, marginLeft: 6 }}>{filtered.length} shown</span></h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              className="search-input"
              placeholder="Search device or user…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--txt)', width: 180 }}
            />
            <div className="seg">
              {PLATFORMS.map(p => <button key={p} className={platform === p ? 'on' : ''} onClick={() => setPlatform(p)}>{p}</button>)}
            </div>
            <div className="seg">
              {STATUSES.map(s => <button key={s} className={status === s ? 'on' : ''} onClick={() => setStatus(s)}>{s}</button>)}
            </div>
            <button className="btn p">+ Enroll</button>
          </div>
        </div>
        <table>
          <thead><tr>{['Device', 'User', 'Platform', 'Status', 'Enrollment', 'OS Version', 'Last Seen', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id ?? d.name}>
                <td className="pr">{d.name}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{d.user}</td>
                <td>{d.platform}</td>
                <td><StatusBadge status={d.status} cls={d.statusCls} /></td>
                <td><span className="ch">{d.enrollment}</span></td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{d.platform.match(/[\d.]+/)?.[0] ?? '—'}</td>
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
    </>
  )
}

--- end original implementation --- */

// Ported from AllDevicesTab in src/assets/flyview-windows-prototype_15.html
export default function AllDevices({ onView }) {
  const devices = devicesSeed
  const [platformFilter, setPlatformFilter] = useState('All')

  const filtered = devices.filter((d) => {
    if (platformFilter === 'Windows') return d.os.startsWith('Windows')
    if (platformFilter === 'macOS') return d.os.startsWith('macOS')
    return true
  })

  return (
    <div className="p-8">
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
          <div className="font-medium text-gray-800">All devices <span className="text-gray-400 font-normal text-sm">{filtered.length} shown</span></div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">{Ico('search', { size: 13, className: 'text-gray-400' })}<span className="text-xs text-gray-400">Search device or user...</span></div>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              {['All', 'Windows', 'macOS'].map((p) => <button key={p} onClick={() => setPlatformFilter(p)} className={`px-3 py-1.5 text-xs ${platformFilter === p ? 'bg-gray-900 text-white' : 'text-gray-500'}`}>{p}</button>)}
            </div>
            <button className="text-xs px-3 py-1.5 rounded bg-orange-500 text-white font-medium flex items-center gap-1">{Ico('plus', { size: 12 })} Enroll</button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] tracking-wider text-gray-400 border-b border-gray-100">
              <th className="py-2.5 px-4 font-medium">DEVICE</th><th className="py-2.5 px-4 font-medium">USER</th><th className="py-2.5 px-4 font-medium">PLATFORM</th>
              <th className="py-2.5 px-4 font-medium">ENROLLMENT</th><th className="py-2.5 px-4 font-medium">OS VERSION</th><th className="py-2.5 px-4 font-medium">LAST SEEN</th>
            </tr>
          </thead>
          <tbody>{filtered.map((d) => <DeviceRow key={d.id} d={d} onView={onView} />)}</tbody>
        </table>
      </div>
    </div>
  )
}
