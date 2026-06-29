import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { PrivacyService } from '../../../services/PrivacyService.js'

const BASIS_COLOR = {
  'Consent':          'var(--ok)',
  'Contract':         'var(--info)',
  'Legitimate int.':  'var(--med)',
  'Legal obligation': 'var(--high)',
  'None identified':  'var(--crit)',
}

export default function RoPA() {
  const [entries, setEntries] = useState([])
  const [completeness, setCompleteness] = useState(null)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    PrivacyService.getRopaEntries().then(setEntries)
    PrivacyService.getRopaCompleteness().then(setCompleteness)
  }, [])

  if (!completeness) return null

  const filtered = entries.filter(e => {
    if (filter === 'Complete')   return e.status === 'COMPLETE'
    if (filter === 'Incomplete') return e.status === 'INCOMPLETE'
    return true
  })

  const incomplete = entries.filter(e => e.status === 'INCOMPLETE').length

  return (
    <>
      <div className="kg k3" style={{ marginBottom: 18 }}>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 36, fontWeight: 700, color: 'var(--orange)' }}>{completeness.pct}%</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Overall completeness</div>
          <div className="pb" style={{ marginTop: 10 }}><i style={{ width: `${completeness.pct}%`, background: 'var(--orange)' }} /></div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--ok)' }}>{completeness.complete}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Complete activities of {completeness.total}</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--crit)' }}>{incomplete}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Incomplete — action required</div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Record of Processing Activities
            <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>{entries.length} activities shown</span>
          </h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Complete', 'Incomplete'].map(f => (
              <button key={f} className={`btn${filter === f ? ' p' : ''}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
            <button className="btn p" style={{ marginLeft: 4 }}>+ Add activity</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>{['ID', 'Processing activity', 'Purpose', 'Data categories', 'Legal basis', 'Retention', 'Controller', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id}>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{e.id}</td>
                <td className="pr">{e.activity}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{e.purpose}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {e.categories.map(c => <span key={c} className="ch">{c}</span>)}
                  </div>
                </td>
                <td>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: BASIS_COLOR[e.legalBasis] ?? 'var(--txt2)',
                    background: 'var(--bg3)', padding: '2px 7px', borderRadius: 4
                  }}>{e.legalBasis}</span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--txt3)' }}>{e.retention}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{e.controller}</td>
                <td><StatusBadge status={e.status} cls={e.statusCls} /></td>
                <td><div className="brow"><button className="btn">Edit</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
