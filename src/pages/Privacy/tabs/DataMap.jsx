import { useState, useEffect } from 'react'
import { PrivacyService } from '../../../services/PrivacyService.js'

const BASIS_COLOR = {
  'Consent':          'var(--ok)',
  'Contract':         'var(--info)',
  'Legitimate int.':  'var(--med)',
  'Legal obligation': 'var(--high)',
  'None identified':  'var(--crit)',
}

export default function DataMap() {
  const [flows, setFlows] = useState([])

  useEffect(() => { PrivacyService.getDataMap().then(setFlows) }, [])

  const issues = flows.filter(f => f.legalBasis === 'None identified' || !f.encrypted).length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Data flow map
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            {flows.length} processing activities
            {issues > 0 && <span style={{ color: 'var(--crit)', marginLeft: 6 }}>· {issues} issues</span>}
          </span>
        </h3>
        <button className="btn p">+ Add flow</button>
      </div>
      <table>
        <thead>
          <tr>{['Source', 'Data categories', 'Processor', 'Destination', 'Legal basis', 'Region', 'Encrypted', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {flows.map((f, i) => (
            <tr key={i}>
              <td className="pr">{f.source}</td>
              <td>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {f.category.split(', ').map(c => <span key={c} className="ch">{c}</span>)}
                </div>
              </td>
              <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{f.processor}</td>
              <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{f.destination}</td>
              <td>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: BASIS_COLOR[f.legalBasis] ?? 'var(--txt2)',
                  background: 'var(--bg3)', padding: '2px 7px', borderRadius: 4
                }}>{f.legalBasis}</span>
              </td>
              <td style={{ fontSize: 12, color: 'var(--txt3)' }}>{f.region}</td>
              <td>
                {f.encrypted
                  ? <span className="b ok"><i />YES</span>
                  : <span className="b cr"><i />NO</span>
                }
              </td>
              <td><div className="brow"><button className="btn">Edit</button></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
