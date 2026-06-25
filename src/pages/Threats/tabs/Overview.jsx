import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MetricCard from '../../../components/MetricCard.jsx'
import DataTable from '../../../components/DataTable.jsx'
import SeverityBadge from '../../../components/SeverityBadge.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import ActionButtons from '../../../components/ActionButtons.jsx'
import WidgetCard from '../../../components/WidgetCard.jsx'
import { ThreatService } from '../../../services/ThreatService.js'
import { Icons } from '../../../shared/icons.jsx'

function RowBar({ label, pct, color, val }) {
  return (
    <div className="row">
      <span className="rn">{label}</span>
      <div className="pb" style={{ flex: 1 }}>
        <i style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="rv" style={{ color }}>{val}</span>
    </div>
  )
}

function SparkBar({ values, days }) {
  const max = Math.max(...values)
  return (
    <>
      <div className="spark">
        {values.map((v, i) => (
          <div
            key={i}
            style={{
              height: `${Math.round((v / max) * 100)}%`,
              background: i === values.length - 1 ? 'var(--orange)' : 'var(--border2)',
              borderRadius: '3px 3px 0 0',
              flex: 1,
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {days.map(d => (
          <span key={d} style={{ fontSize: 10, color: 'var(--txt3)' }}>{d.slice(0, 1)}</span>
        ))}
      </div>
    </>
  )
}

function SegControl({ options, active, onSelect }) {
  return (
    <div className="seg">
      {options.map(o => (
        <button key={o} className={active === o ? 'on' : ''} onClick={() => onSelect(o)}>{o}</button>
      ))}
    </div>
  )
}

export default function ThreatsOverview() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [events, setEvents] = useState(null)
  const [verdict, setVerdict] = useState([])
  const [mitre, setMitre] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      ThreatService.getSummary(),
      ThreatService.getIncidents(),
      ThreatService.getEventsWeekly(),
      ThreatService.getVerdictBreakdown(),
      ThreatService.getMitreTechniques(),
    ]).then(([s, inc, ev, vd, mt]) => {
      setSummary(s)
      setIncidents(inc)
      setEvents(ev)
      setVerdict(vd)
      setMitre(mt)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading-state">Loading threat data…</div>

  const filtered = filter === 'All' ? incidents
    : filter === 'Open' ? incidents.filter(i => i.status === 'OPEN')
    : incidents.filter(i => i.status === 'RESOLVED')

  return (
    <>
      {/* KPI Cards */}
      <div className="kg k4">
        <MetricCard cls="cr" num={summary.incidents.count} desc={summary.incidents.label} label="Incidents" foot={`<b>▲ ${summary.incidents.trend}</b> · ${summary.incidents.detail}`} icon={Icons.shield} />
        <MetricCard cls="hi" num={summary.volume.count} desc={summary.volume.label} label="Volume" foot={summary.volume.trend} icon={Icons.activity} />
        <MetricCard cls="hi" num={summary.humanRisk.count} desc={summary.humanRisk.label} label="Human Risk" foot={`<b>▲ ${summary.humanRisk.trend}</b>`} icon={Icons.user} />
        <MetricCard cls="ok" num={summary.posture.count} desc={summary.posture.label} label="Posture" foot={summary.posture.trend} icon={Icons.shield} />
      </div>

      {/* Incidents Table */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>Incidents</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <SegControl options={['All', 'Open', 'Resolved']} active={filter} onSelect={setFilter} />
            <button className="btn p">+ Create</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              {['ID', 'Severity', 'Title', 'Source', 'Time', 'Status', ''].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(inc => (
              <tr key={inc.id} onClick={() => navigate(`/threats/${inc.id}`)}>
                <td className="mo">{inc.id}</td>
                <td><SeverityBadge severity={inc.severity} cls={inc.severityClass} /></td>
                <td className="pr">{inc.title}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {inc.source.map(s => <span key={s} className="ch">{s}</span>)}
                  </div>
                </td>
                <td className="mo">{inc.time}</td>
                <td><StatusBadge status={inc.status} cls={inc.statusClass} /></td>
                <td>
                  <ActionButtons
                    actions={inc.actions}
                    onAction={action => {
                      if (action === 'View') navigate(`/threats/${inc.id}`)
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Widgets */}
      <div className="g3">
        <WidgetCard title="Events (7 days)">
          {events && <SparkBar values={events.values} days={events.days} />}
        </WidgetCard>

        <WidgetCard title="Verdict breakdown">
          {verdict.map(v => (
            <RowBar key={v.label} label={v.label} pct={v.pct} color={v.color} val={v.val} />
          ))}
        </WidgetCard>

        <WidgetCard title="Top MITRE techniques">
          {mitre.map(m => (
            <div key={m.id} className="row">
              <span className="mono" style={{ fontSize: 11, width: 52, color: 'var(--txt3)', flex: '0 0 52px' }}>{m.id}</span>
              <span style={{ flex: 1, fontSize: 12 }}>{m.name}</span>
              <SeverityBadge severity={m.severity} cls={m.severityClass} />
            </div>
          ))}
        </WidgetCard>
      </div>
    </>
  )
}
