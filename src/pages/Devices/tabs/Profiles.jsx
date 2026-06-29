import StatusBadge from '../../../components/StatusBadge.jsx'

const PROFILES = [
  { name: 'CIS Endpoint Baseline v2', type: 'Security',    platform: 'All',          assigned: 847, installed: 831, cls: 'ok', status: 'ACTIVE',  updated: '2026-06-01' },
  { name: 'Corporate Wi-Fi',          type: 'Wi-Fi',       platform: 'All',          assigned: 847, installed: 847, cls: 'ok', status: 'ACTIVE',  updated: '2026-05-14' },
  { name: 'GlobalProtect VPN',        type: 'VPN',         platform: 'macOS · Win',  assigned: 664, installed: 658, cls: 'ok', status: 'ACTIVE',  updated: '2026-05-20' },
  { name: 'FileVault Encryption',     type: 'Encryption',  platform: 'macOS',        assigned: 423, installed: 421, cls: 'ok', status: 'ACTIVE',  updated: '2026-04-30' },
  { name: 'BitLocker Enforcement',    type: 'Encryption',  platform: 'Windows',      assigned: 241, installed: 239, cls: 'hi', status: 'PARTIAL', updated: '2026-06-10' },
  { name: 'Screen Lock Policy',       type: 'Passcode',    platform: 'iOS · Android',assigned: 183, installed: 180, cls: 'ok', status: 'ACTIVE',  updated: '2026-05-05' },
  { name: 'Corp Email (Exchange)',    type: 'Email',       platform: 'All',          assigned: 847, installed: 844, cls: 'ok', status: 'ACTIVE',  updated: '2026-03-22' },
  { name: 'Root CA Certificate',      type: 'Certificate', platform: 'All',          assigned: 847, installed: 847, cls: 'ok', status: 'ACTIVE',  updated: '2026-01-15' },
  { name: 'BYOD Restrictions',        type: 'Restrictions','platform': 'iOS · Android',assigned: 183, installed: 183, cls: 'ok', status: 'ACTIVE', updated: '2026-05-28' },
  { name: 'macOS Firewall',           type: 'Security',    platform: 'macOS',        assigned: 423, installed: 420, cls: 'hi', status: 'PARTIAL', updated: '2026-06-15' },
]

const TYPE_COLORS = {
  Security: 'var(--crit)', Wi-Fi: 'var(--info)', VPN: 'var(--high)',
  Encryption: 'var(--ok)', Passcode: 'var(--med)', Email: 'var(--orange)',
  Certificate: 'var(--info)', Restrictions: 'var(--med)',
}

export default function Profiles() {
  return (
    <div className="card">
      <div className="card-h">
        <h3>Configuration Profiles <span className="meta" style={{ fontWeight: 400, marginLeft: 6 }}>{PROFILES.length} profiles</span></h3>
        <button className="btn p">+ New profile</button>
      </div>
      <table>
        <thead>
          <tr>{['Profile name', 'Type', 'Platform', 'Assigned', 'Installed', 'Coverage', 'Status', 'Last updated', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {PROFILES.map(p => {
            const pct = Math.round((p.installed / p.assigned) * 100)
            return (
              <tr key={p.name}>
                <td className="pr">{p.name}</td>
                <td>
                  <span style={{ fontSize: 11, fontWeight: 700, color: TYPE_COLORS[p.type] ?? 'var(--txt2)', background: 'var(--bg3)', padding: '2px 7px', borderRadius: 4 }}>
                    {p.type}
                  </span>
                </td>
                <td style={{ fontSize: 11, color: 'var(--txt3)' }}>{p.platform}</td>
                <td className="mono">{p.assigned}</td>
                <td className="mono">{p.installed}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="pb" style={{ width: 80 }}><i style={{ width: `${pct}%`, background: p.cls === 'ok' ? 'var(--ok)' : 'var(--high)' }} /></div>
                    <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{pct}%</span>
                  </div>
                </td>
                <td><StatusBadge status={p.status} cls={p.cls} /></td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{p.updated}</td>
                <td><div className="brow"><button className="btn">Edit</button></div></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
