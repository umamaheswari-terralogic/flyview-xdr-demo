import { useState } from 'react'

const INTEL = [
  { ioc: '185.220.101.47',       type: 'IP · Tor exit node',       feed: 'AlienVault OTX', sev: 'HIGH',     sevCls: 'hi', matches: 3, last: '12h ago', blocked: false },
  { ioc: 'a3f5c9...e21b',        type: 'SHA-256 · Ransomware DLL', feed: 'VirusTotal',     sev: 'CRITICAL', sevCls: 'cr', matches: 1, last: '2h ago',  blocked: true  },
  { ioc: 'evil-c2-domain.xyz',   type: 'Domain · C2 server',       feed: 'Abuse.ch',       sev: 'CRITICAL', sevCls: 'cr', matches: 2, last: '1d ago',  blocked: true  },
  { ioc: 'CVE-2026-1337',        type: 'CVE · RCE (EPSS 0.81)',    feed: 'NVD',            sev: 'HIGH',     sevCls: 'hi', matches: 23, last: '6h ago', blocked: false },
  { ioc: '45.142.212.0/24',      type: 'IP range · Scanner',       feed: 'GreyNoise',      sev: 'MEDIUM',   sevCls: 'me', matches: 8, last: '3h ago',  blocked: false },
  { ioc: 'malware-dropper.ru',   type: 'Domain · Dropper C2',      feed: 'Abuse.ch',       sev: 'CRITICAL', sevCls: 'cr', matches: 0, last: '4d ago',  blocked: true  },
  { ioc: 'CVE-2026-0922',        type: 'CVE · Chrome RCE',         feed: 'NVD',            sev: 'HIGH',     sevCls: 'hi', matches: 156, last: '8h ago', blocked: false },
  { ioc: '91.121.55.x',          type: 'IP · Phishing infra',      feed: 'AlienVault OTX', sev: 'HIGH',     sevCls: 'hi', matches: 1, last: '18h ago', blocked: false },
]

const FEEDS = [
  { name: 'AlienVault OTX',  iocs: 1847, active: 312, updated: '5 min ago',  status: 'HEALTHY', statusCls: 'ok' },
  { name: 'VirusTotal',      iocs: 4221, active: 891, updated: '2 min ago',  status: 'HEALTHY', statusCls: 'ok' },
  { name: 'Abuse.ch',        iocs: 2103, active: 407, updated: '8 min ago',  status: 'HEALTHY', statusCls: 'ok' },
  { name: 'GreyNoise',       iocs: 982,  active: 214, updated: '1 min ago',  status: 'HEALTHY', statusCls: 'ok' },
  { name: 'NVD (CVE)',       iocs: 312,  active: 89,  updated: '1h ago',     status: 'HEALTHY', statusCls: 'ok' },
  { name: 'MISP (Internal)', iocs: 55,   active: 22,  updated: '24h ago',    status: 'STALE',   statusCls: 'hi' },
]

export default function ThreatIntelTab() {
  const [filter, setFilter] = useState('All')

  const filtered = INTEL.filter(i => {
    if (filter === 'Matched')  return i.matches > 0
    if (filter === 'Blocked')  return i.blocked
    if (filter === 'CRITICAL') return i.sev === 'CRITICAL'
    return true
  })

  const matched  = INTEL.filter(i => i.matches > 0).length
  const blocked  = INTEL.filter(i => i.blocked).length
  const totalIoC = FEEDS.reduce((s, f) => s + f.active, 0)

  return (
    <>
      <div className="kg k3" style={{ marginBottom: 18 }}>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--crit)' }}>{matched}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>IoCs matched in environment</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ok)' }}>{blocked}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Indicators blocked</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--info)' }}>{totalIoC.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Active IoCs across {FEEDS.length} feeds</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>IoC Matches — Threat Intelligence
            <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>AlienVault OTX · VirusTotal · Abuse.ch · GreyNoise · NVD</span>
          </h3>
          <div className="seg">
            {['All', 'Matched', 'Blocked', 'CRITICAL'].map(f => (
              <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
        <table>
          <thead>
            <tr>{['Indicator', 'Type', 'Feed', 'Severity', 'Env Matches', 'Last Seen', 'Blocked', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.ioc}>
                <td className="mono pr" style={{ fontSize: 12 }}>{i.ioc}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{i.type}</td>
                <td><span className="ch">{i.feed}</span></td>
                <td><span className={`b ${i.sevCls}`}><i />{i.sev}</span></td>
                <td className="mono" style={{ color: i.matches > 0 ? 'var(--high)' : 'var(--txt3)', fontWeight: i.matches > 0 ? 700 : 400 }}>{i.matches}</td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{i.last}</td>
                <td>
                  {i.blocked
                    ? <span className="b ok"><i />BLOCKED</span>
                    : <span style={{ fontSize: 11, color: 'var(--txt3)' }}>—</span>}
                </td>
                <td>
                  <div className="brow">
                    {!i.blocked && <button className="btn d">Block</button>}
                    <button className="btn">Watchlist</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-h"><h3>Feed health</h3><span className="meta">6 intelligence feeds · auto-refresh</span></div>
        <table>
          <thead>
            <tr>{['Feed', 'Total IoCs', 'Active', 'Last Updated', 'Status'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {FEEDS.map(f => (
              <tr key={f.name}>
                <td className="pr">{f.name}</td>
                <td className="mono">{f.iocs.toLocaleString()}</td>
                <td className="mono" style={{ color: 'var(--info)' }}>{f.active}</td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{f.updated}</td>
                <td><span className={`b ${f.statusCls}`}><i />{f.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
