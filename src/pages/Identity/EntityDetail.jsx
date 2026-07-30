import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IdentityService } from '../../services/IdentityService.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import InfoRow from '../../components/InfoRow.jsx'
import { Icons } from '../../shared/icons.jsx'

const TYPE_LABEL = { users: 'User', groups: 'Group', roles: 'Role' }

function fmtDateTime(iso) {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
}

function riskColor(score) {
  if (score > 80) return 'var(--crit)'
  if (score > 60) return 'var(--high)'
  if (score > 40) return 'var(--med)'
  return 'var(--ok)'
}

export default function EntityDetail() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    IdentityService.getEntityDetail(type, id).then(data => {
      if (!data) setNotFound(true)
      else setDetail(data)
      setLoading(false)
    })
  }, [type, id])

  if (loading) return <div className="loading-state">Loading…</div>

  if (notFound) {
    return (
      <div className="error-state">
        <p>{TYPE_LABEL[type] ?? 'Entity'} <strong>{id}</strong> not found.</p>
        <button className="btn" onClick={() => navigate('/identity')}>← Back to Identity</button>
      </div>
    )
  }

  return (
    <div>
      <div className="detail-back" onClick={() => navigate('/identity')}>
        {Icons.chevronLeft}
        Back to Identity
      </div>

      {type === 'users' && <UserView {...detail} navigate={navigate} />}
      {type === 'groups' && <GroupView {...detail} navigate={navigate} />}
      {type === 'roles' && <RoleView {...detail} navigate={navigate} />}
    </div>
  )
}

