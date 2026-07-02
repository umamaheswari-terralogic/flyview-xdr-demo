import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldAlert, ShieldCheck, ShieldX, Bell, Users, Cloud,
  Bot, FileText, Monitor, Wifi, Lock, AlertTriangle,
  Activity, Eye, Layers, UserX, Clock, ArrowUpRight,
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

const SEV_CFG = {
  CRITICAL: { color: '#ef4444', label: 'Critical' },
  HIGH:     { color: '#f59e0b', label: 'High'     },
  MEDIUM:   { color: '#eab308', label: 'Medium'   },
  LOW:      { color: '#22c55e', label: 'Low'       },
  INFO:     { color: '#94a3b8', label: 'Info'      },
}

const STATUS_CLR = {
  OPEN: '#ef4444', ACK: '#f59e0b', RESOLVED: '#22c55e', 'IN PROGRESS': '#f59e0b',
}

// ── Gradient KPI card ─────────────────────────────────────────────
function KpiCard({ Icon, label, value, sub, grad, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: grad, borderRadius: 16, padding: '20px 18px',
      cursor: 'pointer', position: 'relative', overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,.18)',
      transition: 'transform .18s, box-shadow .18s',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,.28)' }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,.18)' }}
    >
      {/* Background decorative circle */}
      <div style={{
        position: 'absolute', right: -18, top: -18,
        width: 90, height: 90, borderRadius: '50%',
        background: 'rgba(255,255,255,.08)',
      }} />
      <div style={{
        position: 'absolute', right: 14, bottom: -24,
        width: 60, height: 60, borderRadius: '50%',
        background: 'rgba(255,255,255,.06)',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.7)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
        <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 8, padding: 6, display: 'flex' }}>
          <Icon size={15} color="#fff" strokeWidth={2.2} />
        </div>
      </div>
      <div style={{ fontSize: 38, fontWeight: 900, color: '#fff', lineHeight: 1, fontFamily: 'JetBrains Mono, monospace', position: 'relative' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', position: 'relative' }}>{sub}</div>}
    </div>
  )
}

// ── Command center tile ───────────────────────────────────────────
function CmdTile({ label, value, Icon, color, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--bg3)', border: `1px solid ${color}30`,
      borderRadius: 14, padding: '18px 12px', cursor: 'pointer',
      textAlign: 'center', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 8,
      transition: 'background .2s, border-color .2s, transform .15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = `${color}12`; e.currentTarget.style.borderColor = `${color}70`; e.currentTarget.style.transform = 'translateY(-3px)' }}
    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.borderColor = `${color}30`; e.currentTarget.style.transform = 'none' }}
    >
      <div style={{ background: `${color}20`, borderRadius: 12, padding: 10, display: 'flex' }}>
        <Icon size={24} color={color} strokeWidth={1.8} />
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--txt)', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: 'var(--txt3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .7 }}>{label}</div>
    </div>
  )
}

// ── Panel card wrapper ────────────────────────────────────────────
function Panel({ title, Icon, iconColor, children, onClick, alert }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--card)', borderRadius: 14,
      border: alert ? `1px solid ${alert}40` : '1px solid var(--border)',
      overflow: 'hidden', cursor: onClick ? 'pointer' : 'default',
      boxShadow: '0 2px 12px rgba(0,0,0,.08)',
      transition: 'box-shadow .2s, transform .15s',
      display: 'flex', flexDirection: 'column',
    }}
    onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,.14)', e.currentTarget.style.transform = 'translateY(-1px)')}
    onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.08)', e.currentTarget.style.transform = 'none')}
    >
      {/* Header strip */}
      <div style={{
        padding: '12px 16px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: `${iconColor}18`, borderRadius: 7, padding: '5px 6px', display: 'flex' }}>
            <Icon size={13} color={iconColor} strokeWidth={2.2} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--txt)' }}>{title}</span>
        </div>
        {onClick && <ArrowUpRight size={13} color="var(--txt3)" />}
      </div>
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>{children}</div>
    </div>
  )
}

