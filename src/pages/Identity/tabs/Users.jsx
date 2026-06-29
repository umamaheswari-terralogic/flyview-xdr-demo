import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { IdentityService } from '../../../services/IdentityService.js'

const DEPTS = ['All', 'Engineering', 'Finance', 'HR', 'Sales', 'IT Ops', 'Security']

function RiskBar({ risk, riskCls }) {
  const color = riskCls === 'cr' ? 'var(--crit)' : riskCls === 'hi' ? 'var(--high)' : riskCls === 'me' ? 'var(--med)' : 'var(--ok)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className="pb" style={{ width: 60 }}><i style={{ width: `${risk}%`, background: color }} /></div>
      <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: riskCls === 'ok' ? 'var(--txt2)' : color }}>{risk}</span>
    </div>
  )
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All')

  useEffect(() => { IdentityService.getUsers().then(setUsers) }, [])

  const filtered = users.filter(u => {
    const matchDept = dept === 'All' || u.dept === dept
    const q = search.toLowerCase()
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    return matchDept && matchSearch
  })

  const noMfa = users.filter(u => !u.mfa).length

  return (
    <div className="card">
      <div className="card-h">
        <h3>User Directory
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            {users.length} users · <span style={{ color: 'var(--high)' }}>{noMfa} without MFA</span>
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={dept}
            onChange={e => setDept(e.target.value)}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--txt)', borderRadius: 6, padding: '4px 10px', fontSize: 12 }}
          >
            {DEPTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <input className="srch" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn p">Invite user</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>{['User', 'Department', 'Risk score', 'MFA method', 'Last login', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(u => (
            <tr key={u.email}>
              <td>
                <div style={{ fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{u.email}</div>
              </td>
              <td>{u.dept}</td>
              <td><RiskBar risk={u.risk} riskCls={u.riskCls} /></td>
              <td>{u.mfa ? <span className="ch">{u.mfa}</span> : <span className="b cr"><i />NONE</span>}</td>
              <td className="mono">{u.login}</td>
              <td><StatusBadge status={u.status} cls={u.statusCls} /></td>
              <td>
                <div className="brow">
                  <button className="btn">View</button>
                  {u.risk > 80 && <button className="btn d">Suspend</button>}
                  {u.status === 'OFFBOARDING' && <button className="btn d">Revoke all</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
