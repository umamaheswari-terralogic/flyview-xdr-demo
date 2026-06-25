import WidgetCard from '../../../components/WidgetCard.jsx'

const POSTURE_DATA = [
  { framework: 'MITRE ATT&CK', coverage: 71, color: 'var(--high)', controls: 194 },
  { framework: 'NIST CSF', coverage: 84, color: 'var(--ok)', controls: 108 },
  { framework: 'CIS Controls v8', coverage: 68, color: 'var(--high)', controls: 153 },
  { framework: 'ISO 27001', coverage: 81, color: 'var(--ok)', controls: 93 },
]

export default function PostureTab() {
  return (
    <>
      <div className="kg k4" style={{ marginBottom: 18 }}>
        <div className="kc ok"><div className="kl"><span className="klab">Posture Grade</span></div><div className="kn">B+</div><div className="kd">Overall security posture</div><div className="kf">↑ from C+ last month</div></div>
        <div className="kc hi"><div className="kl"><span className="klab">MITRE Coverage</span></div><div className="kn">71%</div><div className="kd">ATT&CK techniques covered</div><div className="kf">29% gaps remaining</div></div>
        <div className="kc cr"><div className="kl"><span className="klab">Control Gaps</span></div><div className="kn">47</div><div className="kd">Open control failures</div><div className="kf"><b>▲ +3</b> this week</div></div>
        <div className="kc in"><div className="kl"><span className="klab">Drift Events</span></div><div className="kn">12</div><div className="kd">Config drift detected</div><div className="kf">Last 7 days</div></div>
      </div>

      <div className="g3">
        {POSTURE_DATA.map(p => (
          <WidgetCard key={p.framework} title={p.framework}>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 40, fontWeight: 700, color: p.color }}>{p.coverage}%</div>
              <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>{p.controls} controls assessed</div>
            </div>
            <div className="pb">
              <i style={{ width: `${p.coverage}%`, background: p.color }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 8 }}>{100 - p.coverage}% gap remaining</div>
          </WidgetCard>
        ))}

        <WidgetCard title="Top control failures">
          {[
            { ctrl: 'CC6.1 Logical access controls', sev: 'cr' },
            { ctrl: 'CC7.2 System monitoring', sev: 'hi' },
            { ctrl: 'CC8.1 Change management', sev: 'hi' },
            { ctrl: 'A1.2 Availability monitoring', sev: 'me' },
          ].map(c => (
            <div key={c.ctrl} className="row">
              <span style={{ flex: 1, fontSize: 12 }}>{c.ctrl}</span>
              <span className={`b ${c.sev}`}><i />FAIL</span>
            </div>
          ))}
        </WidgetCard>
      </div>
    </>
  )
}
