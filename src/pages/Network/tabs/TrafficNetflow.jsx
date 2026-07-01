const KPI = [
  { key: 'EXFILTRATION',   num: 1,       desc: 'Active exfiltration pattern',  foot: '10.0.1.12 → 185.234.x.x',  cls: 'cr'   },
  { key: 'LATERAL MOVE',   num: 1,       desc: 'Lateral movement detected',    foot: 'WinRM hop chain',           cls: 'hi'   },
  { key: 'RECON / C2',     num: 2,       desc: 'Port scan + beaconing',        foot: 'Internal sources',          cls: 'me'   },
  { key: 'THROUGHPUT',     num: '84k/hr',desc: 'Flow records processed/hr',    foot: 'Normal range',              cls: 'ok'   },
]

const ANOMALIES = [
  {
    type: 'Exfiltration', cls: 'cr', sevLabel: 'CRITICAL',
    src: '10.0.1.12 (fin-ws-07)', dst: '185.234.219.47 (Feodo C2)',
    vol: '4.2 GB', proto: 'TCP 443',
    tags: ['Sustained 45m', 'TI matched', 'SIEM-A-4395 opened', 'Block recommended'],
  },
  {
    type: 'Lateral Movement', cls: 'hi', sevLabel: 'HIGH',
    src: '10.0.1.44 (dev-ws-41)', dst: '10.0.2.12 (app-srv) → 10.1.0.5 (dc-01)',
    vol: '280 MB', proto: 'TCP 5985 WinRM',
    tags: ['Hop chain', 'MITRE T1021.006', 'SIEM-C-2081'],
  },
  {
    type: 'Port Scan', cls: 'me', sevLabel: 'MEDIUM',
    src: '10.0.1.99 (CORP-WIN-088)', dst: '10.0.1.0/24',
    vol: '—', proto: 'TCP SYN',
    tags: ['512 SYN packets', '5min sweep', 'Internal host'],
  },
  {
    type: 'Beaconing', cls: 'me', sevLabel: 'MEDIUM',
    src: '10.0.1.55 (CORP-MAC-188)', dst: '34.120.x.x (GCP CDN)',
    vol: '12 MB', proto: 'TCP 443',
    tags: ['60s intervals', '4h duration', 'C2 pattern'],
  },
]

const TOP_TALKERS = [
  { src: '10.0.1.12',              dst: '185.234.219.47', vol: '4.2 GB',  proto: 'TCP' },
  { src: '10.0.1.44',              dst: '10.0.2.x',       vol: '280 MB',  proto: 'TCP' },
  { src: '10.0.3.1 (lb-prod-01)',  dst: '10.0.4.0/24',    vol: '18.4 GB', proto: 'TCP' },
  { src: '10.0.4.22 (app-srv-01)', dst: '10.1.0.1 (db)',  vol: '4.1 GB',  proto: 'TCP' },
  { src: '10.0.1.99',              dst: '10.0.1.0/24',    vol: '—',       proto: 'TCP' },
]

const NETFLOW_STATS = [
  { label: 'Total flow records', value: '2.02 billion'         },
  { label: 'Avg throughput',     value: '84k records/hr'       },
  { label: 'Peak throughput',    value: '214k records/hr (08:51)' },
  { label: 'Collector nodes',    value: '3 · HQ · DC-1 · Branch' },
  { label: 'Sampling rate',      value: '1:1 (full capture)'   },
  { label: 'Kafka topic',        value: 'flyview.network.flow' },
]

const CLS_COLOR = { cr: 'var(--crit)', hi: 'var(--high)', me: 'var(--med)', ok: 'var(--ok)' }

export default function TrafficNetflow() {
  return (
    <>
      {/* KPI strip */}
      <div className="kg k4" style={{ marginBottom: 18 }}>
        {KPI.map(k => (
          <div key={k.key} className="card" style={{ padding: '18px 22px', borderTop: `3px solid ${CLS_COLOR[k.cls]}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: 'var(--txt3)', marginBottom: 6, textTransform: 'uppercase' }}>{k.key}</div>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 36, fontWeight: 700, color: CLS_COLOR[k.cls], lineHeight: 1 }}>{k.num}</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 6 }}>{k.desc}</div>
            <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 4 }}>{k.foot}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18, alignItems: 'flex-start' }}>
        {/* Left — anomalous flow cards */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--txt3)', marginBottom: 12 }}>Anomalous Flows</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ANOMALIES.map((a, i) => (
              <div key={i} className="card" style={{ borderLeft: `4px solid ${CLS_COLOR[a.cls]}`, padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: CLS_COLOR[a.cls] }}>{a.type}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={'b ' + a.cls}><i />{a.sevLabel}</span>
                    <button className="btn d" style={{ fontSize: 12 }}>Block</button>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--txt2)', marginBottom: 4 }}>
                  <span style={{ color: 'var(--txt3)' }}>Src: </span>{a.src}
                </div>
                <div style={{ fontSize: 12, color: 'var(--txt2)', marginBottom: 4 }}>
                  <span style={{ color: 'var(--txt3)' }}>Dst: </span>{a.dst}
                </div>
                <div style={{ fontSize: 12, color: 'var(--txt2)', marginBottom: 10 }}>
                  <span style={{ color: 'var(--txt3)' }}>Vol: </span>{a.vol}
                  <span style={{ margin: '0 8px', color: 'var(--txt3)' }}>·</span>
                  <span style={{ color: 'var(--txt3)' }}>Proto: </span>{a.proto}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {a.tags.map(t => (
                    <span key={t} style={{ fontSize: 11, color: CLS_COLOR[a.cls], cursor: 'default' }}>{t}</span>
                  )).reduce((acc, el, i) => i === 0 ? [el] : [...acc, <span key={'dot-'+i} style={{ fontSize: 11, color: 'var(--txt3)' }}>·</span>, el], [])}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — top talkers + netflow stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--txt3)', padding: '14px 16px 8px' }}>Top Talkers (1H)</div>
            <table>
              <thead>
                <tr>{['Source', 'Destination', 'Volume', 'Proto'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {TOP_TALKERS.map((t, i) => (
                  <tr key={i}>
                    <td className="mono" style={{ fontSize: 11, color: 'var(--info)' }}>{t.src}</td>
                    <td className="mono" style={{ fontSize: 11 }}>{t.dst}</td>
                    <td className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{t.vol}</td>
                    <td><span className="ch" style={{ fontSize: 11 }}>{t.proto}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--txt3)', padding: '14px 16px 8px' }}>NetFlow Stats (24H)</div>
            <div style={{ padding: '4px 16px 14px' }}>
              {NETFLOW_STATS.map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--txt3)' }}>{s.label}</span>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--txt)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
