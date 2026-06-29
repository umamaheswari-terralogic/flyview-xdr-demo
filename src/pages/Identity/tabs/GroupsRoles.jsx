import { useState, useEffect } from 'react'
import { IdentityService } from '../../../services/IdentityService.js'

const TYPE_COLOR = { Group: 'var(--info)', Role: 'var(--crit)' }

export default function GroupsRoles() {
  const [groups, setGroups] = useState([])

  useEffect(() => { IdentityService.getGroups().then(setGroups) }, [])

  const groupCount = groups.filter(g => g.type === 'Group').length
  const roleCount  = groups.filter(g => g.type === 'Role').length

  return (
    <div className="card">
      <div className="card-h">
        <h3>Groups &amp; Roles
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            {groupCount} groups · {roleCount} roles
          </span>
        </h3>
        <button className="btn p">+ New group</button>
      </div>
      <table>
        <thead>
          <tr>{['Name', 'Type', 'Members', 'Scope', 'Assigned roles', 'Created', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {groups.map(g => (
            <tr key={g.name}>
              <td className="pr">{g.name}</td>
              <td>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: TYPE_COLOR[g.type] ?? 'var(--txt2)',
                  background: 'var(--bg3)', padding: '2px 7px', borderRadius: 4
                }}>{g.type}</span>
              </td>
              <td className="mono">{g.members}</td>
              <td>
                <span style={{ fontSize: 12, color: g.statusCls === 'hi' ? 'var(--high)' : 'var(--txt3)' }}>
                  {g.scope}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {g.roles.map(r => <span key={r} className="ch">{r}</span>)}
                </div>
              </td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{g.created}</td>
              <td>
                <div className="brow">
                  <button className="btn">Members</button>
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
