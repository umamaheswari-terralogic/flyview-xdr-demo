import StatusBadge from '../../../components/StatusBadge.jsx'

const APPS = [
  { name: 'GlobalProtect VPN',    version: '6.2.4',   platform: 'macOS · Win', required: true,  installed: 651, total: 664, cls: 'hi', status: 'PARTIAL'    },
  { name: 'Microsoft 365',        version: '16.84',   platform: 'All',         required: true,  installed: 847, total: 847, cls: 'ok', status: 'COMPLIANT'  },
  { name: 'Slack',                version: '4.38.125',platform: 'All',         required: true,  installed: 844, total: 847, cls: 'ok', status: 'COMPLIANT'  },
  { name: 'Zoom',                 version: '6.1.6',   platform: 'All',         required: false, installed: 790, total: 847, cls: 'ok', status: 'OPTIONAL'   },
  { name: '1Password',            version: '8.10.36', platform: 'All',         required: true,  installed: 831, total: 847, cls: 'hi', status: 'PARTIAL'    },
  { name: 'Jamf Connect',         version: '2.38.0',  platform: 'macOS',       required: true,  installed: 423, total: 423, cls: 'ok', status: 'COMPLIANT'  },
  { name: 'Intune Company Portal',version: '5.2404',  platform: 'Windows',     required: true,  installed: 240, total: 241, cls: 'hi', status: 'PARTIAL'    },
  { name: 'Google Chrome',        version: '125.0',   platform: 'All',         required: false, installed: 812, total: 847, cls: 'ok', status: 'OPTIONAL'   },
  { name: 'Suspicious Tool X',    version: '1.0.0',   platform: 'Windows',     required: false, installed: 2,   total: 847, cls: 'cr', status: 'BLOCKED'    },
]

export default function Applications() {
  const required = APPS.filter(a => a.required)
  const optional = APPS.filter(a => !a.required)

  const renderTable = (apps, title) => (
    <div className="card" style={{ marginBottom: 18 }}>
      <div className="card-h">
        <h3>{title} <span className="meta" style={{ fontWeight: 400, marginLeft: 6 }}>{apps.length} apps</span></h3>
        {title === 'Required applications' && <button className="btn p">+ Add app</button>}
      </div>
      <table>
        <thead>
          <tr>{['Application', 'Version', 'Platform', 'Installed', 'Coverage', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {apps.map(a => {
            const pct = Math.round((a.installed / a.total) * 100)
            const barColor = a.cls === 'ok' ? 'var(--ok)' : a.cls === 'cr' ? 'var(--crit)' : 'var(--high)'
            return (
              <tr key={a.name}>
                <td className="pr">{a.name}</td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.version}</td>
                <td style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.platform}</td>
                <td className="mono">{a.installed} / {a.total}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="pb" style={{ width: 80 }}><i style={{ width: `${pct}%`, background: barColor }} /></div>
                    <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{pct}%</span>
                  </div>
                </td>
                <td><StatusBadge status={a.status} cls={a.cls} /></td>
                <td><div className="brow"><button className="btn">Details</button></div></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      {renderTable(required, 'Required applications')}
      {renderTable(optional, 'Optional / detected applications')}
    </>
  )
}
