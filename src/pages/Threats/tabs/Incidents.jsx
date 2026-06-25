import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SeverityBadge from '../../../components/SeverityBadge.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import ActionButtons from '../../../components/ActionButtons.jsx'
import { ThreatService } from '../../../services/ThreatService.js'

export default function IncidentsTab() {
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    ThreatService.getIncidents().then(data => {
      setIncidents(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading-state">Loading incidents…</div>

  const filtered = filter === 'All' ? incidents
    : filter === 'Open' ? incidents.filter(i => i.status === 'OPEN')
    : incidents.filter(i => i.status === 'RESOLVED')

  return (
    <div className="card">
      <div className="card-h">
        <h3>All Incidents</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="seg">
            {['All', 'Open', 'Resolved'].map(o => (
              <button key={o} className={filter === o ? 'on' : ''} onClick={() => setFilter(o)}>{o}</button>
            ))}
          </div>
          <button className="btn p">+ Create incident</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>{['ID', 'Severity', 'Title', 'Source', 'Time', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(inc => (
            <tr key={inc.id} onClick={() => navigate(`/threats/${inc.id}`)}>
              <td className="mo">{inc.id}</td>
              <td><SeverityBadge severity={inc.severity} cls={inc.severityClass} /></td>
              <td className="pr">{inc.title}</td>
              <td>{inc.source.map(s => <span key={s} className="ch" style={{ marginRight: 4 }}>{s}</span>)}</td>
              <td className="mo">{inc.time}</td>
              <td><StatusBadge status={inc.status} cls={inc.statusClass} /></td>
              <td><ActionButtons actions={inc.actions} onAction={a => a === 'View' && navigate(`/threats/${inc.id}`)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
