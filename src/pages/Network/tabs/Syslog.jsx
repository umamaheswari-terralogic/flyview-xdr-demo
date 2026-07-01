import { useState } from 'react'

const LOGS = [
  {
    ts: '09:14:22', device: 'fw-core-01',   cat: 'Security', catCls: 'cr',
    msg: 'TRAFFIC DENY · 10.0.1.12:55234 → 185.234.219.47:443 · action:deny · rule:BLOCK-C2-FEEDS',
    tag: 'SIEM-A-4395', tagCls: '#f97316',
  },
  {
    ts: '08:51:04', device: 'sw-access-03', cat: 'Config',   catCls: 'me',
    msg: '%SYS-5-CONFIG_I: Configured from 10.0.1.99 by console · No AAA accounting',
    tag: 'CFG-DRIFT',   tagCls: '#f59e0b',
  },
  {
    ts: '08:41:18', device: 'fw-core-01',   cat: 'Security', catCls: 'cr',
    msg: 'THREAT · WinRM lateral movement detected · 10.0.1.44 → 10.0.2.12 · T1021.006',
    tag: 'SIEM-C-2081', tagCls: '#f97316',
  },
  {
    ts: '08:20:33', device: 'fw-core-01',   cat: 'Security', catCls: 'cr',
    msg: 'URL FILTER BLOCK · phishing domain docs-share-secure.xyz · user: patel.r@acme.com',
    tag: 'SIEM-A-4388', tagCls: '#f97316',
  },
  {
    ts: '07:55:41', device: 'sw-core-01',   cat: 'Network',  catCls: 'info',
    msg: '%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch on Gi1/0/12 (1) with Gi1/0/8 (10)',
    tag: '', tagCls: '',
  },
  {
    ts: '07:30:12', device: 'lb-prod-01',   cat: 'Health',   catCls: 'ok',
    msg: 'Virtual server /Common/vs-app-443 state UP · Pool members: 4/4 active',
    tag: '', tagCls: '',
  },
  {
    ts: '06:00:00', device: 'ALL',          cat: 'System',   catCls: 'none',
    msg: 'NTP sync OK · Stratum 2 · Offset < 1ms · All 63 online devices synchronized',
    tag: '', tagCls: '',
  },
  {
    ts: '05:08:14', device: 'sw-dc-02',     cat: 'System',   catCls: 'none',
    msg: '%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1 changed state to down',
    tag: 'OFFLINE', tagCls: '#ef4444',
  },
]

const CAT_COLOR = {
  cr:   '#f97316',
  me:   '#f59e0b',
  ok:   '#22c55e',
  info: '#60a5fa',
  none: '#6b7280',
}

const VOLUME = [
  { label: 'Palo Alto FW',    pct: 90, color: '#ef4444', value: '4.1M msgs' },
  { label: 'Cisco Switches',  pct: 58, color: '#f59e0b', value: '2.5M msgs' },
  { label: 'Juniper',         pct: 33, color: '#3b82f6', value: '1.4M msgs' },
  { label: 'F5 LB',           pct: 17, color: '#22c55e', value: '720k msgs'  },
  { label: 'VMware SD-WAN',   pct:  8, color: '#eab308', value: '360k msgs'  },
]

const PIPELINE = [
  { label: 'Ingest protocol', value: 'UDP 514 → Collector'          },
  { label: 'Parser',          value: 'NestJS · CEF + Syslog RFC 5424' },
  { label: 'Normalisation',   value: 'Structured JSON → InfluxDB tag' },
  { label: 'Kafka topic',     value: 'flyview.network.flow'               },
  { label: 'SIEM forward',    value: 'Critical + High severity'           },
  { label: 'Retention',       value: '90d hot · 7yr cold'             },
]

const TOP_SOURCES = [
  { name: 'fw-core-01',   count: '2.8M', color: '#22c55e' },
  { name: 'sw-core-01',   count: '1.2M', color: '#22c55e' },
  { name: 'lb-prod-01',   count: '720k', color: '#22c55e' },
  { name: 'fw-branch-01', count: '840k', color: '#22c55e' },
  { name: 'sw-access-03', count: '280k', color: '#f59e0b' },
]

const FILTERS = ['All', 'Critical', 'Security', 'Config', 'System']

export default function Syslog() {
  const [filter, setFilter] = useState('All')

  const filtered = LOGS.filter(l => {
    if (filter === 'All') return true
    if (filter === 'Critical') return l.catCls === 'cr'
    if (filter === 'Security') return l.cat === 'Security'
    if (filter === 'Config')   return l.cat === 'Config'
    if (filter === 'System')   return l.cat === 'System'
    return true
  })

  return (
    <>
      {/* Filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '5px 14px', fontSize: 12, fontWeight: filter === f ? 700 : 400,
              borderRadius: 6, border: '1px solid var(--border)',
              background: filter === f ? 'var(--accent)' : 'var(--bg2)',
              color: filter === f ? '#fff' : 'var(--txt2)', cursor: 'pointer',
            }}>{f}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn">Export</button>
          <button className="btn p">SIEM Fwd</button>
        </div>
      </div>

      {/* Terminal syslog stream */}
      <div style={{
        background: '#0e1218', borderRadius: 10, marginBottom: 18,
        fontFamily: 'JetBrains Mono,monospace', fontSize: 12,
      }}>
        {filtered.map((l, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '76px 110px 72px 1fr auto',
            gap: '0 14px', alignItems: 'center',
            padding: '10px 18px',
            borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            <span style={{ color: '#6b7280', whiteSpace: 'nowrap' }}>{l.ts}</span>
            <span style={{ color: '#60a5fa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.device}</span>
            <span style={{ color: CAT_COLOR[l.catCls], fontWeight: 600 }}>{l.cat}</span>
            <span style={{ color: '#d1d5db', lineHeight: 1.5 }}>{l.msg}</span>
            <span style={{ color: l.tagCls, fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', minWidth: 80, textAlign: 'right' }}>{l.tag}</span>
          </div>
        ))}
      </div>

      {/* 3-column bottom panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'flex-start' }}>

        {/* Syslog Volume (24h) */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, padding: '14px 18px 12px' }}>Syslog Volume (24h)</div>
          <div style={{ padding: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {VOLUME.map(v => (
              <div key={v.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--txt2)' }}>{v.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: v.color }}>{v.value}</span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: 'var(--bg2)' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: v.color, width: `${v.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Syslog Pipeline */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, padding: '14px 18px 10px' }}>Syslog Pipeline</div>
          <div style={{ padding: '0 18px 14px' }}>
            {PIPELINE.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 0', borderBottom: i < PIPELINE.length - 1 ? '1px solid var(--border)' : 'none', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--txt3)', flexShrink: 0 }}>{p.label}</span>
                <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--txt2)', textAlign: 'right' }}>{p.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Syslog Sources */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, padding: '14px 18px 10px' }}>Top Syslog Sources</div>
          <div style={{ padding: '0 18px 14px' }}>
            {TOP_SOURCES.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < TOP_SOURCES.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span className="mono" style={{ fontSize: 13, color: 'var(--txt2)' }}>{s.name}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
