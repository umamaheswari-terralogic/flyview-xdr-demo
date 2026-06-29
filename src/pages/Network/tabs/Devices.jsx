import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { NetworkService } from '../../../services/NetworkService.js'

const TYPES = ['All', 'Firewall', 'Switch', 'SD-WAN', 'Load Balancer']

export default function NetworkDevices() {
  const [devices, setDevices] = useState([])
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All')

  useEffect(() => { NetworkService.getDevices().then(setDevices) }, [])

  const filtered = devices.filter(d => {
    const matchType = type === 'All' || d.type === type
    const q = search.toLowerCase()
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.vendor.toLowerCase().includes(q) || d.ip.includes(q)
    return matchType && matchSearch
  })

  const online  = devices.filter(d => d.statusCls === 'ok').length
  const drift   = devices.filter(d => d.statusCls === 'hi').length
  const offline = devices.filter(d => d.status === 'OFFLINE').length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Network Devices
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            {online} online · <span style={{ color: 'var(--high)' }}>{drift} config drift</span> · <span style={{ color: 'var(--crit)' }}>{offline} offline</span>
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--txt)', borderRadius: 6, padding: '4px 10px', fontSize: 12 }}
          >
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <input className="srch" placeholder="Search devices…" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn p">+ Add device</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>{['Device', 'Vendor', 'Type', 'Model', 'IP', 'Site', 'Firmware', 'Uptime', 'Interfaces', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(d => (
            <tr key={d.name}>
              <td className="pr">{d.name}</td>
              <td>{d.vendor}</td>
              <td><span className="ch">{d.type}</span></td>
              <td style={{ fontSize: 12, color: 'var(--txt3)' }}>{d.model}</td>
              <td className="mono">{d.ip}</td>
              <td>{d.site}</td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{d.firmware}</td>
              <td className="mono" style={{ fontSize: 12 }}>{d.uptime || '—'}</td>
              <td className="mono" style={{ fontSize: 12 }}>{d.interfaces}</td>
              <td><StatusBadge status={d.status} cls={d.statusCls} /></td>
              <td>
                <div className="brow">
                  {d.statusCls === 'hi' && <button className="btn d">Rollback</button>}
                  <button className="btn">{d.statusCls === 'cr' ? 'Diagnose' : 'View'}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
