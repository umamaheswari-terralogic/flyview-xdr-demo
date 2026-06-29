import StatusBadge from '../../../components/StatusBadge.jsx'

const METHODS = [
  { method: 'DEP / ABM',    devices: 512, pct: 60, color: 'var(--info)',   desc: 'Apple Device Enrollment Program' },
  { method: 'MSI / GPO',    devices: 241, pct: 28, color: 'var(--orange)', desc: 'Windows Group Policy deployment' },
  { method: 'Work Profile', devices: 71,  pct:  9, color: 'var(--ok)',     desc: 'Android Enterprise Work Profile' },
  { method: 'Manual',       devices: 23,  pct:  3, color: 'var(--med)',    desc: 'User self-enrollment via portal' },
]

const PENDING = [
  { name: 'CORP-MAC-199',  user: 'new.hire1@terralogic.com', platform: '🍎 macOS 14.5',  method: 'DEP',          requested: '2h ago',  status: 'AWAITING DEVICE', cls: 'ne' },
  { name: 'WIN-SALES-031', user: 'new.hire2@terralogic.com', platform: '⊞ Windows 11',   method: 'MSI',          requested: '4h ago',  status: 'PENDING POLICY',  cls: 'hi' },
  { name: 'DROID-OPS-09',  user: 'new.hire3@terralogic.com', platform: '🤖 Android 14',  method: 'Work Profile', requested: '1d ago',  status: 'AWAITING DEVICE', cls: 'ne' },
  { name: 'CORP-iPAD-31',  user: 'new.hire4@terralogic.com', platform: '📱 iPadOS 17.4', method: 'DEP',          requested: '1d ago',  status: 'ENROLLED',        cls: 'ok' },
  { name: 'WIN-DEV-055',   user: 'new.hire5@terralogic.com', platform: '⊞ Windows 11',   method: 'MSI',          requested: '2d ago',  status: 'ENROLLED',        cls: 'ok' },
]

const STATS = [
  { label: 'Enrolled this week', val: '12', cls: 'ok' },
  { label: 'Pending enrollment', val: '3',  cls: 'hi' },
  { label: 'Avg time to enroll', val: '6h', cls: 'in' },
  { label: 'Failed enrollments', val: '1',  cls: 'cr' },
]

export default function Enrollment() {
  return (
    <>
      <div className="kg k4" style={{ marginBottom: 18 }}>
        {STATS.map(s => (
          <div key={s.label} className={`card metric-card ${s.cls}`}>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>{s.val}</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="g2" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="card-h"><h3>Enrollment methods</h3></div>
          <div className="card-b">
            {METHODS.map(m => (
              <div key={m.method} className="row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4, paddingBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{m.method}</span>
                    <span style={{ fontSize: 11, color: 'var(--txt3)', marginLeft: 8 }}>{m.desc}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.devices}</span>
                </div>
                <div className="pb" style={{ width: '100%' }}><i style={{ width: `${m.pct}%`, background: m.color }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3>Enrollment settings</h3></div>
          <div className="card-b" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'User-initiated enrollment',   on: true },
              { label: 'DEP auto-enroll on first boot', on: true },
              { label: 'Require supervised mode (iOS)', on: true },
              { label: 'Allow personal devices (BYOD)', on: false },
              { label: 'Block jailbroken devices',    on: true },
              { label: 'Grace period (72h)',           on: true },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13 }}>{s.label}</span>
                <span className={`b ${s.on ? 'ok' : 'ne'}`} style={{ fontSize: 10 }}><i />{s.on ? 'ON' : 'OFF'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3>Pending enrollments</h3>
          <button className="btn p">+ Invite user</button>
        </div>
        <table>
          <thead><tr>{['Device', 'User', 'Platform', 'Method', 'Requested', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {PENDING.map(d => (
              <tr key={d.name}>
                <td className="pr">{d.name}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{d.user}</td>
                <td>{d.platform}</td>
                <td><span className="ch">{d.method}</span></td>
                <td className="mono">{d.requested}</td>
                <td><StatusBadge status={d.status} cls={d.cls} /></td>
                <td><div className="brow"><button className="btn">Resend</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