/* ---------------- User ---------------- */
function UserView({ entity: u, groups, roles, navigate }) {
  return (
    <div>
      <div className="detail-header">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <StatusBadge status={u.status?.toUpperCase()} />
            <span className="mono" style={{ fontSize: 12, color: 'var(--txt3)' }}>{u.email}</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, color: 'var(--txt)' }}>{u.displayName}</h2>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {/* <button className="btn">Reset MFA</button> */}
          {/* {u.riskScore > 80 && <button className="btn d">Suspend</button>} */}
          {/* {u.status === 'offboarding' && <button className="btn d">Revoke all</button>} */}
        </div>
      </div>

      <div className="g2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-h"><h3>Profile</h3></div>
            <div className="card-b">
              <InfoRow label="Risk Score">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="pb" style={{ width: 120 }}>
                    <i style={{ width: `${u.riskScore}%`, background: riskColor(u.riskScore) }} />
                  </div>
                  <span className="mono" style={{ fontWeight: 700, color: riskColor(u.riskScore), fontSize: 14 }}>{u.riskScore}/100</span>
                </div>
              </InfoRow>
              <InfoRow label="Department">{u.department}</InfoRow>
              <InfoRow label="Title">{u.title}</InfoRow>
              <InfoRow label="User Type">{u.userType}</InfoRow>
              <InfoRow label="Employee ID">{u.hrEmployeeId ?? '—'}</InfoRow>
              <InfoRow label="Phone">{u.phone ?? '—'}</InfoRow>
              <InfoRow label="Source">{u.source}</InfoRow>
            </div>
          </div>

          <div className="card">
            <div className="card-h"><h3>Security</h3></div>
            <div className="card-b">
              <InfoRow label="Identity Provider">{u.identityProvider}</InfoRow>
              <InfoRow label="MFA Status">{u.identityProviderMfaStatus}</InfoRow>
              <InfoRow label="MFA Methods">
                {u.mfaMethods?.length
                  ? <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{u.mfaMethods.map(m => <span key={m} className="ch">{m}</span>)}</div>
                  : <span style={{ color: 'var(--crit)' }}>None enrolled</span>}
              </InfoRow>
              <InfoRow label="SSO Only">{u.ssoOnly ? 'Yes' : 'No'}</InfoRow>
              <InfoRow label="Last Login">{fmtDateTime(u.lastLoginAt)}</InfoRow>
              <InfoRow label="Last Login IP"><span className="mono">{u.lastLoginIp ?? '—'}</span>{u.lastLoginCountry ? ` · ${u.lastLoginCountry}` : ''}</InfoRow>
              <InfoRow label="Force Reset">{u.forcePasswordReset ? 'Required' : 'No'}</InfoRow>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-h"><h3>Groups</h3><span className="meta">{groups.length}</span></div>
            <div className="card-b">
              {groups.length
                ? groups.map(g => (
                    <div key={g._id} className="row" style={{ justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => navigate(`/identity/groups/${g._id}`)}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)' }}>{g.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{g.type} · {g.memberCount} members</div>
                      </div>
                      {/* <button className="btn">View</button> */}
                    </div>
                  ))
                : <div style={{ fontSize: 13, color: 'var(--txt3)' }}>No group memberships.</div>}
            </div>
          </div>

          <div className="card">
            <div className="card-h"><h3>Roles</h3><span className="meta">{roles.length}</span></div>
            <div className="card-b">
              {roles.length
                ? roles.map(r => (
                    <div key={r._id} className="row" style={{ justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => navigate(`/identity/roles/${r._id}`)}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)' }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{r.scope}{r.isSystemRole ? ' · system' : ''}</div>
                      </div>
                      {/* <button className="btn">View</button> */}
                    </div>
                  ))
                : <div style={{ fontSize: 13, color: 'var(--txt3)' }}>No roles assigned.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Group ---------------- */
function GroupView({ entity: g, members, navigate }) {
  return (
    <div>
      <div className="detail-header">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className="ch">{g.type?.toUpperCase()}</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--txt3)' }}>{g.memberCount} members</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, color: 'var(--txt)' }}>{g.name}</h2>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button className="btn">Edit</button>
          <button className="btn p">Manage Members</button>
        </div>
      </div>

      <div className="g2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-h"><h3>Details</h3></div>
            <div className="card-b">
              <p style={{ fontSize: 13, color: 'var(--txt2)', lineHeight: 1.7, marginBottom: 16 }}>{g.description}</p>
              <InfoRow label="Type">{g.type}</InfoRow>
              <InfoRow label="Member Count">{g.memberCount}</InfoRow>
            </div>
          </div>

          {g.type === 'dynamic' && g.dynamicRule && (
            <div className="card">
              <div className="card-h"><h3>Dynamic Rule</h3><span className="meta">{g.dynamicRule.logicalOperator}</span></div>
              <div className="card-b">
                {g.dynamicRule.conditions.map((c, i) => (
                  <div key={i} className="row">
                    <span className="mono" style={{ fontSize: 12, color: 'var(--txt)' }}>
                      {c.attribute} <span style={{ color: 'var(--txt3)' }}>{c.operator}</span> "{c.value}"
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-h"><h3>App Assignments</h3><span className="meta">{g.appAssignments?.length ?? 0}</span></div>
            <div className="card-b">
              {g.appAssignments?.length
                ? (
                  <table>
                    <thead><tr>{['App', 'Role', 'Permission'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {g.appAssignments.map(a => (
                        <tr key={a.appId}>
                          <td style={{ fontWeight: 600 }}>{a.appName}</td>
                          <td>{a.role}</td>
                          <td><span className="ch">{a.permission}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
                : <div style={{ fontSize: 13, color: 'var(--txt3)' }}>No app assignments.</div>}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-h"><h3>Members</h3><span className="meta">{members.length}</span></div>
            <div className="card-b">
              {members.length
                ? members.map(u => (
                    <div key={u.externalId} className="row" style={{ justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => navigate(`/identity/users/${u.externalId}`)}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)' }}>{u.displayName}</div>
                        <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{u.title} · {u.department}</div>
                      </div>
                      {/* <button className="btn">View</button> */}
                    </div>
                  ))
                : <div style={{ fontSize: 13, color: 'var(--txt3)' }}>No members.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Role ---------------- */
function RoleView({ entity: r, assignedUsers, navigate }) {
  return (
    <div>
      <div className="detail-header">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className="ch">{r.scope?.toUpperCase()}</span>
            {r.isSystemRole && <span className="ch">SYSTEM ROLE</span>}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, color: 'var(--txt)' }}>{r.name}</h2>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {!r.isSystemRole && <button className="btn">Edit</button>}
          <button className="btn p">Assign Users</button>
        </div>
      </div>

      <div className="g2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-h"><h3>Details</h3></div>
            <div className="card-b">
              <p style={{ fontSize: 13, color: 'var(--txt2)', lineHeight: 1.7, marginBottom: 16 }}>{r.description}</p>
              <InfoRow label="Scope">{r.scope}</InfoRow>
              <InfoRow label="System Role">{r.isSystemRole ? 'Yes' : 'No'}</InfoRow>
              {/* <InfoRow label="App Scoped">{r.appId ?? 'Platform-wide'}</InfoRow> */}
            </div>
          </div>

          <div className="card">
            <div className="card-h"><h3>Permissions</h3><span className="meta">{r.permissions?.length ?? 0}</span></div>
            <div className="card-b">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {r.permissions?.map(p => <span key={p} className="ch mono">{p}</span>)}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-h"><h3>Assigned Users</h3><span className="meta">{assignedUsers.length}</span></div>
            <div className="card-b">
              {assignedUsers.length
                ? assignedUsers.map(u => (
                    <div key={u.externalId} className="row" style={{ justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => navigate(`/identity/users/${u.externalId}`)}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)' }}>{u.displayName}</div>
                        <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{u.title} · {u.department}</div>
                      </div>
                      <button className="btn">View</button>
                    </div>
                  ))
                : <div style={{ fontSize: 13, color: 'var(--txt3)' }}>No users assigned.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
