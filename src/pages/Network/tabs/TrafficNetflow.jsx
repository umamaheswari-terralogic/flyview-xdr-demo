import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { NetworkService } from '../../../services/NetworkService.js'

const FILTERS = ['All', 'Open', 'Closed']

export default function TrafficNetflow() {
  const [anomalies, setAnomalies] = useState([])
  const [topTalkers, setTopTalkers] = useState([])
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    NetworkService.getFlowAnomalies().then(setAnomalies)
    NetworkService.getTopTalkers().then(setTopTalkers)
  }, [])

  const filtered = anomalies.filter(a => {
    if (filter === 'Open')   return a.status === 'OPEN'
    if (filter === 'Closed') return a.status === 'CLOSED'
    return true
  })

  const open = anomalies.filter(a => a.status === 'OPEN').length

  return (
    <>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>Flow Anomalies
            <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
              <span style={{ color: 'var(--crit)' }}>{open} open</span>
            </span>
          </h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {FILTERS.map(f => (
              <button key={f} className={`btn${filter === f ? ' p' : ''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
        <table>
          <thead>
            <tr>{['ID', 'Type', 'Source', 'Destination', 'Protocol', 'Volume', 'Severity', 'First seen', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id}>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{f.id}</td>
                <td style={{ fontWeight: 600, fontSize: 13 }}>{f.type}</td>
                <td className="mono" style={{ fontSize: 12 }}>{f.src}</td>
                <td className="mono" style={{ fontSize: 12 }}>{f.dst}</td>
                <td><span className="ch">{f.proto}</span></td>
                <td className="mono" style={{ fontWeight: 600 }}>{f.bytes}</td>
                <td><span className={`b ${f.sevCls}`}><i />{f.severity}</span></td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{f.firstSeen}</td>
                <td><StatusBadge status={f.status} cls={f.statusCls} /></td>
                <td>
                  <div className="brow">
                    {f.status === 'OPEN' && <button className="btn d">Block</button>}
                    <button className="btn">Investigate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-h"><h3>Top talkers (last 1h)</h3></div>
        <table>
          <thead>
            <tr>{['Host', 'Device name', 'Inbound', 'Outbound', 'Total', 'Protocol', 'Share', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {topTalkers.map(t => (
              <tr key={t.host}>
                <td className="mono" style={{ fontSize: 12 }}>{t.host}</td>
                <td className="pr">{t.name}</td>
                <td className="mono">{t.in}</td>
                <td className="mono">{t.out}</td>
                <td className="mono" style={{ fontWeight: 700 }}>{t.total}</td>
                <td><span className="ch">{t.proto}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="pb" style={{ width: 70 }}><i style={{ width: `${t.pct}%`, background: t.pct >= 90 ? 'var(--crit)' : 'var(--info)' }} /></div>
                    <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{t.pct}%</span>
                  </div>
                </td>
                <td><div className="brow"><button className="btn">Trace</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
