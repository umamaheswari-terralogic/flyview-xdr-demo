import { useState } from 'react'

const ALERTS = [
  { id: 'NET-A-0041', device: 'sw-dc-02',     type: 'Device Offline',      sev: 'CR', sevCls: 'cr', detail: 'No SNMP response 1h 4m · ICMP unreachable · DC-1 switch · redundancy active', age: '1h 4m',  status: 'OPEN' },
  { id: 'NET-A-0040', device: 'sw-access-03', type: 'Config Drift',         sev: 'CR', sevCls: 'cr', detail: 'Unauthorized ACL change · No change ticket · Rollback available',             age: '48m',    status: 'OPEN' },
  { id: 'NET-A-0039', device: '10.0.1.12',    type: 'Exfiltration Pattern', sev: 'CR', sevCls: 'cr', detail: '4.2 GB egress to 185.234.219.47 · TI match · SIEM-A-4395 correlated',        age: '57m',    status: 'OPEN' },
  { id: 'NET-A-0038', device: '10.0.1.44',    type: 'Lateral Movement',     sev: 'HI', sevCls: 'hi', detail: 'WinRM hop chain dev-ws-41 → dc-01 · MITRE T1021.006 · SIEM-C-2081',          age: '1h 7m',  status: 'OPEN' },
  { id: 'NET-A-0037', device: '10.0.1.99',    type: 'Internal Port Scan',   sev: 'ME', sevCls: 'me', detail: '512 SYN packets /24 sweep · CORP-WIN-088 · 5 min burst',                     age: '1h 53m', status: 'OPEN' },
  { id: 'NET-A-0036', device: '10.0.1.55',    type: 'C2 Beaconing',         sev: 'ME', sevCls: 'me', detail: '60s periodic egress → 34.x.x.x · 4h duration · C2 pattern match',            age: '2h 18m', status: 'OPEN' },
]

const RULES = [
  { name: 'Device Offline',         desc: 'SNMP no-response > 5m',            sev: 'CRITICAL', sevCls: 'cr', enabled: true  },
  { name: 'Config Drift',           desc: 'Diff vs baseline',                  sev: 'CRITICAL', sevCls: 'cr', enabled: true  },
  { name: 'Exfiltration (NetFlow)', desc: 'Egress > 1GB/10m external',         sev: 'CRITICAL', sevCls: 'cr', enabled: true  },
  { name: 'Lateral Movement',       desc: 'Internal WinRM / RPC hop',          sev: 'HIGH',     sevCls: 'hi', enabled: true  },
  { name: 'Port Scan',              desc: '> 100 SYN/2m',                      sev: 'MEDIUM',   sevCls: 'me', enabled: true  },
  { name: 'Beaconing',              desc: 'Periodic egress interval match',     sev: 'MEDIUM',   sevCls: 'me', enabled: true  },
  { name: 'BGP Session Down',       desc: 'BGP peer lost',                     sev: 'HIGH',     sevCls: 'hi', enabled: true  },
  { name: 'Interface Flap',         desc: 'Link up/down > 3 in 1h',            sev: 'MEDIUM',   sevCls: 'me', enabled: false },
]

const SIEM = [
  { label: 'Kafka topic',         value: 'flyview.network.flow'     },
  { label: 'Critical threshold',  value: 'Auto-open SIEM incident'  },
  { label: 'Enrichment',          value: 'GeoIP · TI match · Asset join' },
  { label: 'Kafka lag',           value: '0 — caught up'            },
  { label: 'SIEM correlation',    value: 'Cross-module (MDM/IAM)'   },
]

const VOLUME = [
  { label: 'Device Offline', pct: 8,  color: '#ef4444', count: 1  },
  { label: 'Config Drift',   pct: 16, color: '#f59e0b', count: 2  },
  { label: 'Flow Anomaly',   pct: 32, color: '#ef4444', count: 4  },
  { label: 'Resolved',       pct: 95, color: '#22c55e', count: 12 },
]

const SEV_BG = { cr: '#ef44441a', hi: '#f59e0b1a', me: '#eab3081a' }
const SEV_C  = { cr: '#ef4444',   hi: '#f59e0b',   me: '#eab308'   }

