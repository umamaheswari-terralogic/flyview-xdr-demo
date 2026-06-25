import { useState, useEffect } from 'react'
import { ThreatService } from '../../../services/ThreatService.js'
import WidgetCard from '../../../components/WidgetCard.jsx'

const MOCK_EVENTS = [
  { id: 'EVT-89142', type: 'Auth', verdict: 'SUSPICIOUS', device: 'CORP-MAC-101', user: 'sarah.k@acme.com', time: '09:14:22', score: 84 },
  { id: 'EVT-89141', type: 'Process', verdict: 'HIGH', device: 'WIN-FIN-04', user: 'john.d@acme.com', time: '08:57:11', score: 91 },
  { id: 'EVT-89140', type: 'Network', verdict: 'CLEAN', device: 'CORP-MAC-055', user: 'priya.v@acme.com', time: '08:55:03', score: 12 },
  { id: 'EVT-89139', type: 'File', verdict: 'CRITICAL', device: 'WIN-FIN-04', user: 'john.d@acme.com', time: '08:57:08', score: 98 },
  { id: 'EVT-89138', type: 'Registry', verdict: 'SUSPICIOUS', device: 'CORP-WIN-088', user: 'carlos.m@acme.com', time: '07:31:45', score: 74 },
]

const VERDICT_CLS = { CLEAN: 'ok', SUSPICIOUS: 'hi', HIGH: 'cr', CRITICAL: 'cr' }

export default function EventsTab() {
  const [events] = useState(MOCK_EVENTS)

  return (
    <>
      <div className="kg k3" style={{ marginBottom: 18 }}>
        <div className="kc ok">
          <div className="kl"><span className="klab">Total Today</span></div>
          <div className="kn">148K</div>
          <div className="kd">Events processed</div>
          <div className="kf">12,000/min ingestion rate</div>
        </div>
        <div className="kc hi">
          <div className="kl"><span className="klab">Flagged</span></div>
          <div className="kn">1,284</div>
          <div className="kd">Require review</div>
          <div className="kf">0.87% flag rate</div>
        </div>
        <div className="kc cr">
          <div className="kl"><span className="klab">Critical</span></div>
          <div className="kn">23</div>
          <div className="kd">Score &gt; 90</div>
          <div className="kf"><b>▲ +8</b> vs yesterday</div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Event Stream</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="ch">Last 24h</span>
            <button className="btn">Export</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>{['Event ID', 'Type', 'Verdict', 'Device', 'User', 'Time', 'Risk Score'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {events.map(e => (
              <tr key={e.id}>
                <td className="mo">{e.id}</td>
                <td><span className="ch">{e.type}</span></td>
                <td><span className={`b ${VERDICT_CLS[e.verdict] ?? 'ne'}`}><i />{e.verdict}</span></td>
                <td className="pr">{e.device}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{e.user}</td>
                <td className="mo">{e.time}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="pb" style={{ width: 60 }}>
                      <i style={{ width: `${e.score}%`, background: e.score > 80 ? 'var(--crit)' : e.score > 60 ? 'var(--high)' : 'var(--ok)' }} />
                    </div>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: e.score > 80 ? 'var(--crit)' : 'var(--txt2)' }}>{e.score}</span>
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
