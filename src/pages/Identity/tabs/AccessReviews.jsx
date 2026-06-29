import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { IdentityService } from '../../../services/IdentityService.js'

export default function AccessReviews() {
  const [reviews, setReviews] = useState([])

  useEffect(() => { IdentityService.getAccessReviews().then(setReviews) }, [])

  const inProgress = reviews.filter(r => r.status === 'IN PROGRESS').length
  const complete   = reviews.filter(r => r.status === 'COMPLETE').length
  const notStarted = reviews.filter(r => r.status === 'NOT STARTED').length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Access Reviews
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            <span style={{ color: 'var(--high)' }}>{inProgress} in progress</span>
            {' · '}{notStarted} not started · {complete} complete
          </span>
        </h3>
        <button className="btn p">+ New campaign</button>
      </div>
      <table>
        <thead>
          <tr>{['Campaign', 'Reviewer', 'Target', 'Due date', 'Progress', 'Approved', 'Revoked', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {reviews.map(r => {
            const reviewed = r.approved + r.revoked
            const pct = r.total === 0 ? 0 : Math.round((reviewed / r.total) * 100)
            return (
              <tr key={r.id}>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--txt3)' }}>{r.id}</div>
                </td>
                <td style={{ fontSize: 12 }}>{r.reviewer}</td>
                <td><span className="ch">{r.target}</span></td>
                <td className="mono" style={{ fontSize: 12, color: new Date(r.due) < new Date('2026-07-01') ? 'var(--high)' : 'var(--txt3)' }}>{r.due}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="pb" style={{ width: 70 }}>
                      <i style={{ width: `${pct}%`, background: pct === 100 ? 'var(--ok)' : 'var(--info)' }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{reviewed}/{r.total}</span>
                  </div>
                </td>
                <td className="mono" style={{ color: 'var(--ok)', fontSize: 12, fontWeight: 600 }}>{r.approved}</td>
                <td className="mono" style={{ color: r.revoked > 0 ? 'var(--crit)' : 'var(--txt3)', fontSize: 12, fontWeight: 600 }}>{r.revoked}</td>
                <td><StatusBadge status={r.status} cls={r.statusCls} /></td>
                <td>
                  <div className="brow">
                    {r.status !== 'COMPLETE' && <button className="btn p">Review</button>}
                    <button className="btn">Report</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