function Toggle({ on, onChange }) {
  return (
    <div onClick={onChange} style={{
      width: 38, height: 22, borderRadius: 11, cursor: 'pointer', flexShrink: 0,
      background: on ? '#f97316' : '#374151', position: 'relative', transition: 'background .2s',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 19 : 3, width: 16, height: 16,
        borderRadius: '50%', background: '#fff', transition: 'left .2s',
      }} />
    </div>
  )
}

export default function NetworkAlerts() {
  const [tab, setTab] = useState('Open')
  const [rules, setRules] = useState(RULES)

  const toggleRule = (i) => setRules(r => r.map((x, j) => j === i ? { ...x, enabled: !x.enabled } : x))

  return (
    <>
      {/* Tab bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {[['Open', 6], ['Resolved', 12], ['Suppressed', 1]].map(([t, n]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '5px 14px', fontSize: 12.5, fontWeight: tab === t ? 700 : 400,
              borderRadius: 7, border: '1px solid var(--border)',
              background: tab === t ? 'var(--bg)' : 'transparent',
              color: 'var(--txt2)', cursor: 'pointer',
            }}>
              {t} <span style={{ color: 'var(--txt3)', fontWeight: 400 }}>({n})</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn p" style={{ background: '#f97316', borderColor: '#f97316', color: '#fff' }}>+ Alert Rule</button>
          <button className="btn">Bulk Resolve</button>
        </div>
      </div>

      {/* Alerts table */}
      <div className="card" style={{ marginBottom: 18 }}>
        <table>
          <thead>
            <tr>
              {['ALERT ID', 'DEVICE', 'TYPE', 'SEVERITY', 'DETAIL', 'AGE', 'STATUS', ''].map(h => (
                <th key={h} style={{ fontSize: 11, letterSpacing: '.06em', color: 'var(--txt3)', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALERTS.map(a => (
              <tr key={a.id}>
                <td className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--txt2)', whiteSpace: 'nowrap' }}>{a.id}</td>
                <td className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--txt)' }}>{a.device}</td>
                <td style={{ fontSize: 13, fontWeight: 500 }}>{a.type}</td>
                <td>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 9px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                    background: SEV_BG[a.sevCls], color: SEV_C[a.sevCls],
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: SEV_C[a.sevCls], flexShrink: 0 }} />
                    {a.sev}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--txt3)', maxWidth: 380 }}>{a.detail}</td>
                <td className="mono" style={{ fontSize: 12, color: 'var(--txt3)', whiteSpace: 'nowrap' }}>{a.age}</td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#ef4444' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                    {a.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn" style={{ fontSize: 11, padding: '3px 10px' }}>View</button>
                    <button className="btn d" style={{ fontSize: 11, padding: '3px 10px' }}>Suppress</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3-column bottom panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'flex-start' }}>

        {/* Alert Rules */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, padding: '14px 18px 10px' }}>Alert Rules</div>
          <div style={{ padding: '0 8px 8px' }}>
            {rules.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 10px', borderBottom: i < rules.length - 1 ? '1px solid var(--border)' : 'none', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)' }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>{r.desc}</div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, flexShrink: 0,
                  background: SEV_BG[r.sevCls], color: SEV_C[r.sevCls],
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: SEV_C[r.sevCls] }} />
                  {r.sev}
                </span>
                <Toggle on={r.enabled} onChange={() => toggleRule(i)} />
              </div>
            ))}
          </div>
        </div>

        {/* Alert → SIEM Integration */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, padding: '14px 18px 10px' }}>Alert → SIEM Integration</div>
          <div style={{ padding: '0 18px 14px' }}>
            {SIEM.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: i < SIEM.length - 1 ? '1px solid var(--border)' : 'none', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--txt3)', flexShrink: 0 }}>{s.label}</span>
                <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--txt2)', textAlign: 'right' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Volume (24h) */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, padding: '14px 18px 10px' }}>Alert Volume (24h)</div>
          <div style={{ padding: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {VOLUME.map(v => (
              <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12.5, color: 'var(--txt2)', width: 110, flexShrink: 0 }}>{v.label}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg2)' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: v.color, width: `${v.pct}%` }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: v.color, width: 24, textAlign: 'right', flexShrink: 0 }}>{v.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
