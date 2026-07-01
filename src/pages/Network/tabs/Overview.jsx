const METRICS = [
  { label: 'Devices',     num: '8',   desc: 'SNMP-managed',          cls: 'ok',   foot: '6 vendors' },
  { label: 'Alerts',      num: '3',   desc: 'Active network alerts',  cls: 'hi',   foot: '1 offline · 2 drift' },
  { label: 'Config Drift',num: '2',   desc: 'Unauthorized changes',   cls: 'me',   foot: 'Detected by Oxidized' },
  { label: 'Traffic',     num: '4',   desc: 'NetFlow anomalies 24h',  cls: 'info', foot: 'IPFIX · sFlow' },
]

const EVENTS = [
  { time: '09:10', type: 'CONFIG_DRIFT', device: 'CAT2960-ACCESS-07', detail: 'ACL modified on Gi0/12 — not in change log', cls: 'cr' },
  { time: '08:54', type: 'FLOW_ANOMALY', device: '185.220.101.47',    detail: 'NetFlow exfiltration pattern detected',       cls: 'cr' },
  { time: '07:22', type: 'DEVICE_DOWN',  device: 'EX3400-FLOOR2',     detail: 'SNMP poll timeout — device unreachable',      cls: 'hi' },
  { time: '06:40', type: 'PORT_SCAN',    device: '10.0.2.x',          detail: 'Port sweep from internal host',               cls: 'me' },
  { time: '05:15', type: 'CONFIG_CHANGE',device: 'PA-5250-HQ-FW',     detail: 'Security rule added (allow 443) · CR-2291',   cls: 'ok' },
]

const FLEET = [
  { label: 'Online',      num: 6, cls: 'ok' },
  { label: 'Config Drift',num: 1, cls: 'me' },
  { label: 'Offline',     num: 1, cls: 'cr' },
  { label: 'Vendors',     num: 6, cls: 'info' },
]

const VENDORS = [
  { name: 'Palo Alto',  proto: 'SNMP · API',         count: 1 },
  { name: 'Cisco',      proto: 'SNMP · NetFlow',      count: 3 },
  { name: 'Fortinet',   proto: 'SNMP · Syslog',       count: 1 },
  { name: 'VMware',     proto: 'SD-WAN API',           count: 1 },
  { name: 'F5',         proto: 'SNMP · iControl',     count: 1 },
  { name: 'Juniper',    proto: 'SNMP · NETCONF',      count: 1 },
]

const STATUS_CLS = { ONLINE: 'ok', OFFLINE: 'cr', CONFIG_DRIFT: 'me' }
const EVENT_LABELS = { CONFIG_DRIFT: 'hi', FLOW_ANOMALY: 'cr', DEVICE_DOWN: 'cr', PORT_SCAN: 'me', CONFIG_CHANGE: 'ok' }

export default function NetworkOverview() {
  return (
    <>
      {/* KPI strip */}
      <div className="kg k4" style={{ marginBottom: 18 }}>
        {METRICS.map(m => (
          <div key={m.label} className="card" style={{ padding: '18px 22px', borderTop: `3px solid var(--${m.cls === 'hi' ? 'high' : m.cls === 'me' ? 'med' : m.cls === 'info' ? 'info' : 'ok'})` }}>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 32, fontWeight: 700, color: `var(--${m.cls === 'hi' ? 'high' : m.cls === 'me' ? 'med' : m.cls === 'info' ? 'info' : 'ok'})` }}>{m.num}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>{m.desc} · {m.foot}</div>
          </div>
        ))}
      </div>

      {/* Network event timeline */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h"><h3>Network event timeline</h3><span className="meta">Last 24 hours · SNMP · NetFlow · syslog</span></div>
        <div className="card-b" style={{ padding: 0 }}>
          {EVENTS.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
              <span className="mono" style={{ fontSize: 11, color: 'var(--txt3)', minWidth: 48 }}>{e.time}</span>
              <span className={`b ${EVENT_LABELS[e.type] ?? 'me'}`} style={{ minWidth: 110, fontSize: 11 }}><i />{e.type.replace('_', ' ')}</span>
              <span style={{ fontWeight: 600, fontSize: 13, minWidth: 160 }}>{e.device}</span>
              <span style={{ fontSize: 12, color: 'var(--txt2)' }}>{e.detail}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="g3">
        {/* Fleet health mini-cards */}
        <div className="card">
          <div className="card-h"><h3>Fleet health</h3></div>
          <div className="card-b">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {FLEET.map(f => {
                const col = f.cls === 'ok' ? 'var(--ok)' : f.cls === 'me' ? 'var(--med)' : f.cls === 'cr' ? 'var(--crit)' : 'var(--info)'
                return (
                  <div key={f.label} style={{ background: 'var(--bg2)', borderRadius: 8, padding: '14px 16px', textAlign: 'center', border: `1px solid ${col}30` }}>
                    <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 28, fontWeight: 700, color: col }}>{f.num}</div>
                    <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 4 }}>{f.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Config changes */}
        <div className="card">
          <div className="card-h"><h3>Config changes (7d)</h3></div>
          <div className="card-b">
            {[
              { device: 'CAT2960-ACCESS-07', change: 'ACL modified on Gi0/12', status: 'UNAUTHORIZED', cls: 'cr' },
              { device: 'PA-5250-HQ-FW',     change: 'Security rule added',     status: 'AUTHORIZED',   cls: 'ok' },
              { device: 'FGT-200F-SG',        change: 'VPN tunnel config',       status: 'AUTHORIZED',   cls: 'ok' },
              { device: 'CAT9300-CORE-01',    change: 'VLAN 40 added',           status: 'AUTHORIZED',   cls: 'ok' },
            ].map(c => (
              <div key={c.device} className="row">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.device}</div>
                  <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>{c.change}</div>
                </div>
                <span className={`b ${c.cls}`}><i />{c.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor coverage */}
        <div className="card">
          <div className="card-h"><h3>Vendor coverage</h3></div>
          <div className="card-b">
            {VENDORS.map(v => (
              <div key={v.name} className="row">
                <span style={{ fontWeight: 600, fontSize: 13, minWidth: 90 }}>{v.name}</span>
                <span className="ch" style={{ flex: 1, fontSize: 11 }}>{v.proto}</span>
                <span className="mono" style={{ fontWeight: 700 }}>{v.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
