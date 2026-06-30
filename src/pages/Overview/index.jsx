import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldAlert, ShieldCheck, ShieldX, Bell, Users, Cloud,
  Bot, FileText, Monitor, Wifi, Server, Lock,
  TrendingUp, AlertTriangle, CheckCircle2, Clock,
  Activity, Cpu, Eye, Layers, Globe, UserX,
} from 'lucide-react'
import { DeviceService }   from '../../services/DeviceService.js'
import { MonitorService }  from '../../services/MonitorService.js'
import { IdentityService } from '../../services/IdentityService.js'
import { CloudService }    from '../../services/CloudService.js'
import { NetworkService }  from '../../services/NetworkService.js'
import { PrivacyService }  from '../../services/PrivacyService.js'
import { AISPMService }    from '../../services/AISPMService.js'
import { API_BASE } from '../../config.js'

const API = API_BASE

// ── Tiny sparkline ────────────────────────────────────────────────
function Spark({ color }) {
  return (
    <svg width="80" height="24" viewBox="0 0 80 24" fill="none"
      style={{ position: 'absolute', bottom: 10, right: 12, opacity: .4 }}>
      <polyline points="0,18 12,14 24,16 36,8 48,12 60,6 72,10 80,4"
        stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── KPI card ──────────────────────────────────────────────────────
function KpiCard({ Icon, label, value, sub, accent, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--card)', borderRadius: 12, padding: '16px 16px 14px',
      cursor: onClick ? 'pointer' : 'default', position: 'relative', overflow: 'hidden',
      border: `1px solid var(--border)`, borderTop: `3px solid ${accent}`,
      display: 'flex', flexDirection: 'column', gap: 8,
      transition: 'box-shadow .2s, transform .15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 24px ${accent}28`; e.currentTarget.style.transform = 'translateY(-1px)' }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 10, color: 'var(--txt3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .9 }}>{label}</div>
        <div style={{
          width: 34, height: 34, borderRadius: 9, background: `${accent}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={17} color={accent} strokeWidth={2} />
        </div>
      </div>
      <div style={{ fontSize: 34, fontWeight: 900, color: accent, lineHeight: 1, fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{sub}</div>}
      <Spark color={accent} />
    </div>
  )
}

// ── Section header with number badge ─────────────────────────────
function SectionTitle({ n, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <div style={{
        width: 22, height: 22, borderRadius: 6, background: 'var(--purple)',
        color: '#fff', fontSize: 11, fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{n}</div>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--txt)' }}>{title}</span>
    </div>
  )
}

// ── Colored command center tile ───────────────────────────────────
function CmdTile({ label, value, bg, Icon, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: bg, borderRadius: 10, padding: '14px 12px',
      cursor: 'pointer', textAlign: 'center', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 78, gap: 4, transition: 'opacity .15s, transform .15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.opacity = '.88'; e.currentTarget.style.transform = 'scale(1.02)' }}
    onMouseLeave={e => { e.currentTarget.style.opacity = '1';   e.currentTarget.style.transform = 'scale(1)' }}
    >
      <Icon size={20} color="rgba(255,255,255,.85)" strokeWidth={1.8} />
      <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.75)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .7 }}>{label}</div>
    </div>
  )
}

// ── Severity row bar ──────────────────────────────────────────────
function SevBar({ label, val, total, color }) {
  const pct = total > 0 ? Math.round((val / total) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0,
      }} />
      <span style={{ fontSize: 11, color: 'var(--txt2)', width: 72, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width .6s ease' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, width: 24, textAlign: 'right' }}>{val}</span>
    </div>
  )
}

// ── Stat box (identity / cloud panels) ───────────────────────────
function StatBox({ label, value, color, Icon }) {
  return (
    <div style={{
      background: `${color}10`, border: `1px solid ${color}28`,
      borderRadius: 10, padding: '11px 8px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
    }}>
      {Icon && <Icon size={16} color={color} strokeWidth={2} style={{ opacity: .85 }} />}
      <div style={{ fontSize: 22, fontWeight: 900, color, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 9, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, opacity: .75 }}>{label}</div>
    </div>
  )
}

// ── Alert severity pill for timeline ─────────────────────────────
const SEV_CFG = {
  CRITICAL: { bg: 'var(--crit)', lbl: 'Critical' },
  HIGH:     { bg: 'var(--high)', lbl: 'High'     },
  MEDIUM:   { bg: 'var(--med)',  lbl: 'Medium'   },
  LOW:      { bg: 'var(--ok)',   lbl: 'Low'       },
  INFO:     { bg: 'var(--txt3)', lbl: 'Info'      },
}

export default function Overview() {
  const navigate = useNavigate()

  const [inventory, setInventory]   = useState({ devices: [] })
  const [alerts, setAlerts]         = useState([])
  const [users, setUsers]           = useState([])
  const [findings, setFindings]     = useState([])
  const [netDevices, setNetDevices] = useState([])
  const [dsars, setDsars]           = useState([])
  const [aiSummary, setAiSummary]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [liveDevices, setLiveDevices]   = useState([])
  const [chatgptDetected, setChatgpt]   = useState(false)

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
      setInventory(inv); setAlerts(al); setUsers(us); setFindings(fi)
      setNetDevices(nd); setDsars(ds); setAiSummary(ai); setLoading(false)
    })
  }, [])

  useEffect(() => {
    const poll = () => fetch(`${API}/api/devices`).then(r => r.json()).then(({ devices }) => setLiveDevices(devices)).catch(() => {})
    poll(); const id = setInterval(poll, 3000); return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const poll = () => fetch(`${API}/api/aispm/sim`).then(r => r.json()).then(({ chatgptDetected }) => setChatgpt(chatgptDetected)).catch(() => {})
    poll(); const id = setInterval(poll, 3000); return () => clearInterval(id)
  }, [])

  if (loading) return <div className="loading-state">Loading overview…</div>

  // ── Computed ──────────────────────────────────────────────────
  const devList        = liveDevices.length > 0 ? liveDevices : (inventory.devices ?? [])
  const totalDevices   = devList.length
  const compliant      = devList.filter(d => d.status === 'COMPLIANT').length
  const nonCompliant   = devList.filter(d => d.status === 'NON-COMPLIANT').length
  const atRisk         = devList.filter(d => d.status === 'AT RISK').length
  const criticalAlerts = alerts.filter(a => a.sevCls === 'cr').length
  const highAlerts     = alerts.filter(a => a.sevCls === 'hi').length
  const recentAlerts   = alerts.slice(0, 6)
  const highRiskUsers  = users.filter(u => u.riskCls === 'cr' || u.riskCls === 'hi').length
  const mfaEnabled     = users.filter(u => u.mfa === true).length
  const mfaPct         = users.length > 0 ? Math.round((mfaEnabled / users.length) * 100) : 0
  const dormantUsers   = users.filter(u => u.status === 'DORMANT' || u.status === 'Inactive').length
  const criticalFindings = findings.filter(f => f.severity === 'CRITICAL').length
  const highFindings     = findings.filter(f => f.severity === 'HIGH').length
  const medFindings      = findings.filter(f => f.severity === 'MEDIUM').length
  const lowFindings      = findings.filter(f => f.severity === 'LOW').length
  const openDsars        = dsars.filter(d => d.status === 'OPEN' || d.status === 'IN PROGRESS').length
  const overdueDsars     = dsars.filter(d => d.status === 'OVERDUE').length
  const shadowAiCount    = aiSummary ? Number(aiSummary.shadowAI.count) + (chatgptDetected ? 1 : 0) : 0

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

  const STATUS_CLR = { OPEN: 'var(--crit)', ACK: 'var(--high)', RESOLVED: 'var(--ok)', 'IN PROGRESS': 'var(--high)' }

  return (
    <>
      {/* ── KPI Strip ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 22 }}>
        <KpiCard Icon={ShieldX}     label="Non-Compliant Devices"  value={nonCompliant}     sub={`of ${totalDevices} endpoints`}      accent="var(--crit)" onClick={() => navigate('/devices')}  />
        <KpiCard Icon={Bell}        label="Critical Alerts"         value={criticalAlerts}   sub={`${highAlerts} high severity`}        accent="var(--crit)" onClick={() => navigate('/monitor')}  />
        <KpiCard Icon={UserX}       label="High Risk Users"          value={highRiskUsers}    sub={`MFA coverage ${mfaPct}%`}           accent="var(--high)" onClick={() => navigate('/identity')} />
        <KpiCard Icon={Cloud}       label="Critical Cloud Findings"  value={criticalFindings} sub={`${highFindings} high severity`}     accent="var(--high)" onClick={() => navigate('/cloud')}    />
        <KpiCard Icon={Bot}         label="Shadow AI Detected"       value={shadowAiCount}    sub={chatgptDetected ? '⚠ Live session' : `${aiSummary?.complianceGap?.count ?? 0} gaps`} accent={chatgptDetected ? 'var(--crit)' : 'var(--purple)'} onClick={() => navigate('/aispm')} />
        <KpiCard Icon={FileText}    label="Open DSARs"               value={openDsars}        sub={overdueDsars > 0 ? `${overdueDsars} overdue` : 'All within SLA'} accent={overdueDsars > 0 ? 'var(--crit)' : 'var(--ok)'} onClick={() => navigate('/privacy')} />
      </div>

      {/* ── Row A: Command Center + 4 stat panels ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>

        {/* 1. Security Command Center */}
        <div className="card" style={{ padding: 14 }}>
          <SectionTitle n="1" title="Command Center" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            <CmdTile label="Endpoints"      value={totalDevices}      Icon={Monitor}      bg="linear-gradient(135deg,#16a34a,#15803d)" onClick={() => navigate('/devices')}  />
            <CmdTile label="Network"        value={netDevices.length} Icon={Wifi}         bg="linear-gradient(135deg,#2563eb,#1d4ed8)" onClick={() => navigate('/network')}  />
            <CmdTile label="Cloud"          value={findings.length}   Icon={Cloud}        bg="linear-gradient(135deg,#d97706,#b45309)" onClick={() => navigate('/cloud')}    />
            <CmdTile label="Identity"       value={users.length}      Icon={Users}        bg="linear-gradient(135deg,#7c3aed,#6d28d9)" onClick={() => navigate('/identity')} />
            <CmdTile label="Alerts"         value={alerts.length}     Icon={ShieldAlert}  bg={criticalAlerts > 0 ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : 'linear-gradient(135deg,#16a34a,#15803d)'} onClick={() => navigate('/monitor')}  />
            <CmdTile label="DSARs"          value={dsars.length}      Icon={Lock}         bg="linear-gradient(135deg,#0891b2,#0e7490)" onClick={() => navigate('/privacy')}  />
          </div>
        </div>

        {/* 2. Endpoint Coverage */}
        <div className="card" style={{ padding: 14 }}>
          <SectionTitle n="2" title="Endpoint Coverage" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 12 }}>
            <StatBox label="Protected"     value={compliant}    color="var(--ok)"   Icon={ShieldCheck}   />
            <StatBox label="Non-Compliant" value={nonCompliant} color="var(--crit)" Icon={ShieldX}       />
            <StatBox label="At Risk"       value={atRisk}       color="var(--high)" Icon={AlertTriangle} />
            <StatBox label="Total Fleet"   value={totalDevices} color="var(--txt2)" Icon={Monitor}       />
          </div>
          <SevBar label="Protected"  val={compliant}    total={totalDevices} color="var(--ok)"   />
          <SevBar label="Non-Compl." val={nonCompliant} total={totalDevices} color="var(--crit)" />
          <SevBar label="At Risk"    val={atRisk}       total={totalDevices} color="var(--high)" />
        </div>

        {/* 3. Identity Posture */}
        <div className="card" style={{ padding: 14, cursor: 'pointer' }} onClick={() => navigate('/identity')}>
          <SectionTitle n="3" title="Identity Posture" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 12 }}>
            <StatBox label="High Risk"    value={highRiskUsers} color="var(--crit)" Icon={ShieldAlert} />
            <StatBox label="MFA Coverage" value={`${mfaPct}%`} color={mfaPct >= 90 ? 'var(--ok)' : 'var(--high)'} Icon={Lock} />
            <StatBox label="Dormant"      value={dormantUsers}  color="var(--high)" Icon={Clock}       />
            <StatBox label="Total Users"  value={users.length}  color="var(--txt2)" Icon={Users}       />
          </div>
          <SevBar label="MFA on"    val={mfaEnabled}   total={users.length} color="var(--ok)"   />
          <SevBar label="High risk" val={highRiskUsers} total={users.length} color="var(--crit)" />
          <SevBar label="Dormant"   val={dormantUsers}  total={users.length} color="var(--high)" />
        </div>

        {/* 4. Cloud Posture */}
        <div className="card" style={{ padding: 14, cursor: 'pointer' }} onClick={() => navigate('/cloud')}>
          <SectionTitle n="4" title="Cloud Posture" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 12 }}>
            <StatBox label="Critical" value={criticalFindings} color="var(--crit)" Icon={ShieldX}       />
            <StatBox label="High"     value={highFindings}     color="var(--high)" Icon={ShieldAlert}   />
            <StatBox label="Medium"   value={medFindings}      color="var(--med)"  Icon={AlertTriangle} />
            <StatBox label="Low"      value={lowFindings}      color="var(--txt3)" Icon={Eye}           />
          </div>
          <SevBar label="Critical" val={criticalFindings} total={findings.length} color="var(--crit)" />
          <SevBar label="High"     val={highFindings}     total={findings.length} color="var(--high)" />
          <SevBar label="Medium"   val={medFindings}      total={findings.length} color="var(--med)"  />
        </div>

        {/* 5. AI Shadow Monitor */}
        <div className="card" style={{
          padding: 14, cursor: 'pointer',
          border: chatgptDetected ? '1px solid var(--high)' : '1px solid var(--border)',
          transition: 'border-color .3s',
        }} onClick={() => navigate('/aispm')}>
          <SectionTitle n="5" title="AI Shadow Monitor" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 12 }}>
            <StatBox label="Shadow AI"   value={shadowAiCount}                        color="var(--high)"  Icon={Bot}         />
            <StatBox label="Live Detect" value={chatgptDetected ? 1 : 0}              color={chatgptDetected ? 'var(--crit)' : 'var(--txt3)'} Icon={Activity} />
            <StatBox label="Gaps"        value={aiSummary?.complianceGap?.count ?? 0} color="var(--high)"  Icon={Layers}      />
            <StatBox label="Critical"    value={aiSummary?.criticalRisk?.count ?? 0}  color="var(--crit)"  Icon={ShieldAlert} />
          </div>
          {chatgptDetected ? (
            <div style={{ padding: '6px 10px', background: 'rgba(245,158,11,.1)', borderRadius: 6, border: '1px solid rgba(245,158,11,.3)', fontSize: 11, color: 'var(--high)', fontWeight: 600 }}>
              ⚠ chatgpt.com session detected · LT-VyshnaviT-3941
            </div>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--txt3)', lineHeight: 1.6 }}>
              Monitoring unauthorised AI tool usage across endpoints.
            </div>
          )}
        </div>
      </div>

      {/* ── Row B: Threat Alert Timeline (full width) ─────────────── */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <SectionTitle n="6" title="Threat Alert Timeline" />
          <span style={{ fontSize: 11, color: 'var(--txt3)', marginTop: -12 }}>Last 24 hours</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0 32px' }}>
          {recentAlerts.map((a, i) => {
            const cfg = SEV_CFG[a.severity] ?? SEV_CFG.HIGH
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 10.5, color: 'var(--txt3)', fontFamily: 'monospace', width: 36, flexShrink: 0 }}>{a.time}</span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.bg, flexShrink: 0, boxShadow: `0 0 5px ${cfg.bg}` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: cfg.bg }}>{cfg.lbl}</div>
                  <div style={{ fontSize: 11, color: 'var(--txt2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.description ?? a.event}</div>
                  {a.device && <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 1 }}>{a.device}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Row C: Active Cybersecurity Actions ───────────────────── */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <SectionTitle n="7" title="Active Cybersecurity Actions" />

          <span style={{ fontSize: 11, color: 'var(--txt3)', marginTop: -12 }}>{activeActions.length} items requiring attention</span>
        </div>
        <table>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              {['Time', 'Event', 'Asset', 'Module', 'Severity', 'Status'].map(h => (
                <th key={h} style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: .6, padding: '8px 12px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeActions.map((a, i) => (
              <tr key={i} style={{ borderLeft: `3px solid ${a.sevCls === 'cr' ? 'var(--crit)' : a.sevCls === 'hi' ? 'var(--high)' : 'var(--med)'}` }}>
                <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.time}</td>
                <td style={{ fontSize: 12, fontWeight: 600 }}>{a.event}</td>
                <td style={{ fontSize: 12, color: 'var(--txt2)' }}>{a.asset}</td>
                <td><span className="ch">{a.module}</span></td>
                <td><span className={`b ${a.sevCls}`}><i />{a.severity}</span></td>
                <td>
                  <span style={{
                    display: 'inline-block', fontSize: 10, fontWeight: 700,
                    padding: '2px 10px', borderRadius: 20,
                    background: `${STATUS_CLR[a.status] ?? 'var(--txt3)'}18`,
                    color: STATUS_CLR[a.status] ?? 'var(--txt3)',
                    border: `1px solid ${STATUS_CLR[a.status] ?? 'var(--txt3)'}30`,
                  }}>
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
