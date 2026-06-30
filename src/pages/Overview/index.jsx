import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeviceService }   from '../../services/DeviceService.js'
import { MonitorService }  from '../../services/MonitorService.js'
import { IdentityService } from '../../services/IdentityService.js'
import { CloudService }    from '../../services/CloudService.js'
import { NetworkService }  from '../../services/NetworkService.js'
import { PrivacyService }  from '../../services/PrivacyService.js'
import { AISPMService }    from '../../services/AISPMService.js'
import { API_BASE } from '../../config.js'

const API = API_BASE

const SEV_COLOR = { CRITICAL: 'var(--crit)', HIGH: 'var(--high)', MEDIUM: 'var(--med)', LOW: 'var(--txt3)', INFO: 'var(--txt3)' }
const SEV_CLS   = { CRITICAL: 'cr', HIGH: 'hi', MEDIUM: 'me', LOW: 'ne', INFO: 'ne' }

function KpiCard({ label, value, sub, cls, onClick }) {
  const color = cls === 'cr' ? 'var(--crit)' : cls === 'hi' ? 'var(--high)' : cls === 'ok' ? 'var(--ok)' : cls === 'me' ? 'var(--med)' : 'var(--txt1)'
  return (
    <div className="card" style={{ padding: '14px 18px', cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div style={{ fontSize: 11, color: 'var(--txt3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 5 }}>{sub}</div>}
    </div>
  )
}

function MiniBar({ label, val, total, color }) {
  const pct = total > 0 ? Math.round((val / total) * 100) : 0
  return (
    <div className="row">
      <span className="rn">{label}</span>
      <div className="pb" style={{ flex: 1 }}><i style={{ width: `${pct}%`, background: color }} /></div>
      <span className="rv" style={{ color, fontWeight: 700 }}>{val}</span>
    </div>
  )
}

function StatTile({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bg3)', borderRadius: 8 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 4, fontWeight: 600 }}>{label}</div>
    </div>
  )
}

export default function Overview() {
  const navigate = useNavigate()

  // Static data
  const [inventory, setInventory]   = useState({ devices: [] })
  const [alerts, setAlerts]         = useState([])
  const [users, setUsers]           = useState([])
  const [findings, setFindings]     = useState([])
  const [netDevices, setNetDevices] = useState([])
  const [dsars, setDsars]           = useState([])
  const [aiSummary, setAiSummary]   = useState(null)
  const [loading, setLoading]       = useState(true)

  // Live sim state
  const [liveDevices, setLiveDevices]   = useState([])
  const [chatgptDetected, setChatgpt]   = useState(false)
  const prevChatgpt = useRef(false)

  // Load all static data once
  useEffect(() => {
    Promise.all([
      DeviceService.getInventory(),
      MonitorService.getAlerts(),
      IdentityService.getUsers(),
      CloudService.getFindings(),
      NetworkService.getDevices(),
      PrivacyService.getDsars(),
      AISPMService.getSummary(),
    ]).then(([inv, al, us, fi, nd, ds, ai]) => {
      setInventory(inv)
      setAlerts(al)
      setUsers(us)
      setFindings(fi)
      setNetDevices(nd)
      setDsars(ds)
      setAiSummary(ai)
      setLoading(false)
    })
  }, [])

  // Poll devices from server every 3s (reflects device sim)
  useEffect(() => {
    const poll = () =>
      fetch(`${API}/api/devices`)
        .then(r => r.json())
        .then(({ devices }) => setLiveDevices(devices))
        .catch(() => {})
    poll()
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [])

  // Poll AI-SPM sim every 3s
  useEffect(() => {
    const poll = () =>
      fetch(`${API}/api/aispm/sim`)
        .then(r => r.json())
        .then(({ chatgptDetected }) => {
          prevChatgpt.current = chatgptDetected
          setChatgpt(chatgptDetected)
        })
        .catch(() => {})
    poll()
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [])

  if (loading) return <div className="loading-state">Loading overview…</div>

  // ── Computed values ────────────────────────────────────────────
  const devList       = liveDevices.length > 0 ? liveDevices : (inventory.devices ?? [])
  const totalDevices  = devList.length
  const compliant     = devList.filter(d => d.status === 'COMPLIANT').length
  const nonCompliant  = devList.filter(d => d.status === 'NON-COMPLIANT').length
  const atRisk        = devList.filter(d => d.status === 'AT RISK').length

  const criticalAlerts  = alerts.filter(a => a.sevCls === 'cr').length
  const highAlerts      = alerts.filter(a => a.sevCls === 'hi').length
  const recentAlerts    = alerts.slice(0, 6)

  const highRiskUsers   = users.filter(u => u.riskCls === 'cr' || u.riskCls === 'hi').length
  const mfaEnabled      = users.filter(u => u.mfa === true).length
  const mfaPct          = users.length > 0 ? Math.round((mfaEnabled / users.length) * 100) : 0
  const dormantUsers    = users.filter(u => u.status === 'DORMANT' || u.status === 'Inactive').length

  const criticalFindings = findings.filter(f => f.severity === 'CRITICAL').length
  const highFindings     = findings.filter(f => f.severity === 'HIGH').length
  const medFindings      = findings.filter(f => f.severity === 'MEDIUM').length
  const lowFindings      = findings.filter(f => f.severity === 'LOW').length

  const openDsars       = dsars.filter(d => d.status === 'OPEN' || d.status === 'IN PROGRESS').length
  const overdueDsars    = dsars.filter(d => d.status === 'OVERDUE').length

  const shadowAiCount   = aiSummary ? Number(aiSummary.shadowAI.count) + (chatgptDetected ? 1 : 0) : 0

  // Active actions table — mix of critical alerts + critical cloud findings
  const activeActions = [
    ...recentAlerts.slice(0, 3).map(a => ({
      time: a.time, event: a.description ?? a.event, asset: a.device,
      severity: a.severity ?? 'HIGH', sevCls: a.sevCls ?? 'hi', status: a.status ?? 'OPEN', module: 'Monitor',
    })),
    ...findings.filter(f => f.severity === 'CRITICAL').slice(0, 3).map(f => ({
      time: f.discoveredAt ?? '—', event: f.title, asset: f.resource ?? f.asset,
      severity: 'CRITICAL', sevCls: 'cr', status: f.status ?? 'OPEN', module: 'Cloud',
    })),
  ].slice(0, 6)

  return (
    <>
      {/* ── KPI Bar ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 18 }}>
        <KpiCard label="Non-Compliant Devices" value={nonCompliant} sub={`of ${totalDevices} total endpoints`}    cls={nonCompliant > 0 ? 'cr' : 'ok'} onClick={() => navigate('/devices')} />
        <KpiCard label="Critical Alerts"        value={criticalAlerts} sub={`${highAlerts} high severity`}         cls={criticalAlerts > 0 ? 'cr' : 'ok'} onClick={() => navigate('/monitor')} />
        <KpiCard label="High Risk Users"         value={highRiskUsers}  sub={`MFA coverage ${mfaPct}%`}            cls={highRiskUsers > 0 ? 'hi' : 'ok'}  onClick={() => navigate('/identity')} />
        <KpiCard label="Critical Cloud Findings" value={criticalFindings} sub={`${highFindings} high severity`}    cls={criticalFindings > 0 ? 'cr' : 'ok'} onClick={() => navigate('/cloud')} />
        <KpiCard label="Shadow AI Detected"      value={shadowAiCount}  sub={chatgptDetected ? '⚠ Live session detected' : `${aiSummary?.complianceGap?.count ?? 0} compliance gaps`} cls={chatgptDetected ? 'cr' : shadowAiCount > 0 ? 'hi' : 'ok'} onClick={() => navigate('/aispm')} />
        <KpiCard label="Open DSARs"              value={openDsars}      sub={overdueDsars > 0 ? `${overdueDsars} overdue` : 'All within SLA'} cls={overdueDsars > 0 ? 'cr' : openDsars > 0 ? 'hi' : 'ok'} onClick={() => navigate('/privacy')} />
      </div>

      {/* ── Row 2: Command Center + Alert Timeline + Endpoint Coverage ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 14, marginBottom: 18 }}>

        {/* Security Command Center */}
        <div className="card">
          <div className="card-h"><h3>Security Command Center</h3></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '4px 0' }}>
            {[
              { label: 'Endpoints',      val: totalDevices,      color: 'var(--ok)',   path: '/devices'  },
              { label: 'Network Assets', val: netDevices.length, color: 'var(--txt2)', path: '/network'  },
              { label: 'Cloud Assets',   val: findings.length,   color: 'var(--high)', path: '/cloud'    },
              { label: 'Identity Users', val: users.length,      color: 'var(--txt2)', path: '/identity' },
              { label: 'Active Alerts',  val: alerts.length,     color: criticalAlerts > 0 ? 'var(--crit)' : 'var(--high)', path: '/monitor' },
              { label: 'Privacy DSARs',  val: dsars.length,      color: 'var(--txt2)', path: '/privacy'  },
            ].map(t => (
              <div key={t.label} onClick={() => navigate(t.path)}
                style={{ padding: '12px 10px', background: 'var(--bg3)', borderRadius: 8, cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: t.color, fontFamily: 'JetBrains Mono, monospace' }}>{t.val}</div>
                <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 3, fontWeight: 600 }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Alert Timeline */}
        <div className="card">
          <div className="card-h"><h3>Threat Alert Timeline</h3><span className="meta">Last 24 hours</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recentAlerts.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < recentAlerts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 11, color: 'var(--txt3)', fontFamily: 'monospace', width: 42, flexShrink: 0 }}>{a.time}</span>
                <span className={`b ${a.sevCls}`} style={{ flexShrink: 0 }}><i />{a.severity ?? a.sevCls}</span>
                <span style={{ fontSize: 12, color: 'var(--txt2)', flex: 1 }}>{a.description ?? a.event}</span>
                <span style={{ fontSize: 11, color: 'var(--txt3)', flexShrink: 0 }}>{a.device}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Endpoint Protection Coverage */}
        <div className="card">
          <div className="card-h">
            <h3>Endpoint Coverage</h3>
            {nonCompliant > 0 && <span className="dot" style={{ background: 'var(--crit)' }} />}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
            <StatTile label="Compliant"     value={compliant}    color="var(--ok)"   />
            <StatTile label="Non-Compliant" value={nonCompliant} color="var(--crit)" />
            <StatTile label="At Risk"       value={atRisk}       color="var(--high)" />
            <StatTile label="Total"         value={totalDevices} color="var(--txt2)" />
          </div>
          <MiniBar label="Compliant"     val={compliant}    total={totalDevices} color="var(--ok)"   />
          <MiniBar label="Non-Compliant" val={nonCompliant} total={totalDevices} color="var(--crit)" />
          <MiniBar label="At Risk"       val={atRisk}       total={totalDevices} color="var(--high)" />
        </div>
      </div>

      {/* ── Row 3: Identity + Cloud + AI-SPM ─────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 18 }}>

        {/* Identity Security Posture */}
        <div className="card">
          <div className="card-h"><h3>Identity Security Posture</h3><button className="btn" onClick={() => navigate('/identity')}>View</button></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
            <StatTile label="High Risk Users" value={highRiskUsers} color="var(--crit)" />
            <StatTile label="MFA Coverage"    value={`${mfaPct}%`} color={mfaPct >= 90 ? 'var(--ok)' : 'var(--high)'} />
            <StatTile label="Dormant Users"   value={dormantUsers}  color="var(--high)" />
          </div>
          <MiniBar label="MFA enabled"  val={mfaEnabled}              total={users.length} color="var(--ok)"   />
          <MiniBar label="High risk"    val={highRiskUsers}            total={users.length} color="var(--crit)" />
          <MiniBar label="Dormant"      val={dormantUsers}             total={users.length} color="var(--high)" />
        </div>

        {/* Cloud Security Posture */}
        <div className="card">
          <div className="card-h"><h3>Cloud Security Posture</h3><button className="btn" onClick={() => navigate('/cloud')}>View</button></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
            <StatTile label="Critical" value={criticalFindings} color="var(--crit)" />
            <StatTile label="High"     value={highFindings}     color="var(--high)" />
            <StatTile label="Medium"   value={medFindings}      color="var(--med)"  />
            <StatTile label="Low"      value={lowFindings}      color="var(--txt3)" />
          </div>
          <MiniBar label="Critical" val={criticalFindings} total={findings.length} color="var(--crit)" />
          <MiniBar label="High"     val={highFindings}     total={findings.length} color="var(--high)" />
          <MiniBar label="Medium"   val={medFindings}      total={findings.length} color="var(--med)"  />
        </div>

        {/* AI Shadow Monitor */}
        <div className="card" style={{ border: chatgptDetected ? '1px solid var(--high)' : '1px solid var(--border)', transition: 'border-color .3s' }}>
          <div className="card-h">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {chatgptDetected && <span className="dot" style={{ background: 'var(--high)' }} />}
              AI Shadow Monitor
            </h3>
            <button className="btn" onClick={() => navigate('/aispm')}>View</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
            <StatTile label="Shadow AI Tools"   value={shadowAiCount}                                          color="var(--high)" />
            <StatTile label="Live Detections"   value={chatgptDetected ? 1 : 0}                                color={chatgptDetected ? 'var(--crit)' : 'var(--txt3)'} />
            <StatTile label="Compliance Gaps"   value={aiSummary?.complianceGap?.count ?? 0}                   color="var(--high)" />
            <StatTile label="Critical Risk"     value={aiSummary?.criticalRisk?.count ?? 0}                    color="var(--crit)" />
          </div>
          {chatgptDetected && (
            <div style={{ padding: '8px 12px', background: 'rgba(245,158,11,.08)', borderRadius: 6, border: '1px solid rgba(245,158,11,.25)', fontSize: 11, color: 'var(--high)', fontWeight: 600 }}>
              ⚠ chatgpt.com session detected · LT-VyshnaviT-3941
            </div>
          )}
          {!chatgptDetected && (
            <div style={{ fontSize: 11, color: 'var(--txt3)', lineHeight: 1.6 }}>
              Monitoring for unauthorized AI tool usage across all endpoints.
            </div>
          )}
        </div>
      </div>

      {/* ── Row 4: Active Cybersecurity Actions ──────────────────── */}
      <div className="card">
        <div className="card-h">
          <h3>Active Cybersecurity Actions</h3>
          <span className="meta">{activeActions.length} items requiring attention</span>
        </div>
        <table>
          <thead>
            <tr>{['Time', 'Event', 'Asset', 'Module', 'Severity', 'Status'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {activeActions.map((a, i) => (
              <tr key={i}>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.time}</td>
                <td style={{ fontSize: 12, fontWeight: 500 }}>{a.event}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{a.asset}</td>
                <td><span className="ch">{a.module}</span></td>
                <td><span className={`b ${a.sevCls}`}><i />{a.severity}</span></td>
                <td>
                  <span style={{ fontSize: 11, fontWeight: 600, color: a.status === 'OPEN' ? 'var(--crit)' : a.status === 'ACK' ? 'var(--high)' : 'var(--ok)' }}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
