import { useState } from 'react'

const ALERTS = [
  { id: 'ALT-0091', ts: '09:13:42', source: 'EDR Agent',  entity: 'WIN-FIN-04',           type: 'Ransomware file-encryption burst', sev: 'CRITICAL', sevCls: 'cr', status: 'OPEN',   statusCls: 'cr' },
  { id: 'ALT-0090', ts: '09:12:08', source: 'IAM',        entity: 'john.doe',              type: 'Privileged access outside hours',  sev: 'HIGH',     sevCls: 'hi', status: 'OPEN',   statusCls: 'cr' },
  { id: 'ALT-0089', ts: '09:10:55', source: 'Network',    entity: '185.220.101.47',         type: 'NetFlow exfiltration pattern',     sev: 'CRITICAL', sevCls: 'cr', status: 'OPEN',   statusCls: 'cr' },
  { id: 'ALT-0088', ts: '09:08:31', source: 'EDR Agent',  entity: 'CORP-WRK-218',          type: 'RDP lateral movement attempt',     sev: 'HIGH',     sevCls: 'hi', status: 'ACK',    statusCls: 'hi' },
  { id: 'ALT-0087', ts: '09:05:12', source: 'Cloud',      entity: 'prod-billing-exports',  type: 'Public S3 ACL change',             sev: 'CRITICAL', sevCls: 'cr', status: 'OPEN',   statusCls: 'cr' },
  { id: 'ALT-0086', ts: '09:02:47', source: 'IAM',        entity: 'amy.wong',              type: 'Brute-force then success',         sev: 'CRITICAL', sevCls: 'cr', status: 'OPEN',   statusCls: 'cr' },
  { id: 'ALT-0085', ts: '08:58:19', source: 'EDR Agent',  entity: 'CORP-WRK-110',         type: 'Encoded PowerShell execution',     sev: 'MEDIUM',   sevCls: 'me', status: 'ACK',    statusCls: 'hi' },
  { id: 'ALT-0084', ts: '08:54:03', source: 'DNS',        entity: 'CORP-WRK-089',         type: 'DNS tunneling pattern',            sev: 'MEDIUM',   sevCls: 'me', status: 'CLOSED', statusCls: 'ok' },
  { id: 'ALT-0083', ts: '08:41:17', source: 'EDR Agent',  entity: 'CORP-WRK-055',         type: 'Suspicious script block logging',  sev: 'LOW',      sevCls: 'ok', status: 'CLOSED', statusCls: 'ok' },
  { id: 'ALT-0082', ts: '08:30:00', source: 'IAM',        entity: 'contractor-mjones',     type: 'Unmanaged IAM user detected',      sev: 'HIGH',     sevCls: 'hi', status: 'OPEN',   statusCls: 'cr' },
]

const FILTERS = ['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const STATUSES = ['All', 'OPEN', 'ACK', 'CLOSED']

const SEV_CLS = { CRITICAL: 'cr', HIGH: 'hi', MEDIUM: 'me', LOW: 'ok' }

export default function AlertsTab() {
  const [sevFilter, setSevFilter]     = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch]           = useState('')

  const filtered = ALERTS.filter(a => {
    const matchSev    = sevFilter === 'All' || a.sev === sevFilter
    const matchStatus = statusFilter === 'All' || a.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q || a.entity.toLowerCase().includes(q) || a.type.toLowerCase().includes(q) || a.source.toLowerCase().includes(q)
    return matchSev && matchStatus && matchSearch
  })

  const openCount = ALERTS.filter(a => a.status === 'OPEN').length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Security Alerts
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            <span style={{ color: 'var(--crit)' }}>{openCount} open</span> · {ALERTS.length} total today
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <input
            className="srch"
            placeholder="Search alerts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--txt)', width: 160 }}
          />
          <div className="seg">
            {FILTERS.map(f => <button key={f} className={sevFilter === f ? 'on' : ''} onClick={() => setSevFilter(f)}>{f}</button>)}
          </div>
          <div className="seg">
            {STATUSES.map(s => <button key={s} className={statusFilter === s ? 'on' : ''} onClick={() => setStatusFilter(s)}>{s}</button>)}
          </div>
          <button className="btn p">+ Create alert rule</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>{['Alert ID', 'Timestamp', 'Source', 'Entity', 'Type', 'Severity', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(a => (
            <tr key={a.id}>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.id}</td>
              <td className="mono" style={{ fontSize: 12 }}>{a.ts}</td>
              <td><span className="ch">{a.source}</span></td>
              <td className="pr">{a.entity}</td>
              <td style={{ fontSize: 12.5 }}>{a.type}</td>
              <td><span className={`b ${SEV_CLS[a.sev]}`}><i />{a.sev}</span></td>
              <td><span className={`b ${a.statusCls}`}><i />{a.status}</span></td>
              <td>
                <div className="brow">
                  <button className="btn p">Investigate</button>
                  {a.status === 'OPEN' && <button className="btn d">Escalate</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
