const INSIGHTS = [
  {
    id: 'AI-2026-041',
    priority: 'CRITICAL',
    priorityCls: 'cr',
    title: 'Active ransomware execution pathway detected',
    summary: 'Blazey AI has correlated 3 signals on WIN-FIN-04: antivirus disabled, encrypted file burst (T1486), and outbound C2 beacon to 185.220.101.47. Combined confidence: 98%. Recommend immediate isolation.',
    actions: ['Isolate WIN-FIN-04', 'Block 185.220.101.47', 'Open IR case'],
    confidence: 98,
    time: '09:14 today',
    module: 'Threats + Devices + Network',
  },
  {
    id: 'AI-2026-040',
    priority: 'HIGH',
    priorityCls: 'hi',
    title: 'Credential theft likely followed by lateral movement',
    summary: 'amy.wong\'s account shows brute-force-then-success pattern (47 attempts in 4 min). Post-compromise, the account accessed 3 finance file shares not accessed in the past 90 days. UEBA risk score jumped from 22 → 94.',
    actions: ['Force MFA re-enroll for amy.wong', 'Reset credentials', 'Audit share access'],
    confidence: 91,
    time: '09:03 today',
    module: 'Identity + UEBA',
  },
  {
    id: 'AI-2026-039',
    priority: 'HIGH',
    priorityCls: 'hi',
    title: 'Shadow AI tool leaking source code — Cursor AI',
    summary: 'AI-SPM detected Cursor AI sending .env file contents to an external model endpoint. The file contained 3 AWS secret keys and a database connection string. Exposure window: ~8 minutes.',
    actions: ['Revoke exposed AWS keys', 'Block Cursor AI domain', 'Rotate DB credentials'],
    confidence: 87,
    time: '08:48 today',
    module: 'AI-SPM + Devices',
  },
  {
    id: 'AI-2026-038',
    priority: 'MEDIUM',
    priorityCls: 'me',
    title: 'Insider risk pattern — santosh (PIP employee)',
    summary: 'User santosh (currently on PIP) downloaded 4.2 GB from SharePoint at 02:31 AM. Combined with recent large Google Drive activity and a resignation mention in a monitored communication, Blazey AI classifies this as a potential data theft scenario.',
    actions: ['Increase monitoring', 'Restrict cloud storage access', 'Notify HR'],
    confidence: 74,
    time: '3 days ago',
    module: 'Identity + Cloud',
  },
]

const SUMMARY = [
  { label: 'AI-generated alerts', value: 8,    color: 'var(--crit)' },
  { label: 'Auto-remediated',     value: 3,    color: 'var(--ok)'   },
  { label: 'Awaiting analyst',    value: 5,    color: 'var(--high)' },
  { label: 'Avg confidence',      value: '87%', color: 'var(--info)' },
]

function ConfBar({ pct }) {
  const color = pct >= 90 ? 'var(--crit)' : pct >= 75 ? 'var(--high)' : 'var(--med)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="pb" style={{ width: 70 }}><i style={{ width: `${pct}%`, background: color }} /></div>
      <span className="mono" style={{ fontSize: 12, color, fontWeight: 600 }}>{pct}%</span>
    </div>
  )
}

export default function BlazeAITab() {
  return (
    <>
      {/* Summary strip */}
      <div className="kg k4" style={{ marginBottom: 18 }}>
        {SUMMARY.map(s => (
          <div key={s.label} className="card" style={{ padding: '18px 22px' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* AI header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16,
        background: 'linear-gradient(135deg,rgba(99,102,241,.08),rgba(139,92,246,.06))',
        border: '1px solid rgba(99,102,241,.2)', borderRadius: 10, padding: '14px 20px',
      }}>
        <div style={{ fontSize: 32 }}>🤖</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--txt)' }}>Blazey AI — Autonomous Threat Analysis</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 3 }}>
            Correlating signals across all modules in real-time · confidence threshold 0.75 · autonomous actions at 0.90+
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span className="b ok"><i />RUNNING</span>
        </div>
      </div>

      {/* Insight cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {INSIGHTS.map(ins => (
          <div key={ins.id} className="card" style={{
            borderLeft: `4px solid ${ins.priorityCls === 'cr' ? 'var(--crit)' : ins.priorityCls === 'hi' ? 'var(--high)' : 'var(--med)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className={`b ${ins.priorityCls}`}><i />{ins.priority}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{ins.id}</span>
                  <span className="ch" style={{ fontSize: 11 }}>{ins.module}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--txt3)' }}>{ins.time}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)', marginBottom: 8 }}>{ins.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--txt2)', lineHeight: 1.6 }}>{ins.summary}</div>
              </div>
              <div style={{ textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: 10, color: 'var(--txt3)', marginBottom: 4 }}>Confidence</div>
                <ConfBar pct={ins.confidence} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--txt3)', marginRight: 4 }}>Recommended actions:</span>
              {ins.actions.map(a => (
                <button key={a} className="btn p" style={{ fontSize: 11.5 }}>{a}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
