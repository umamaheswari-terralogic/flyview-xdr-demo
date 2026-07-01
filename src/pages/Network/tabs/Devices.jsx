import { useState } from 'react'

const DEVICES = [
  { name: 'PA-5250-HQ-FW',     vendor: 'Palo Alto', model: 'PA-5250',     type: 'Firewall',       ip: '10.0.0.1',   site: 'NYC-HQ',   status: 'ONLINE',      statusCls: 'ok', lastPoll: '30s ago', osVer: 'PAN-OS 11.1', proto: 'SNMP v3' },
  { name: 'CAT9300-CORE-01',   vendor: 'Cisco',     model: 'Catalyst 9300',type: 'Switch (Core)',  ip: '10.0.1.1',   site: 'NYC-HQ',   status: 'ONLINE',      statusCls: 'ok', lastPoll: '30s ago', osVer: 'IOS-XE 17.9', proto: 'SNMP v3' },
  { name: 'ASA5506-BRANCH',    vendor: 'Cisco',     model: 'ASA 5506-X',   type: 'Firewall',       ip: '172.16.0.1', site: 'LA-Branch',status: 'ONLINE',      statusCls: 'ok', lastPoll: '45s ago', osVer: 'ASA 9.18',   proto: 'SNMP v2c'},
  { name: 'FGT-200F-SG',       vendor: 'Fortinet',  model: 'FortiGate 200F',type: 'Firewall',      ip: '192.168.0.1',site: 'SG-Office',status: 'ONLINE',      statusCls: 'ok', lastPoll: '30s ago', osVer: 'FortiOS 7.4', proto: 'SNMP v3' },
  { name: 'VELO-EDGE-620',     vendor: 'VMware',    model: 'Edge 620',     type: 'SD-WAN Edge',    ip: '10.10.0.1',  site: 'HQ-WAN',   status: 'ONLINE',      statusCls: 'ok', lastPoll: '1m ago',  osVer: '5.2.0',      proto: 'REST API'},
  { name: 'CAT2960-ACCESS-07', vendor: 'Cisco',     model: 'Catalyst 2960',type: 'Switch (Access)',ip: '10.0.2.7',   site: 'NYC-HQ',   status: 'CONFIG_DRIFT',statusCls: 'hi', lastPoll: '2h ago',  osVer: 'IOS 15.2',   proto: 'SNMP v2c'},
  { name: 'F5-BIGIP-DMZ',      vendor: 'F5',        model: 'BIG-IP i4800', type: 'Load Balancer',  ip: '10.0.3.1',   site: 'NYC-DMZ',  status: 'ONLINE',      statusCls: 'ok', lastPoll: '30s ago', osVer: 'TMOS 17.1',  proto: 'SNMP v3' },
  { name: 'EX3400-FLOOR2',     vendor: 'Juniper',   model: 'EX3400',       type: 'Switch (Access)',ip: '10.0.4.1',   site: 'NYC-HQ',   status: 'OFFLINE',     statusCls: 'cr', lastPoll: '1h 4m',   osVer: 'Junos 21.4', proto: 'SNMP v3' },
]

const TYPES = ['All', 'Firewall', 'Switch (Core)', 'Switch (Access)', 'SD-WAN Edge', 'Load Balancer']
const STATUS_CLS = { ONLINE: 'ok', CONFIG_DRIFT: 'hi', OFFLINE: 'cr' }

export default function NetworkDevices() {
  const [typeFilter, setTypeFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = DEVICES.filter(d => {
    const matchType = typeFilter === 'All' || d.type === typeFilter
    const q = search.toLowerCase()
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.vendor.toLowerCase().includes(q) || d.ip.includes(q)
    return matchType && matchSearch
  })

  const online  = DEVICES.filter(d => d.status === 'ONLINE').length
  const drift   = DEVICES.filter(d => d.status === 'CONFIG_DRIFT').length
  const offline = DEVICES.filter(d => d.status === 'OFFLINE').length

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
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
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
          <tr>{['Device', 'Vendor', 'Model', 'Type', 'IP', 'Site', 'Status', 'Last Poll', 'OS Version', 'Protocol', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(d => (
            <tr key={d.name}>
              <td className="pr">{d.name}</td>
              <td>{d.vendor}</td>
              <td style={{ fontSize: 12, color: 'var(--txt3)' }}>{d.model}</td>
              <td><span className="ch">{d.type}</span></td>
              <td className="mono">{d.ip}</td>
              <td>{d.site}</td>
              <td><span className={`b ${d.statusCls}`}><i />{d.status}</span></td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{d.lastPoll}</td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{d.osVer}</td>
              <td><span className="ch" style={{ fontSize: 11 }}>{d.proto}</span></td>
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
