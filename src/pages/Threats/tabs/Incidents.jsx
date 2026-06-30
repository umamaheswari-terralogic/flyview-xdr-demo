import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SeverityBadge from '../../../components/SeverityBadge.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import ActionButtons from '../../../components/ActionButtons.jsx'
import { ThreatService } from '../../../services/ThreatService.js'

const API = 'http://localhost:3001'

export default function IncidentsTab() {
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState([])
  const [simIncidents, setSimIncidents] = useState([])
  const [flash, setFlash] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const prevCount = useRef(0)

  useEffect(() => {
    ThreatService.getIncidents().then(data => {
      setIncidents(data)
      setLoading(false)
    })
  }, [])

  // Poll /threats/sim every 3s — now returns array of sim incidents
  useEffect(() => {
    const poll = () =>
      fetch(`${API}/api/threats/sim`)
        .then(r => r.json())
        .then(({ incidents: sim = [] }) => {
          if (sim.length > prevCount.current) {
            setFlash(true)
            setTimeout(() => setFlash(false), 2500)
          }
          prevCount.current = sim.length
          setSimIncidents(sim)
        })
        .catch(() => {})
    poll()
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [])

  if (loading) return <div className="loading-state">Loading incidents…</div>

  const allIncidents = [...simIncidents, ...incidents]

  const filtered = filter === 'All' ? allIncidents
    : filter === 'Open' ? allIncidents.filter(i => i.status === 'OPEN')
    : allIncidents.filter(i => i.status === 'RESOLVED')

  const hasSim = simIncidents.length > 0

  return (
    <div className="card">
      <div className="card-h">
        <h3>All Incidents
          {hasSim && (
            <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 600, color: 'var(--crit)', background: 'rgba(239,68,68,.1)', padding: '2px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span className="dot" style={{ background: 'var(--crit)', width: 6, height: 6 }} /> CROSS-MODULE ALERT
            </span>
          )}
        </h3>
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
          {filtered.map(inc => {
            const isSim = inc.sim
            const isAntivirus = inc.scenario === 'antivirus'
            return (
              <tr
                key={inc.id}
                style={isSim && flash ? { animation: 'rowFlash 1.2s ease 2' } : {}}
                onClick={() => !isSim && navigate(`/threats/${inc.id}`)}
              >
                <td className="mo" style={{ color: isSim ? 'var(--crit)' : undefined, fontWeight: isSim ? 700 : 400 }}>{inc.id}</td>
                <td><SeverityBadge severity={inc.severity} cls={inc.severityClass} /></td>
                <td className="pr" style={{ fontWeight: isSim ? 600 : 400 }}>
                  {inc.title}
                  {isSim && (
                    <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 2, fontFamily: 'monospace' }}>
                      {inc.detail}
                    </div>
                  )}
                </td>
                <td>{inc.source.map(s => <span key={s} className="ch" style={{ marginRight: 4 }}>{s}</span>)}</td>
                <td className="mo">{inc.time}</td>
                <td><StatusBadge status={inc.status} cls={inc.statusClass} /></td>
                <td><ActionButtons actions={inc.actions} onAction={a => a === 'View' && !isSim && navigate(`/threats/${inc.id}`)} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
