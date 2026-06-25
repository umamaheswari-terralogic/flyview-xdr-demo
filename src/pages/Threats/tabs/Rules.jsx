import WidgetCard from '../../../components/WidgetCard.jsx'
import { useState } from 'react'

const RULES = [
  { id: 'R-0041', name: 'Impossible Travel Detection', type: 'Behavioral', severity: 'CRITICAL', status: 'ACTIVE', triggered: 3 },
  { id: 'R-0040', name: 'Ransomware Burst Pattern', type: 'File Activity', severity: 'CRITICAL', status: 'ACTIVE', triggered: 1 },
  { id: 'R-0039', name: 'PowerShell Base64 Exec', type: 'Process', severity: 'HIGH', status: 'ACTIVE', triggered: 7 },
  { id: 'R-0038', name: 'Secrets Access - HR Correlated', type: 'Cross-Module', severity: 'CRITICAL', status: 'ACTIVE', triggered: 2 },
  { id: 'R-0037', name: 'Shadow IT - AI Tool Detection', type: 'Network DPI', severity: 'HIGH', status: 'ACTIVE', triggered: 5 },
  { id: 'R-0036', name: 'PII Exfiltration Pattern', type: 'DLP', severity: 'HIGH', status: 'DISABLED', triggered: 0 },
]

const SEV_CLS = { CRITICAL: 'cr', HIGH: 'hi', MEDIUM: 'me' }

export default function RulesTab() {
  const [rules, setRules] = useState(RULES)

  const toggle = id => {
    setRules(prev => prev.map(r => r.id === id
      ? { ...r, status: r.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' }
      : r
    ))
  }

  return (
    <>
      <div className="kg k3" style={{ marginBottom: 18 }}>
        <div className="kc ok"><div className="kl"><span className="klab">Active Rules</span></div><div className="kn">5</div><div className="kd">of 6 total</div><div className="kf">1 disabled</div></div>
        <div className="kc hi"><div className="kl"><span className="klab">Triggered Today</span></div><div className="kn">18</div><div className="kd">Rule matches</div><div className="kf">Across all active rules</div></div>
        <div className="kc in"><div className="kl"><span className="klab">Custom Rules</span></div><div className="kn">3</div><div className="kd">Team-authored</div><div className="kf">3 from library</div></div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Detection Rules</h3>
          <button className="btn p">+ New rule</button>
        </div>
        <table>
          <thead><tr>{['ID', 'Rule Name', 'Type', 'Severity', 'Triggered', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id}>
                <td className="mono">{r.id}</td>
                <td className="pr">{r.name}</td>
                <td><span className="ch">{r.type}</span></td>
                <td><span className={`b ${SEV_CLS[r.severity] ?? 'ne'}`}><i />{r.severity}</span></td>
                <td className="mono">{r.triggered}</td>
                <td><span className={`b ${r.status === 'ACTIVE' ? 'ok' : 'ne'}`}><i />{r.status}</span></td>
                <td>
                  <div className="brow">
                    <button className="btn">Edit</button>
                    <button className={`tog ${r.status === 'ACTIVE' ? 'on' : ''}`} onClick={() => toggle(r.id)} />
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
