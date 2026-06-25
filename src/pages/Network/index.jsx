import MetricCard from '../../components/MetricCard.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { Icons } from '../../shared/icons.jsx'

const DEVICES = [
  { name: 'fw-core-01', vendor: 'Palo Alto', type: 'Firewall', ip: '10.0.0.1', site: 'HQ', status: 'ONLINE', statusCls: 'ok', poll: '14s' },
  { name: 'sw-access-03', vendor: 'Cisco', type: 'Switch', ip: '10.0.1.3', site: 'HQ', status: 'CONFIG DRIFT', statusCls: 'hi', poll: '42s' },
  { name: 'velo-edge-01', vendor: 'VMware', type: 'SD-WAN', ip: '10.0.2.1', site: 'Branch-SG', status: 'ONLINE', statusCls: 'ok', poll: '28s' },
  { name: 'lb-prod-01', vendor: 'F5', type: 'Load Balancer', ip: '10.0.3.1', site: 'DC-1', status: 'ONLINE', statusCls: 'ok', poll: '10s' },
  { name: 'sw-dc-02', vendor: 'Juniper', type: 'Switch', ip: '10.1.0.2', site: 'DC-1', status: 'OFFLINE', statusCls: 'cr', poll: '1h 4m' },
]

export default function Network() {
  return (
    <>
      <div className="kg k4">
        <MetricCard cls="ok" num="63" desc="Devices online of 64" label="Fleet" foot="99% availability" icon={Icons.wifi} />
        <MetricCard cls="cr" num="1" desc="Device offline – 1h 4m" label="Offline" foot="sw-dc-02" icon={Icons.alert} />
        <MetricCard cls="hi" num="2" desc="Unauthorized config changes" label="Config Drift" foot="vs approved baseline" icon={Icons.alert} />
        <MetricCard cls="in" num="4" desc="Flow anomalies detected" label="NetFlow" foot="Lateral + exfil patterns" icon={Icons.activity} />
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h"><h3>Network Devices</h3><button className="btn p">+ Add device</button></div>
        <table>
          <thead><tr>{['Device', 'Vendor', 'Type', 'IP', 'Site', 'Status', 'Last Poll', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {DEVICES.map(d => (
              <tr key={d.name}>
                <td className="pr">{d.name}</td>
                <td>{d.vendor}</td>
                <td><span className="ch">{d.type}</span></td>
                <td className="mono">{d.ip}</td>
                <td>{d.site}</td>
                <td><StatusBadge status={d.status} cls={d.statusCls} /></td>
                <td className="mono">{d.poll}</td>
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

      <div className="g3">
        <div className="card"><div className="card-h"><h3>Flow anomalies</h3></div><div className="card-b">
          {[
            { type: 'Lateral movement', detail: '10.0.1.44 → 10.0.2.x', cls: 'hi' },
            { type: 'Exfiltration pattern', detail: '10.0.1.12 → 185.x.x.x', cls: 'cr' },
            { type: 'Port scan', detail: '10.0.1.99 → /24', cls: 'me' },
            { type: 'Beaconing', detail: '10.0.1.55 → 34.x.x.x', cls: 'me' },
          ].map(f => (
            <div key={f.type} className="row">
              <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 500 }}>{f.type}</div><div className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{f.detail}</div></div>
              <span className={`b ${f.cls}`}><i />{f.cls === 'cr' ? 'CRITICAL' : f.cls === 'hi' ? 'HIGH' : 'MEDIUM'}</span>
            </div>
          ))}
        </div></div>

        <div className="card"><div className="card-h"><h3>Config changes (7d)</h3></div><div className="card-b">
          <div className="row">
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>sw-access-03</div><div style={{ fontSize: 11, color: 'var(--txt3)' }}>ACL rule added – no change record</div></div>
            <span className="b cr"><i />UNAUTHORIZED</span>
          </div>
          <div className="row">
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>fw-core-01</div><div style={{ fontSize: 11, color: 'var(--txt3)' }}>Policy update via Panorama</div></div>
            <span className="b ok"><i />AUTHORIZED</span>
          </div>
        </div></div>

        <div className="card"><div className="card-h"><h3>Vendor coverage</h3></div><div className="card-b">
          {[
            { name: 'Palo Alto', proto: 'SNMP + API', count: 22 },
            { name: 'Cisco', proto: 'SNMP + Syslog', count: 18 },
            { name: 'Juniper', proto: 'NETCONF', count: 14 },
            { name: 'F5', proto: 'iControl REST', count: 6 },
            { name: 'VMware', proto: 'SD-WAN API', count: 4 },
          ].map(v => (
            <div key={v.name} className="row">
              <span className="rn">{v.name}</span>
              <span className="ch" style={{ flex: 1 }}>{v.proto}</span>
              <span className="mono" style={{ marginLeft: 'auto', fontWeight: 600 }}>{v.count}</span>
            </div>
          ))}
        </div></div>
      </div>
    </>
  )
}
