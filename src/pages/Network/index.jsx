import { useState, useEffect } from 'react'
import MetricCard from '../../components/MetricCard.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { NetworkService } from '../../services/NetworkService.js'
import { Icons } from '../../shared/icons.jsx'

export default function Network() {
  const [metrics, setMetrics] = useState(null)
  const [devices, setDevices] = useState([])
  const [flowAnomalies, setFlowAnomalies] = useState([])
  const [configChanges, setConfigChanges] = useState([])
  const [vendorCoverage, setVendorCoverage] = useState([])

  useEffect(() => {
    NetworkService.getMetrics().then(setMetrics)
    NetworkService.getDevices().then(setDevices)
    NetworkService.getFlowAnomalies().then(setFlowAnomalies)
    NetworkService.getConfigChanges().then(setConfigChanges)
    NetworkService.getVendorCoverage().then(setVendorCoverage)
  }, [])

  if (!metrics) return null

  return (
    <>
      <div className="kg k4">
        <MetricCard cls={metrics.fleet.cls} num={metrics.fleet.num} desc={metrics.fleet.desc} label={metrics.fleet.label} foot={metrics.fleet.foot} icon={Icons.wifi} />
        <MetricCard cls={metrics.offline.cls} num={metrics.offline.num} desc={metrics.offline.desc} label={metrics.offline.label} foot={metrics.offline.foot} icon={Icons.alert} />
        <MetricCard cls={metrics.configDrift.cls} num={metrics.configDrift.num} desc={metrics.configDrift.desc} label={metrics.configDrift.label} foot={metrics.configDrift.foot} icon={Icons.alert} />
        <MetricCard cls={metrics.netflow.cls} num={metrics.netflow.num} desc={metrics.netflow.desc} label={metrics.netflow.label} foot={metrics.netflow.foot} icon={Icons.activity} />
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h"><h3>Network Devices</h3><button className="btn p">+ Add device</button></div>
        <table>
          <thead><tr>{['Device', 'Vendor', 'Type', 'IP', 'Site', 'Status', 'Last Poll', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {devices.map(d => (
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
          {flowAnomalies.map(f => (
            <div key={f.type} className="row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{f.type}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{f.detail}</div>
              </div>
              <span className={`b ${f.cls}`}><i />{f.cls === 'cr' ? 'CRITICAL' : f.cls === 'hi' ? 'HIGH' : 'MEDIUM'}</span>
            </div>
          ))}
        </div></div>

        <div className="card"><div className="card-h"><h3>Config changes (7d)</h3></div><div className="card-b">
          {configChanges.map(c => (
            <div key={c.device} className="row">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{c.device}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{c.detail}</div>
              </div>
              <span className={`b ${c.statusCls}`}><i />{c.status}</span>
            </div>
          ))}
        </div></div>

        <div className="card"><div className="card-h"><h3>Vendor coverage</h3></div><div className="card-b">
          {vendorCoverage.map(v => (
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
