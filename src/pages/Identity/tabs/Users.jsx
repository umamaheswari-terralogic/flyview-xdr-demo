import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../../components/StatusBadge";
import { IdentityService } from "../../../services/IdentityService.js";

const RISK_COLOR = { critical: 'var(--crit)', high: 'var(--high)', medium: 'var(--med)', low: 'var(--ok)' }

function fmtLastLogin(iso) {
  if (!iso) return 'Never'
  const d = new Date(iso)
  const now = new Date()
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  const days = Math.floor((now.setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) / 86400000)
  if (days <= 0) return time
  if (days === 1) return `Yesterday ${time}`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const q = search.trim().toLowerCase()
  const filtered = q.length < 3
    ? users
    : users.filter(u =>
        (u.displayName || '').toLowerCase().includes(q)
      )

  useEffect(() => {
    IdentityService.getUsers().then(data => {
      setUsers(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading-state">Loading users…</div>

  return (
    <div className="card">
      <div className="card-h">
        <h3>Users</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="seg">
            <input className="srch" placeholder="Search name…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn p">Invite user</button>
        </div>
      </div>
      <table>
        <thead><tr>{['User', 'Department', 'Title', 'Identity Provider', 'Status', ''].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {filtered.map(u => (
            <tr key={u.externalId}>
              <td>
                <div style={{ fontWeight: 600 }}>{u.displayName}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{u.email}</div>
              </td>
              <td>{u.department}</td>
              <td>{u.title}</td>
              <td>{u.identityProvider}</td>
              <td>
                <StatusBadge status={u.status.toUpperCase()} />
              </td>
              <td>
                <div className="brow">
                  <button className="btn" onClick={() => navigate(`/identity/users/${u.externalId}`)}>View</button>
                  {/* {u.riskScore > 80 && <button className="btn d">Suspend</button>} */}
                  {/* {u.status === 'offboarding' && <button className="btn d">Revoke all</button>} */}
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: '18px', textAlign: 'center', color: 'var(--txt3)' }}>
                No users match “{search.trim()}”
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
