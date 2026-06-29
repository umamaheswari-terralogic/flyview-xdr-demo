import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { MonitorService } from '../../../services/MonitorService.js'

function MiniBar({ val, warn = 85, crit = 92 }) {
  const color = val >= crit ? 'var(--crit)' : val >= warn ? 'var(--high)' : 'var(--ok)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className="pb" style={{ width: 60 }}><i style={{ width: `${val}%`, background: color }} /></div>
      <span className="mono" style={{ fontSize: 12, color, minWidth: 30 }}>{val}%</span>
    </div>
  )
}

export default function MonitorDevices() {
  const [devices, setDevices] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => { MonitorService.getMonitoredDevices().then(setDevices) }, [])

  const filtered = devices.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.os.toLowerCase().includes(search.toLowerCase())
  )

  const online  = devices.filter(d => d.statusCls === 'ok').length
  const alert   = devices.filter(d => d.statusCls === 'cr' && d.status !== 'OFFLINE').length
  const offline = devices.filter(d => d.status === 'OFFLINE').length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Managed Endpoints
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            {online} online · <span style={{ color: 'var(--crit)' }}>{alert} alert</span> · {offline} offline
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="srch"
            placeholder="Search endpoints…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn p">+ Add endpoint</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>{['Device', 'OS', 'CPU', 'Disk', 'Memory', 'Status', 'Agent', 'Last seen', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(d => (
            <tr key={d.name}>
              <td className="pr">{d.name}</td>
              <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{d.os}</td>
              <td><MiniBar val={d.cpu} warn={80} crit={90} /></td>
              <td><MiniBar val={d.disk} warn={80} crit={90} /></td>
              <td><MiniBar val={d.mem} warn={85} crit={92} /></td>
              <td><StatusBadge status={d.status} cls={d.statusCls} /></td>
              <td><span className="ch">{d.agent}</span></td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{d.lastSeen}</td>
              <td>
                <div className="brow">
                  {d.alerts > 0 && <button className="btn d">Alerts ({d.alerts})</button>}
                  <button className="btn">Connect</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
