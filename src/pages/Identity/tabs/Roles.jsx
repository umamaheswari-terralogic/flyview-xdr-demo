import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IdentityService } from "../../../services/IdentityService.js";

// appId → display name (mirrors the app IDs used in group appAssignments)
const APP_NAMES = {
  "66c8f7e5d9a7e1f4b3c40501": "GitHub Enterprise",
  "66c8f7e5d9a7e1f4b3c40502": "Google Workspace",
  "66c8f7e5d9a7e1f4b3c40503": "Salesforce",
  "66c8f7e5d9a7e1f4b3c40504": "Workday",
  "66c8f7e5d9a7e1f4b3c40505": "Splunk",
  "66c8f7e5d9a7e1f4b3c40506": "AWS",
  "66c8f7e5d9a7e1f4b3c40507": "NetSuite",
}

export default function RolesTab() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    IdentityService.getRoles().then(data => {
      setRoles(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading-state">Loading roles…</div>

  const filtered = roles.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()) || r.scope.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="card">
      <div className="card-h">
        <h3>Roles</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="srch" placeholder="Search roles…" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn p">+ New Role</button>
        </div>
      </div>
      <table>
        <thead><tr>{['Name', 'Description', 'Scope', 'System Role', ''].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r._id}>
              <td>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
              </td>
              <td>{r.description}</td>
              <td>
                <span className="ch">{r.scope.toUpperCase()}</span>
              </td>
              <td>{r.isSystemRole ? 'True' : 'False'}</td>
              <td>
                <div className="brow">
                  <button className="btn" onClick={() => navigate(`/identity/roles/${r._id}`)}>View</button>
                  {!r.isSystemRole && <button className="btn">Edit</button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