// ── Stat row inside panels ────────────────────────────────────────
function StatRow({ Icon, label, value, color, pct, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{ background: `${color}15`, borderRadius: 6, padding: '4px 5px', display: 'flex', flexShrink: 0 }}>
        <Icon size={12} color={color} strokeWidth={2.2} />
      </div>
      <span style={{ fontSize: 11.5, color: 'var(--txt2)', flex: 1 }}>{label}</span>
      {total !== undefined && (
        <div style={{ width: 64, height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden', marginRight: 6 }}>
          <div style={{ width: `${total > 0 ? Math.round((value / total) * 100) : 0}%`, height: '100%', background: color, borderRadius: 2, transition: 'width .6s ease' }} />
        </div>
      )}
      <span style={{ fontSize: 13, fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace', minWidth: 28, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export default function Overview() {
  const navigate = useNavigate()

  const [inventory, setInventory]       = useState({ devices: [] })
  const [deviceMetrics, setDevMetrics]  = useState(null)
  const [alerts, setAlerts]             = useState([])
  const [users, setUsers]               = useState([])
  const [identitySummary, setIdSummary] = useState(null)
  const [findings, setFindings]         = useState([])
  const [cloudSummary, setCloudSummary] = useState(null)
  const [netDevices, setNetDevices]     = useState([])
  const [dsars, setDsars]               = useState([])
  const [aiSummary, setAiSummary]       = useState(null)
  const [loading, setLoading]           = useState(true)
  const [liveDevices, setLiveDevices]   = useState([])
  const [liveCloudExtra, setLiveCloud]  = useState([])
  const [chatgptDetected, setChatgpt]   = useState(false)

  useEffect(() => {
    Promise.all([
      DeviceService.getInventory(),   DeviceService.getMetrics(),
      MonitorService.getAlerts(),
      IdentityService.getUsers(),     IdentityService.getSummary(),
      CloudService.getFindings(),     CloudService.getSummary(),
      NetworkService.getDevices(),    PrivacyService.getDsars(),
      AISPMService.getSummary(),
    ]).then(([inv, dm, al, us, idSum, fi, cs, nd, ds, ai]) => {
      setInventory(inv); setDevMetrics(dm); setAlerts(al)
      setUsers(us); setIdSummary(idSum); setFindings(fi)
      setCloudSummary(cs); setNetDevices(nd); setDsars(ds)
      setAiSummary(ai); setLoading(false)
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

  // Poll server cloud findings so Shabbeer's dynamic finding is reflected live
  useEffect(() => {
    const poll = () => fetch(`${API}/api/cloud`).then(r => r.json()).then(({ findings: f }) => setLiveCloud(f ?? [])).catch(() => {})
    poll(); const id = setInterval(poll, 3000); return () => clearInterval(id)
  }, [])

  if (loading) return <div className="loading-state">Loading overview…</div>

  const devList          = liveDevices.length > 0 ? liveDevices : (inventory.devices ?? [])
  // Use summary metrics from devices.json so numbers match the Devices module
  const totalDevices     = parseInt(deviceMetrics?.totalEnrolled?.num) || devList.length
  const nonCompliant     = parseInt(deviceMetrics?.nonCompliant?.num)  || devList.filter(d => d.status === 'NON-COMPLIANT').length
  const atRisk           = parseInt(deviceMetrics?.gracePeriod?.num)   || devList.filter(d => d.status === 'AT RISK').length
  const compliant        = totalDevices - nonCompliant   // grace period devices are not non-compliant

  // Critical alerts = all active Monitor alerts (matches Monitor module header count)
  const criticalAlerts   = alerts.length
  const highAlerts       = alerts.filter(a => a.sevCls === 'hi').length
  const recentAlerts     = alerts.slice(0, 6)

  // Use identity summary so numbers match Identity module (930 users, 94% MFA)
  const totalUsers       = parseInt(identitySummary?.directory?.count)  || users.length
  const highRiskUsers    = parseInt(identitySummary?.highRisk?.count)   || users.filter(u => u.riskCls === 'cr' || u.riskCls === 'hi').length
  const mfaEnabled       = users.filter(u => u.mfa != null).length  // mfa is a string ("TOTP","WebAuthn"…) or null
  const mfaPct           = parseInt(identitySummary?.mfa?.count)        || (users.length > 0 ? Math.round((mfaEnabled / users.length) * 100) : 0)
  const dormantUsers     = users.filter(u => u.status === 'DORMANT' || u.status === 'Inactive').length

  // Cloud: JSON findings are always the base; server sim findings (Santosh) added on top, deduped
  const allCloudFindings = [
    ...liveCloudExtra,
    ...findings.filter(f => !liveCloudExtra.some(s => s.id === f.id)),
  ]
  const totalFindings    = allCloudFindings.length
  const criticalFindings = allCloudFindings.filter(f => f.severity === 'CRITICAL').length
  const highFindings     = allCloudFindings.filter(f => f.severity === 'HIGH').length
  const medFindings      = allCloudFindings.filter(f => f.severity === 'MEDIUM').length
  const lowFindings      = allCloudFindings.filter(f => f.severity === 'LOW').length

  // DSARs: open = IN PROGRESS + SUBMITTED + OVERDUE (matches Privacy module "3 open")
  const openDsars        = dsars.filter(d => ['OPEN','IN PROGRESS','SUBMITTED','OVERDUE'].includes(d.status)).length
  const overdueDsars     = dsars.filter(d => d.status === 'OVERDUE').length
  const shadowAiCount    = aiSummary ? Number(aiSummary.shadowAI.count) + (chatgptDetected ? 1 : 0) : 0

  const CLOUD_IDENTITY_MAP = {
    'CF-0412': 'contractor-mjones',
    'CF-0411': 'dev-admin',
    'CF-0405': 'allAuthenticatedUsers',
  }

  const activeActions = [
    ...recentAlerts.slice(0, 3).map(a => ({
      time: a.time, event: a.type, asset: a.device,
      severity: a.severity ?? 'HIGH', sevCls: a.sevCls ?? 'hi', status: a.status ?? 'OPEN', module: 'Monitor',
    })),
    ...allCloudFindings.filter(f => f.severity === 'CRITICAL').slice(0, 3).map(f => ({
      time: f.discoveredAt ?? '—', event: f.issue, asset: CLOUD_IDENTITY_MAP[f.id] ?? f.resource,
      severity: 'CRITICAL', sevCls: 'cr', status: f.status ?? 'OPEN', module: 'Cloud',
    })),
  ].slice(0, 5)

  return (
    <>
      {/* ── KPI Strip ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 20 }}>
        <KpiCard Icon={ShieldX}  label="Non-Compliant Devices" value={nonCompliant}     sub={`of ${totalDevices} endpoints`}    grad="linear-gradient(135deg,#dc2626,#991b1b)" onClick={() => navigate('/devices')}  />
        <KpiCard Icon={Bell}     label="Critical Alerts"        value={criticalAlerts}   sub={`+ ${highAlerts} high severity`}   grad="linear-gradient(135deg,#b91c1c,#7f1d1d)" onClick={() => navigate('/monitor')}  />
        <KpiCard Icon={UserX}    label="High Risk Users"         value={highRiskUsers}    sub={`MFA ${mfaPct}% coverage`}        grad="linear-gradient(135deg,#d97706,#92400e)" onClick={() => navigate('/identity')} />
        <KpiCard Icon={Cloud}    label="Critical Cloud"          value={criticalFindings} sub={`${highFindings} high severity`}  grad="linear-gradient(135deg,#7c3aed,#4c1d95)" onClick={() => navigate('/cloud')}    />
        <KpiCard Icon={Bot}      label="Shadow AI"               value={shadowAiCount}    sub={chatgptDetected ? '⚠ Live session detected' : `${aiSummary?.complianceGap?.count ?? 0} compliance gaps`} grad={chatgptDetected ? 'linear-gradient(135deg,#dc2626,#7c3aed)' : 'linear-gradient(135deg,#6d28d9,#4c1d95)'} onClick={() => navigate('/aispm')} />
        <KpiCard Icon={FileText} label="Open DSARs"              value={openDsars}        sub={overdueDsars > 0 ? `${overdueDsars} overdue` : 'All within SLA'} grad={overdueDsars > 0 ? 'linear-gradient(135deg,#dc2626,#991b1b)' : 'linear-gradient(135deg,#059669,#064e3b)'} onClick={() => navigate('/privacy')} />
      </div>

      {/* ── Row A: RMM Alert Timeline | Active Cybersecurity Actions ─ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14, alignItems: 'start' }}>

        {/* RMM Alert Timeline */}
        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.08)' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: '#ef444418', borderRadius: 7, padding: '5px 6px', display: 'flex' }}>
                <Activity size={13} color="#ef4444" strokeWidth={2.2} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--txt)' }}>RMM Alert Timeline</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--txt3)', background: 'var(--bg2)', padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>Last 24 hours</span>
          </div>
          <div style={{ padding: '4px 0' }}>
            {recentAlerts.map((a, i) => {
              const cfg = SEV_CFG[a.severity] ?? SEV_CFG.HIGH
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '10px 20px',
                  borderBottom: i < recentAlerts.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 6px ${cfg.color}80`, flexShrink: 0 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 110, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: `${cfg.color}15`, padding: '2px 8px', borderRadius: 20 }}>{cfg.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--txt3)', fontFamily: 'monospace' }}>{a.time}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: 'var(--txt)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.description ?? a.event}</div>
                  </div>
                  {a.device && (
                    <span style={{ fontSize: 11, color: 'var(--txt3)', background: 'var(--bg3)', border: '1px solid var(--border)', padding: '2px 9px', borderRadius: 6, flexShrink: 0, fontFamily: 'monospace' }}>{a.device}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Active Cybersecurity Actions */}
        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.08)' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: '#f59e0b18', borderRadius: 7, padding: '5px 6px', display: 'flex' }}>
                <ShieldAlert size={13} color="#f59e0b" strokeWidth={2.2} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--txt)' }}>Active Cybersecurity Actions</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--txt3)', background: 'var(--bg2)', padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>{activeActions.length} items</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)' }}>
                {['Time', 'Event', 'Asset', 'Severity', 'Status'].map(h => (
                  <th key={h} style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: .7, padding: '8px 14px', textAlign: 'left', color: 'var(--txt3)', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeActions.map((a, i) => {
                const sevColor = a.sevCls === 'cr' ? '#ef4444' : a.sevCls === 'hi' ? '#f59e0b' : '#eab308'
                const stColor  = STATUS_CLR[a.status] ?? '#94a3b8'
                return (
                  <tr key={i} style={{ borderLeft: `3px solid ${sevColor}`, transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--txt3)', fontFamily: 'monospace', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{a.time}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: 'var(--txt)', borderBottom: '1px solid var(--border)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.event}</td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--txt2)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{a.asset}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: sevColor, background: `${sevColor}14`, padding: '3px 9px', borderRadius: 6, border: `1px solid ${sevColor}30` }}>{a.severity}</span>
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: stColor, background: `${stColor}14`, padding: '3px 10px', borderRadius: 20, border: `1px solid ${stColor}30` }}>{a.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Row B: Command Center + 4 posture panels ──────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Command Center */}
        <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,.10)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg,var(--bg3),var(--bg2))' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--txt)', letterSpacing: .2 }}>Security Command Center</span>
          </div>
          <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <CmdTile label="Endpoints"       value={totalDevices}      Icon={Monitor}     color="#22c55e" onClick={() => navigate('/devices')}  />
            <CmdTile label="Network Devices" value={netDevices.length} Icon={Wifi}        color="#3b82f6" onClick={() => navigate('/network')}  />
            <CmdTile label="Cloud Instances" value={totalFindings}     Icon={Cloud}       color="#f59e0b" onClick={() => navigate('/cloud')}    />
            <CmdTile label="Identities"      value={totalUsers}        Icon={Users}       color="#a78bfa" onClick={() => navigate('/identity')} />
            <CmdTile label="Alerts"          value={alerts.length}     Icon={ShieldAlert} color={criticalAlerts > 0 ? '#ef4444' : '#22c55e'} onClick={() => navigate('/monitor')}  />
            <CmdTile label="DSARs"           value={openDsars}         Icon={Lock}        color="#22d3ee" onClick={() => navigate('/privacy')}  />
          </div>
        </div>

        {/* Endpoint Coverage */}
        <Panel title="Endpoint Coverage" Icon={Monitor} iconColor="#22c55e" onClick={() => navigate('/devices')}>
          <StatRow Icon={ShieldCheck}  label="Compliant"     value={compliant}    color="#22c55e" total={totalDevices} />
          <StatRow Icon={ShieldX}      label="Non-Compliant" value={nonCompliant} color="#ef4444" total={totalDevices} />
          <StatRow Icon={AlertTriangle}label="At Risk"       value={atRisk}       color="#f59e0b" total={totalDevices} />
          <StatRow Icon={Monitor}      label="Total Fleet"   value={totalDevices} color="#94a3b8" />
          <div style={{ marginTop: 14, padding: '14px', background: 'var(--bg3)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="#22c55e" strokeWidth="8"
                  strokeDasharray={`${totalDevices > 0 ? (compliant / totalDevices) * 201 : 0} 201`}
                  strokeLinecap="round" transform="rotate(-90 40 40)" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#22c55e', fontFamily: 'JetBrains Mono,monospace' }}>
                {totalDevices > 0 ? Math.floor((compliant / totalDevices) * 100) : 0}%
              </div>
            </div>
            <div style={{ lineHeight: 1.6 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e', fontFamily: 'JetBrains Mono,monospace' }}>{compliant}</div>
              <div style={{ fontSize: 12, color: 'var(--txt2)' }}>of {totalDevices} devices</div>
              <div style={{ fontSize: 11, color: 'var(--txt3)' }}>are compliant</div>
            </div>
          </div>
        </Panel>

        {/* Identity Posture */}
        <Panel title="Identity Posture" Icon={Users} iconColor="#a78bfa" onClick={() => navigate('/identity')}>
          <StatRow Icon={ShieldAlert}  label="High Risk Users" value={highRiskUsers} color="#ef4444" total={totalUsers} />
          <StatRow Icon={Lock}         label="MFA Enabled"     value={`${mfaPct}%`}  color="#22c55e" />
          <StatRow Icon={Clock}        label="Dormant Users"   value={dormantUsers}  color="#f59e0b" total={totalUsers} />
          <StatRow Icon={Users}        label="Total Users"     value={totalUsers}    color="#94a3b8" />
          <div style={{ marginTop: 14, padding: '14px', background: 'var(--bg3)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx="40" cy="40" r="32" fill="none" stroke={mfaPct >= 90 ? '#22c55e' : '#f59e0b'} strokeWidth="8"
                  strokeDasharray={`${mfaPct * 2.01} 201`}
                  strokeLinecap="round" transform="rotate(-90 40 40)" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: mfaPct >= 90 ? '#22c55e' : '#f59e0b', fontFamily: 'JetBrains Mono,monospace' }}>
                {mfaPct}%
              </div>
            </div>
            <div style={{ lineHeight: 1.6 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: mfaPct >= 90 ? '#22c55e' : '#f59e0b', fontFamily: 'JetBrains Mono,monospace' }}>{mfaPct}%</div>
              <div style={{ fontSize: 12, color: 'var(--txt2)' }}>MFA coverage</div>
              <div style={{ fontSize: 11, color: 'var(--txt3)' }}>across {totalUsers} users</div>
            </div>
          </div>
        </Panel>

        {/* Cloud Posture */}
        <Panel title="Cloud Security Posture" Icon={Cloud} iconColor="#f59e0b" onClick={() => navigate('/cloud')}>
          <StatRow Icon={ShieldX}      label="Critical"  value={criticalFindings} color="#ef4444" total={totalFindings} />
          <StatRow Icon={ShieldAlert}  label="High"      value={highFindings}     color="#f59e0b" total={totalFindings} />
          <StatRow Icon={AlertTriangle}label="Medium"    value={medFindings}      color="#eab308" total={totalFindings} />
          <StatRow Icon={Eye}          label="Low"       value={lowFindings}      color="#94a3b8" total={totalFindings} />
          <div style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', height: 6, background: 'var(--bg3)', display: 'flex' }}>
            {[
              { val: criticalFindings, color: '#ef4444' },
              { val: highFindings,     color: '#f59e0b' },
              { val: medFindings,      color: '#eab308' },
              { val: lowFindings,      color: '#64748b' },
            ].map((s, i) => (
              <div key={i} style={{ flex: s.val, background: s.color, transition: 'flex .6s ease' }} />
            ))}
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: 'var(--txt3)' }}>{totalFindings} total findings across all cloud assets</div>
        </Panel>

        {/* AI Shadow Monitor */}
        <Panel title="AI Shadow Monitor" Icon={Bot} iconColor="#c084fc"
          alert={chatgptDetected ? '#f59e0b' : null} onClick={() => navigate('/aispm')}>
          <StatRow Icon={Bot}          label="Shadow AI Tools"  value={shadowAiCount}                        color="#c084fc" />
          <StatRow Icon={Activity}     label="Live Detections"  value={chatgptDetected ? 1 : 0}              color={chatgptDetected ? '#ef4444' : '#94a3b8'} />
          <StatRow Icon={Layers}       label="Compliance Gaps"  value={aiSummary?.complianceGap?.count ?? 0} color="#f59e0b" />
          <StatRow Icon={ShieldAlert}  label="Critical Risk"    value={aiSummary?.criticalRisk?.count ?? 0}  color="#ef4444" />
          {chatgptDetected ? (
            <div style={{ marginTop: 12, padding: '9px 12px', borderRadius: 9, background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.25)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', flexShrink: 0, boxShadow: '0 0 6px #f59e0b' }} />
              <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>chatgpt.com · TVyshnavi-3941</span>
            </div>
          ) : (
            <div style={{ marginTop: 12, padding: '9px 12px', borderRadius: 9, background: 'var(--bg3)', fontSize: 11, color: 'var(--txt3)' }}>
              Monitoring AI tool usage across all endpoints
            </div>
          )}
        </Panel>
      </div>
    </>
  )
}
