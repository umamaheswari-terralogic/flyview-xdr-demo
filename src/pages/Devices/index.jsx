import { useOutletContext } from 'react-router-dom'
import MetricCard from '../../components/MetricCard.jsx'
import SeverityBadge from '../../components/SeverityBadge.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import { Icons } from '../../shared/icons.jsx'

const DEVICES = [
  { name: 'CORP-MAC-101', user: 'sarah.k@acme.com', platform: '🍎 macOS 14.5', status: 'COMPLIANT', statusCls: 'ok', enrollment: 'DEP', lastSeen: '2 min' },
  { name: 'WIN-FIN-04', user: 'john.d@acme.com', platform: '⊞ Windows 11', status: 'NON-COMPLIANT', statusCls: 'cr', enrollment: 'MSI', lastSeen: '14 min' },
  { name: 'CORP-iPAD-22', user: 'amy.t@acme.com', platform: '📱 iPadOS 17.4', status: 'COMPLIANT', statusCls: 'ok', enrollment: 'DEP', lastSeen: '1 min' },
  { name: 'DROID-SALES-07', user: 'mike.r@acme.com', platform: '🤖 Android 14', status: 'GRACE PERIOD', statusCls: 'hi', enrollment: 'Work Profile', lastSeen: '8 min' },
  { name: 'CORP-MAC-055', user: 'priya.v@acme.com', platform: '🍎 macOS 13.7', status: 'NON-COMPLIANT', statusCls: 'cr', enrollment: 'DEP', lastSeen: '32 min' },
  { name: 'CORP-WIN-088', user: 'carlos.m@acme.com', platform: '⊞ Windows 10', status: 'NON-COMPLIANT', statusCls: 'cr', enrollment: 'MSI', lastSeen: '1h 4m' },
]

function RowBar({ label, pct, color, val }) {
  return (
    <div className="row">
      <span className="rn">{label}</span>
      <div className="pb" style={{ flex: 1 }}><i style={{ width: `${pct}%`, background: color }} /></div>
      <span className="rv" style={{ color }}>{val}</span>
    </div>
  )
}

export default function Devices() {
  const { activeTab } = useOutletContext()

  return (
    <>
      <div className="kg k4">
        <MetricCard cls="ok" num="847" desc="Total enrolled devices" label="Fleet" foot="<b>+12</b> this week" icon={Icons.laptop} />
        <MetricCard cls="cr" num="12" desc="Non-compliant of 847" label="Non-Compliant" foot="<b>▼ −4</b> vs yesterday" icon={Icons.alert} />
        <MetricCard cls="hi" num="3" desc="In 72h grace period" label="Grace Period" foot="Window active" icon={Icons.alert} />
        <MetricCard cls="ok" num="832" desc="Disk encryption enforced" label="Encrypted" foot="98.2% coverage" icon={Icons.lock} />
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>Device Inventory</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="meta">847 devices · 4 platforms</span>
            <button className="btn p">+ Enroll</button>
          </div>
        </div>
        <table>
          <thead><tr>{['Device', 'User', 'Platform', 'Status', 'Enrollment', 'Last Seen', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {DEVICES.map(d => (
              <tr key={d.name}>
                <td className="pr">{d.name}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{d.user}</td>
                <td>{d.platform}</td>
                <td><StatusBadge status={d.status} cls={d.statusCls} /></td>
                <td><span className="ch">{d.enrollment}</span></td>
                <td className="mono">{d.lastSeen}</td>
                <td>
                  <div className="brow">
                    <button className="btn">View</button>
                    {d.statusCls === 'cr' && <button className="btn d">Lock</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="g3">
        <div className="card"><div className="card-h"><h3>Platform split</h3></div><div className="card-b">
          <RowBar label="macOS" pct={50} color="var(--info)" val="423" />
          <RowBar label="Windows" pct={28} color="var(--orange)" val="241" />
          <RowBar label="iOS/iPadOS" pct={13} color="var(--ok)" val="112" />
          <RowBar label="Android" pct={9} color="var(--high)" val="71" />
        </div></div>

        <div className="card"><div className="card-h"><h3>Failing checks</h3></div><div className="card-b">
          <RowBar label="OS version" pct={58} color="var(--crit)" val="7" />
          <RowBar label="Screen lock" pct={42} color="var(--high)" val="5" />
          <RowBar label="Required apps" pct={33} color="var(--high)" val="4" />
          <RowBar label="Encryption" pct={25} color="var(--med)" val="3" />
          <RowBar label="Firewall" pct={17} color="var(--med)" val="2" />
        </div></div>

        <div className="card"><div className="card-h"><h3>APNs certificate</h3></div><div className="card-b">
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 40, fontWeight: 700, color: 'var(--ok)' }}>81d</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>until expiry · Aug 18 2026</div>
            <span className="b ok" style={{ marginTop: 8, display: 'inline-flex' }}><i />HEALTHY</span>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 12, paddingTop: 12 }}>
            <button className="btn">Renew APNs certificate</button>
          </div>
        </div></div>
      </div>
    </>
  )
}
