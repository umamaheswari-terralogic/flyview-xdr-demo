import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { PrivacyService } from '../../../services/PrivacyService.js'

const FILTERS  = ['All', 'Overdue', 'Open', 'Completed', 'On Hold']
const JUR_CLS  = { GDPR: 'in', CCPA: 'in', PIPL: 'in', DPDP: 'in' }
const TYPE_COLOR = { Erasure: 'var(--crit)', Access: 'var(--info)', Portability: 'var(--ok)', Correction: 'var(--med)' }

export default function DSARs() {
  const [dsars, setDsars] = useState([])
  const [filter, setFilter] = useState('All')

  useEffect(() => { PrivacyService.getDsars().then(setDsars) }, [])

  const filtered = dsars.filter(d => {
    if (filter === 'Overdue')   return d.status === 'OVERDUE'
    if (filter === 'Open')      return d.status === 'IN PROGRESS' || d.status === 'SUBMITTED'
    if (filter === 'Completed') return d.status === 'COMPLETED'
    if (filter === 'On Hold')   return d.status === 'ON HOLD'
    return true
  })

  const overdue  = dsars.filter(d => d.status === 'OVERDUE').length
  const open     = dsars.filter(d => d.status === 'IN PROGRESS' || d.status === 'SUBMITTED').length
  const onHold   = dsars.filter(d => d.status === 'ON HOLD').length

  return (
    <div className="card">
      <div className="card-h">
        <h3>DSAR Queue
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            {overdue > 0 && <span style={{ color: 'var(--crit)' }}>{overdue} overdue · </span>}
            {open} open · {onHold} on hold
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map(f => (
            <button key={f} className={`btn${filter === f ? ' p' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
          <button className="btn p" style={{ marginLeft: 4 }}>+ New DSAR</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>{['Request ID', 'Type', 'Subject', 'Email', 'Jurisdiction', 'Submitted', 'Deadline', 'Assignee', 'Legal hold', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(d => (
            <tr key={d.id}>
              <td className="mono pr">{d.id}</td>
              <td>
                <span style={{ fontSize: 11, fontWeight: 700, color: TYPE_COLOR[d.type] ?? 'var(--txt2)', background: 'var(--bg3)', padding: '2px 7px', borderRadius: 4 }}>
                  {d.type}
                </span>
              </td>
              <td style={{ fontWeight: 500 }}>{d.subject}</td>
              <td style={{ fontSize: 11, color: 'var(--txt3)' }}>{d.email}</td>
              <td><span className={`b ${JUR_CLS[d.jurisdiction] ?? 'in'}`}><i />{d.jurisdiction}</span></td>
              <td className="mono" style={{ fontSize: 12 }}>{d.submitted}</td>
              <td className="mono" style={{ color: d.deadlineColor, fontWeight: d.statusCls === 'cr' ? 700 : 400, fontSize: 12 }}>{d.deadline}</td>
              <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{d.assignee}</td>
              <td>
                {d.legalHold
                  ? <span className="b cr"><i />HOLD</span>
                  : <span style={{ fontSize: 11, color: 'var(--txt3)' }}>—</span>
                }
              </td>
              <td><StatusBadge status={d.status} cls={d.statusCls} /></td>
              <td>
                <div className="brow">
                  {d.status === 'OVERDUE' && <button className="btn p">Execute</button>}
                  {d.status === 'SUBMITTED' && <button className="btn p">Start</button>}
                  <button className="btn">View</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
