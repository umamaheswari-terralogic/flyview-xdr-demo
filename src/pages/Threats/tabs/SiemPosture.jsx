const KPI = [
  { label: 'Security Grade', num: 'B+',    desc: 'Overall posture',      cls: 'ok'  },
  { label: 'Log Sources',    num: '48',    desc: 'Active ingestion',      cls: 'info'},
  { label: 'Events/h',       num: '84k',   desc: 'Normalised & enriched', cls: 'info'},
  { label: 'Kafka Lag',      num: '0',     desc: 'All topics current',    cls: 'ok'  },
]

const DIMENSIONS = [
  { name: 'Identity & Access Risk',  score: 22, max: 25 },
  { name: 'Endpoint Health',         score: 18, max: 25 },
  { name: 'Network Hygiene',         score: 19, max: 25 },
  { name: 'Data Protection',         score: 14, max: 25 },
  { name: 'Detection Coverage',      score: 9,  max: 10 },
  { name: 'Incident Response SLA',   score: 8,  max: 10 },
  { name: 'Threat Intelligence',     score: 10, max: 10 },
  { name: 'Deception Coverage',      score: 5,  max: 5  },
]

const KAFKA_TOPICS = [
  { topic: 'flyview.siem.alerts',        producers: 4, lag: 0,    status: 'ok'  },
  { topic: 'flyview.siem.events.raw',    producers: 8, lag: 0,    status: 'ok'  },
  { topic: 'flyview.siem.events.norm',   producers: 2, lag: 0,    status: 'ok'  },
  { topic: 'flyview.siem.incidents',     producers: 1, lag: 0,    status: 'ok'  },
  { topic: 'flyview.siem.ioc',           producers: 3, lag: 0,    status: 'ok'  },
  { topic: 'flyview.siem.ueba.scores',   producers: 2, lag: 1204, status: 'hi'  },
  { topic: 'flyview.siem.netflow',       producers: 6, lag: 0,    status: 'ok'  },
  { topic: 'flyview.siem.cloud',         producers: 3, lag: 0,    status: 'ok'  },
  { topic: 'flyview.siem.identity',      producers: 4, lag: 0,    status: 'ok'  },
  { topic: 'flyview.siem.audit',         producers: 2, lag: 0,    status: 'ok'  },
]

const CLS_COLOR = { ok: 'var(--ok)', hi: 'var(--high)', cr: 'var(--crit)', info: 'var(--info)' }

function scorePct(score, max) { return Math.round((score / max) * 100) }
function scoreColor(pct) { return pct >= 90 ? 'var(--ok)' : pct >= 70 ? 'var(--med)' : 'var(--high)' }

export default function SiemPostureTab() {
  const total = DIMENSIONS.reduce((s, d) => s + d.score, 0)
  const totalMax = DIMENSIONS.reduce((s, d) => s + d.max, 0)

  return (
    <>
      {/* KPI strip */}
      <div className="kg k4" style={{ marginBottom: 18 }}>
        {KPI.map(k => (
          <div key={k.label} className="card" style={{ padding: '18px 22px', borderTop: `3px solid ${CLS_COLOR[k.cls]}` }}>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 32, fontWeight: 700, color: CLS_COLOR[k.cls] }}>{k.num}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{k.label}</div>
            <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>{k.desc}</div>
          </div>
        ))}
      </div>

      <div className="g2" style={{ alignItems: 'flex-start' }}>
        {/* Left — Posture Engine Score Breakdown */}
        <div className="card">
          <div className="card-h">
            <h3>Posture Engine — Score Breakdown</h3>
            <span className="meta">{total} / {totalMax} total</span>
          </div>
          <div className="card-b">
            {DIMENSIONS.map(d => {
              const pct = scorePct(d.score, d.max)
              const col = scoreColor(pct)
              return (
                <div key={d.name} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: 'var(--txt2)' }}>{d.name}</span>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: col }}>{d.score} / {d.max}</span>
                  </div>
                  <div className="pb" style={{ height: 7, borderRadius: 4 }}>
                    <i style={{ width: `${pct}%`, background: col, borderRadius: 4 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right — Kafka Topic Health + Retention & Compliance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card">
            <div className="card-h"><h3>Kafka Topic Health</h3><span className="meta">10 topics · all partitions</span></div>
            <table>
              <thead>
                <tr>{['Topic', 'Producers', 'Lag', 'Status'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {KAFKA_TOPICS.map(t => (
                  <tr key={t.topic}>
                    <td className="mono" style={{ fontSize: 11 }}>{t.topic}</td>
                    <td className="mono" style={{ fontSize: 12, textAlign: 'center' }}>{t.producers}</td>
                    <td className="mono" style={{ fontSize: 12, color: t.lag > 0 ? 'var(--high)' : 'var(--ok)', fontWeight: t.lag > 0 ? 700 : 400, textAlign: 'center' }}>
                      {t.lag > 0 ? t.lag.toLocaleString() : '0'}
                    </td>
                    <td>
                      <span className={`b ${t.status}`}><i />{t.status === 'ok' ? 'OK' : 'HIGH LAG'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-h"><h3>Retention &amp; Compliance</h3></div>
            <div className="card-b">
              {[
                { label: 'Hot storage',  value: '30 days',  desc: 'Full-speed query · Elasticsearch' },
                { label: 'Warm storage', value: '90 days',  desc: 'Compressed · S3 Glacier Instant'  },
                { label: 'Cold archive', value: '7 years',  desc: 'Immutable · S3 Glacier Deep'      },
                { label: 'PII fields',   value: 'CSFLE',    desc: 'Client-side field-level encryption'},
                { label: 'Frameworks',   value: 'SOC2 · ISO 27001 · PCI', desc: 'Log integrity certified' },
              ].map(r => (
                <div key={r.label} className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, minWidth: 110, color: 'var(--txt2)' }}>{r.label}</span>
                  <div>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{r.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
