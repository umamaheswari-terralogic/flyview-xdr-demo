import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { CloudService } from '../../../services/CloudService.js'

export default function Accounts() {
  const [accounts, setAccounts] = useState([])

  useEffect(() => { CloudService.getAccounts().then(setAccounts) }, [])

  const totalFindings = accounts.reduce((s, a) => s + a.findings.critical + a.findings.high + a.findings.medium + a.findings.low, 0)

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 18 }}>
        {accounts.map(a => (
          <div key={a.id} className="card">
            <div className="card-h">
              <h3>
                <span style={{ fontSize: 13, fontWeight: 700, color: a.providerColor, marginRight: 8 }}>{a.provider}</span>
                {a.name}
              </h3>
              <StatusBadge status={a.status} cls={a.statusCls} />
            </div>
            <div style={{ padding: '8px 0 4px' }}>
              <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 10 }}>
                <span className="mono">{a.accountId}</span> · {a.region}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Critical', val: a.findings.critical, color: 'var(--crit)' },
                  { label: 'High',     val: a.findings.high,     color: 'var(--high)' },
                  { label: 'Medium',   val: a.findings.medium,   color: 'var(--med)'  },
                  { label: 'Low',      val: a.findings.low,      color: 'var(--txt3)' },
                ].map(f => (
                  <div key={f.label} style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--bg3)', borderRadius: 6 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: f.color }}>{f.val}</div>
                    <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 2 }}>{f.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--txt3)', marginBottom: 4 }}>
                  <span>Compliance score</span>
                  <span style={{ fontWeight: 700, color: a.complianceCls === 'ok' ? 'var(--ok)' : 'var(--high)' }}>{a.compliance}%</span>
                </div>
                <div className="pb">
                  <i style={{ width: `${a.compliance}%`, background: a.complianceCls === 'ok' ? 'var(--ok)' : a.compliance >= 70 ? 'var(--high)' : 'var(--crit)' }} />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 6 }}>Active services</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {a.services.map(s => <span key={s} className="ch">{s}</span>)}
                </div>
              </div>

              <div style={{ fontSize: 11, color: 'var(--txt3)', borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span>Last scan: {a.lastScan}</span>
                <button className="btn p" style={{ fontSize: 11, padding: '2px 10px' }}>Scan now</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Account summary <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>{totalFindings} total findings across {accounts.length} accounts</span></h3>
          <button className="btn p">+ Link account</button>
        </div>
        <table>
          <thead>
            <tr>{['Account', 'Provider', 'Account ID', 'Region', 'Critical', 'High', 'Compliance', 'Last scan', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {accounts.map(a => (
              <tr key={a.id}>
                <td className="pr">{a.name}</td>
                <td><span style={{ fontSize: 11, fontWeight: 700, color: a.providerColor }}>{a.provider}</span></td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.accountId}</td>
                <td style={{ fontSize: 12, color: 'var(--txt3)' }}>{a.region}</td>
                <td className="mono" style={{ color: a.findings.critical > 0 ? 'var(--crit)' : 'var(--txt3)', fontWeight: 700 }}>{a.findings.critical}</td>
                <td className="mono" style={{ color: a.findings.high > 0 ? 'var(--high)' : 'var(--txt3)', fontWeight: 600 }}>{a.findings.high}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="pb" style={{ width: 60 }}><i style={{ width: `${a.compliance}%`, background: a.complianceCls === 'ok' ? 'var(--ok)' : 'var(--high)' }} /></div>
                    <span className="mono" style={{ fontSize: 11 }}>{a.compliance}%</span>
                  </div>
                </td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.lastScan}</td>
                <td><StatusBadge status={a.status} cls={a.statusCls} /></td>
                <td><div className="brow"><button className="btn">View</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
