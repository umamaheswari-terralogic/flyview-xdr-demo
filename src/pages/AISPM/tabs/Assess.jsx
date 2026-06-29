import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { AISPMService } from '../../../services/AISPMService.js'

function ScoreBar({ val, label }) {
  const color = val >= 80 ? 'var(--crit)' : val >= 60 ? 'var(--high)' : val >= 40 ? 'var(--med)' : 'var(--ok)'
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--txt3)', marginBottom: 3 }}>
        <span>{label}</span><span style={{ color, fontWeight: 700 }}>{val}</span>
      </div>
      <div className="pb"><i style={{ width: `${val}%`, background: color }} /></div>
    </div>
  )
}

const TIER_COLOR = { 'HIGH RISK': 'var(--crit)', 'LIMITED RISK': 'var(--high)', 'MINIMAL RISK': 'var(--ok)', 'UNCLASSIFIED': 'var(--crit)' }

export default function Assess() {
  const [assessments, setAssessments] = useState([])
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { AISPMService.getAssessments().then(setAssessments) }, [])

  const overdue     = assessments.filter(a => a.status === 'OVERDUE' || a.status === 'NOT ASSESSED').length
  const inReview    = assessments.filter(a => a.status === 'IN REVIEW').length
  const complete    = assessments.filter(a => a.status === 'COMPLETE').length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Risk Assessments
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            <span style={{ color: 'var(--crit)' }}>{overdue} overdue/missing</span>
            {' · '}{inReview} in review · {complete} complete
          </span>
        </h3>
        <button className="btn p">+ New assessment</button>
      </div>
      <table>
        <thead>
          <tr>{['AI asset', 'Type', 'EU AI Act tier', 'Data access', 'Exposure', 'Compliance', 'Overall', 'Assessor', 'Next due', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {assessments.map(a => (
            <>
              <tr key={a.name} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === a.name ? null : a.name)}>
                <td className="pr">{a.name}</td>
                <td><span className="ch">{a.type}</span></td>
                <td>
                  <span style={{ fontSize: 11, fontWeight: 700, color: TIER_COLOR[a.euTier] ?? 'var(--txt2)', background: 'var(--bg3)', padding: '2px 7px', borderRadius: 4 }}>
                    {a.euTier}
                  </span>
                </td>
                <td><span className="mono" style={{ fontSize: 12, fontWeight: 700, color: a.scores.dataAccess >= 80 ? 'var(--crit)' : a.scores.dataAccess >= 60 ? 'var(--high)' : 'var(--txt2)' }}>{a.scores.dataAccess}</span></td>
                <td><span className="mono" style={{ fontSize: 12, fontWeight: 700, color: a.scores.exposure >= 80 ? 'var(--crit)' : a.scores.exposure >= 60 ? 'var(--high)' : 'var(--txt2)' }}>{a.scores.exposure}</span></td>
                <td><span className="mono" style={{ fontSize: 12, fontWeight: 700, color: a.scores.compliance >= 80 ? 'var(--crit)' : a.scores.compliance >= 60 ? 'var(--high)' : 'var(--txt2)' }}>{a.scores.compliance}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="pb" style={{ width: 50 }}><i style={{ width: `${a.scores.overall}%`, background: a.riskCls === 'cr' ? 'var(--crit)' : a.riskCls === 'hi' ? 'var(--high)' : a.riskCls === 'me' ? 'var(--med)' : 'var(--ok)' }} /></div>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{a.scores.overall}</span>
                  </div>
                </td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{a.assessor}</td>
                <td className="mono" style={{ fontSize: 11, color: a.status === 'OVERDUE' || a.status === 'NOT ASSESSED' ? 'var(--crit)' : 'var(--txt3)' }}>{a.nextDue}</td>
                <td><StatusBadge status={a.status} cls={a.statusCls} /></td>
                <td><div className="brow"><button className="btn p">Assess</button></div></td>
              </tr>
              {expanded === a.name && (
                <tr key={a.name + '-exp'}>
                  <td colSpan={11} style={{ padding: '12px 18px', background: 'var(--bg2)' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--txt2)', marginBottom: 8 }}>Findings</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {a.findings.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={`b ${a.riskCls}`} style={{ fontSize: 10 }}><i /></span>
                          <span style={{ fontSize: 12, color: 'var(--txt)' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
