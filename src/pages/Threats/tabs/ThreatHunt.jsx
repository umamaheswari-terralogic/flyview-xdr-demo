import { useState } from 'react'

const HUNTS = [
  { id: 'HNT-2026-011', name: 'Ransomware pre-encryption staging',     analyst: 'sarah.kim',  status: 'ACTIVE',    statusCls: 'cr', technique: 'T1486',        started: '09:00 today', findings: 3, priority: 'CRITICAL', sevCls: 'cr' },
  { id: 'HNT-2026-010', name: 'Living-off-the-land (LOL) binaries',    analyst: 'r.lee',      status: 'ACTIVE',    statusCls: 'cr', technique: 'T1218',        started: '2h ago',      findings: 1, priority: 'HIGH',     sevCls: 'hi' },
  { id: 'HNT-2026-009', name: 'Credential access via LSASS dump',      analyst: 'sarah.kim',  status: 'COMPLETED', statusCls: 'ok', technique: 'T1003.001',    started: 'Yesterday',   findings: 0, priority: 'HIGH',     sevCls: 'hi' },
  { id: 'HNT-2026-008', name: 'Domain fronting C2 channels',           analyst: 'mike.chen',  status: 'COMPLETED', statusCls: 'ok', technique: 'T1090.004',    started: '3 days ago',  findings: 2, priority: 'HIGH',     sevCls: 'hi' },
  { id: 'HNT-2026-007', name: 'Insider exfil via cloud storage',       analyst: 'r.lee',      status: 'COMPLETED', statusCls: 'ok', technique: 'T1567',        started: '4 days ago',  findings: 1, priority: 'HIGH',     sevCls: 'hi' },
  { id: 'HNT-2026-006', name: 'Shadow IT SaaS OAuth grants',           analyst: 'sarah.kim',  status: 'COMPLETED', statusCls: 'ok', technique: 'T1550.001',    started: '5 days ago',  findings: 4, priority: 'MEDIUM',   sevCls: 'me' },
]

const HYPOTHESES = [
  { id: 'HYP-041', hyp: 'Attacker used Windows scheduled tasks for persistence post-initial-access on WIN-FIN-04',   status: 'INVESTIGATING', sevCls: 'hi'  },
  { id: 'HYP-040', hyp: 'LOL binary (certutil.exe) used to download secondary payload on CORP-WRK-218',             status: 'CONFIRMED',     sevCls: 'cr'  },
  { id: 'HYP-039', hyp: 'Outbound DNS queries to *.evil-c2-domain.xyz are tunneled C2 traffic',                     status: 'CONFIRMED',     sevCls: 'cr'  },
  { id: 'HYP-038', hyp: 'contractor-mjones lateral-moved to finance share after initial login',                      status: 'REFUTED',       sevCls: 'ok'  },
  { id: 'HYP-037', hyp: 'amy.wong account was used as pivot after brute-force success',                             status: 'INVESTIGATING', sevCls: 'hi'  },
]

const HYP_CLS = { INVESTIGATING: 'hi', CONFIRMED: 'cr', REFUTED: 'ok' }

export default function ThreatHuntTab() {
  const [filter, setFilter] = useState('All')

  const filtered = HUNTS.filter(h => filter === 'All' || h.status === filter)
  const activeCount = HUNTS.filter(h => h.status === 'ACTIVE').length

  return (
    <>
      <div className="kg k3" style={{ marginBottom: 18 }}>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--crit)' }}>{activeCount}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Active hunt operations</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--high)' }}>{HUNTS.filter(h => h.findings > 0).length}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Hunts with confirmed findings</div>
        </div>
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--info)' }}>{HUNTS.reduce((s, h) => s + h.findings, 0)}</div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 4 }}>Total findings this week</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>Hunt Operations
            <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>MITRE ATT&CK mapped · analyst-led</span>
          </h3>
          <div style={{ display: 'flex', gap: 6 }}>
            <div className="seg">
              {['All', 'ACTIVE', 'COMPLETED'].map(f => (
                <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
            <button className="btn p">+ New hunt</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>{['Hunt ID', 'Name', 'Priority', 'ATT&CK', 'Analyst', 'Started', 'Findings', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(h => (
              <tr key={h.id}>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{h.id}</td>
                <td className="pr">{h.name}</td>
                <td><span className={`b ${h.sevCls}`}><i />{h.priority}</span></td>
                <td><span className="ch" style={{ fontFamily: 'monospace' }}>{h.technique}</span></td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{h.analyst}</td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{h.started}</td>
                <td className="mono" style={{ color: h.findings > 0 ? 'var(--high)' : 'var(--txt3)', fontWeight: h.findings > 0 ? 700 : 400 }}>{h.findings}</td>
                <td><span className={`b ${h.statusCls}`}><i />{h.status}</span></td>
                <td>
                  <div className="brow">
                    <button className="btn p">Open</button>
                    {h.status === 'ACTIVE' && <button className="btn">Complete</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-h"><h3>Hunt hypotheses</h3><span className="meta">Structured investigation log</span></div>
        <table>
          <thead>
            <tr>{['ID', 'Hypothesis', 'Status', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {HYPOTHESES.map(h => (
              <tr key={h.id}>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{h.id}</td>
                <td style={{ fontSize: 12.5, color: 'var(--txt2)', maxWidth: 480 }}>{h.hyp}</td>
                <td><span className={`b ${HYP_CLS[h.status]}`}><i />{h.status}</span></td>
                <td><div className="brow"><button className="btn">Evidence</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
