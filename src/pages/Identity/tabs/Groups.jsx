import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IdentityService } from "../../../services/IdentityService.js";

export default function GroupsTab() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    IdentityService.getGroups().then(data => {
      setGroups(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading-state">Loading groups…</div>

  const filtered = groups.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase()) || g.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="card">
      <div className="card-h">
        <h3>Groups</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="srch" placeholder="Search groups…" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn p">+ New Group</button>
        </div>
      </div>
      <table>
        <thead><tr>{['Name', 'Description', 'Type', 'Members Count', 'App Name', ''].map(h=><th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {filtered.map(g => (
            <tr key={g._id}>
              <td>
                <div style={{ fontWeight: 600 }}>{g.name}</div>
              </td>
              <td>{g.description}</td>
              <td>{g.type}</td>
              <td>{g.memberCount}</td>
              <td>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {g.appAssignments.map(a => (
                    <span key={a.appId} className="ch">{a.appName}</span>
                  ))}
                </div>
              </td>
              <td>
                <div className="brow">
                  <button className="btn" onClick={() => navigate(`/identity/groups/${g._id}`)}>View</button>
                  <button className="btn">Edit</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
