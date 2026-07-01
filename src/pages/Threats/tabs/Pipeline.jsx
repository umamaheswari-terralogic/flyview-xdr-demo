const STAGES = [
  { label: 'Ingest',      icon: '📥', count: '148,302', unit: 'events / day', desc: 'Raw logs from EDR, IAM, Cloud, Network, DNS',       color: 'var(--info)' },
  { label: 'Normalize',   icon: '⚙️',  count: '148,302', unit: 'normalized',   desc: 'Schema translation → FlyView Common Event Format',  color: 'var(--info)' },
  { label: 'Enrich',      icon: '🔍', count: '144,891', unit: 'enriched',      desc: 'GeoIP · Threat Intel IoC lookup · Asset context',   color: 'var(--med)'  },
  { label: 'Correlate',   icon: '🔗', count: '1,204',   unit: 'corr. events', desc: 'UEBA + rule engine · 24 active correlation rules',  color: 'var(--high)' },
  { label: 'Score',       icon: '📊', count: '312',     unit: 'scored',       desc: 'ML risk scoring · anomaly detection baseline',      color: 'var(--high)' },
  { label: 'Alert',       icon: '🚨', count: '10',      unit: 'alerts raised', desc: 'Threshold breached or rule matched',                color: 'var(--crit)' },
  { label: 'Case',        icon: '📁', count: '3',       unit: 'cases opened', desc: 'Auto or analyst-created case grouping',             color: 'var(--crit)' },
]

const SOURCES = [
  { name: 'EDR Agent (847 endpoints)',   events: 74012,  pct: 50, color: 'var(--crit)' },
  { name: 'IAM / Okta / Entra ID',       events: 29660,  pct: 20, color: 'var(--high)' },
  { name: 'Cloud (AWS · GCP · Azure)',   events: 22245,  pct: 15, color: 'var(--med)'  },
  { name: 'Network (Firewall · Switch)', events: 14830,  pct: 10, color: 'var(--info)' },
  { name: 'DNS · Proxy · Email',         events: 7555,   pct: 5,  color: 'var(--ok)'   },
]

const RECENT = [
  { ts: '09:13:52', stage: 'Alert',     msg: 'ALT-0091 raised — Ransomware burst on WIN-FIN-04',          cls: 'cr' },
  { ts: '09:13:42', stage: 'Correlate', msg: 'file.encrypt_burst matched rule RW-001 (conf 98%)',          cls: 'cr' },
  { ts: '09:12:11', stage: 'Enrich',    msg: '185.220.101.47 matched AlienVault OTX Tor exit node list',  cls: 'hi' },
  { ts: '09:10:55', stage: 'Alert',     msg: 'ALT-0089 raised — NetFlow exfil pattern (185.220.101.x)',   cls: 'cr' },
  { ts: '09:08:31', stage: 'Score',     msg: 'CORP-WRK-218 risk score → 82 (lateral movement signal)',    cls: 'hi' },
  { ts: '09:05:12', stage: 'Alert',     msg: 'ALT-0087 raised — Public S3 ACL change on prod-billing',    cls: 'cr' },
  { ts: '09:02:47', stage: 'Correlate', msg: 'auth.bruteforce_success correlated with prior fail events',  cls: 'hi' },
  { ts: '08:54:03', stage: 'Ingest',    msg: 'DNS tunnel signature detected — queued for scoring',        cls: 'me' },
]

const STAGE_CLS = { cr: 'var(--crit)', hi: 'var(--high)', me: 'var(--med)', ok: 'var(--ok)', info: 'var(--info)' }

export default function PipelineTab() {
  return (
    <>
      {/* Pipeline flow */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h"><h3>SIEM Ingestion Pipeline</h3><span className="meta">Real-time event processing · 148,302 events today</span></div>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, padding: '24px 18px', overflowX: 'auto' }}>
          {STAGES.map((s, i) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                minWidth: 130, background: 'var(--bg2)', border: `1px solid ${s.color}40`,
                borderTop: `3px solid ${s.color}`, borderRadius: 8, padding: '14px 16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 16, fontWeight: 700, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: 10.5, color: 'var(--txt3)', marginTop: 2 }}>{s.unit}</div>
                <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 6, lineHeight: 1.4 }}>{s.desc}</div>
              </div>
              {i < STAGES.length - 1 && (
                <div style={{ padding: '0 6px', color: 'var(--txt3)', fontSize: 18 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="g2" style={{ marginBottom: 18 }}>
        {/* Event sources */}
        <div className="card">
          <div className="card-h"><h3>Event volume by source</h3><span className="meta">Last 24 hours</span></div>
          <div className="card-b">
            {SOURCES.map(s => (
              <div key={s.name} className="row" style={{ alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, minWidth: 220, color: 'var(--txt2)' }}>{s.name}</span>
                <div className="pb" style={{ flex: 1 }}><i style={{ width: `${s.pct}%`, background: s.color }} /></div>
                <span className="mono" style={{ fontSize: 12, color: s.color, minWidth: 55, textAlign: 'right' }}>{s.events.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent pipeline activity */}
        <div className="card">
          <div className="card-h"><h3>Pipeline activity log</h3><span className="meta">Last 30 minutes</span></div>
          <div className="card-b" style={{ padding: 0 }}>
            {RECENT.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--txt3)', whiteSpace: 'nowrap', marginTop: 1 }}>{r.ts}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: STAGE_CLS[r.cls], minWidth: 72 }}>{r.stage}</span>
                <span style={{ fontSize: 12, color: 'var(--txt2)', lineHeight: 1.45 }}>{r.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
