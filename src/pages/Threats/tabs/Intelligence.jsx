import WidgetCard from '../../../components/WidgetCard.jsx'

const FEEDS = [
  { name: 'CISA KEV', type: 'Vulnerability', updated: '14 min ago', iocs: 847, status: 'ok' },
  { name: 'AlienVault OTX', type: 'Threat Intel', updated: '1h ago', iocs: 14820, status: 'ok' },
  { name: 'Abuse.ch URLhaus', type: 'Malicious URLs', updated: '6 min ago', iocs: 92441, status: 'ok' },
  { name: 'Emerging Threats', type: 'IDS Rules', updated: '2h ago', iocs: 4128, status: 'ok' },
  { name: 'Custom Feed', type: 'Internal', updated: '38 min ago', iocs: 312, status: 'hi' },
]

const IOCS = [
  { indicator: '185.220.101.x/24', type: 'IP Range', threat: 'TOR Exit Node', confidence: 94, cls: 'cr' },
  { indicator: 'evil-corp.xyz', type: 'Domain', threat: 'C2 Infrastructure', confidence: 89, cls: 'cr' },
  { indicator: 'a3f8c2d1...', type: 'File Hash', threat: 'LockBit 3.0 Dropper', confidence: 97, cls: 'cr' },
  { indicator: '34.201.x.x', type: 'IP', threat: 'Cobalt Strike Beacon', confidence: 78, cls: 'hi' },
]

export default function IntelligenceTab() {
  return (
    <>
      <div className="kg k3" style={{ marginBottom: 18 }}>
        <div className="kc ok"><div className="kl"><span className="klab">Active Feeds</span></div><div className="kn">5</div><div className="kd">Threat intel sources</div><div className="kf">All healthy</div></div>
        <div className="kc hi"><div className="kl"><span className="klab">Total IoCs</span></div><div className="kn">112K</div><div className="kd">Indicators of compromise</div><div className="kf">Updated continuously</div></div>
        <div className="kc cr"><div className="kl"><span className="klab">Matched Today</span></div><div className="kn">23</div><div className="kd">IoCs matched in environment</div><div className="kf"><b>▲ +7</b> vs yesterday</div></div>
      </div>

      <div className="g2">
        <WidgetCard title="Matched IoCs" actions={<button className="btn">Export</button>}>
          <table>
            <thead><tr>{['Indicator', 'Type', 'Threat', 'Confidence'].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {IOCS.map(ioc => (
                <tr key={ioc.indicator}>
                  <td className="mono pr">{ioc.indicator}</td>
                  <td><span className="ch">{ioc.type}</span></td>
                  <td>{ioc.threat}</td>
                  <td><span className={`b ${ioc.cls}`}><i />{ioc.confidence}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </WidgetCard>

        <WidgetCard title="Feed health">
          {FEEDS.map(f => (
            <div key={f.name} className="row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{f.type} · {f.iocs.toLocaleString()} IoCs</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--txt3)', marginRight: 8 }}>{f.updated}</div>
              <span className={`b ${f.status}`}><i />{f.status === 'ok' ? 'LIVE' : 'WARN'}</span>
            </div>
          ))}
        </WidgetCard>
      </div>
    </>
  )
}
