import { useState, useEffect, useRef } from 'react'
import MetricCard from '../../../components/MetricCard.jsx'
import SeverityBadge from '../../../components/SeverityBadge.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import WidgetCard from '../../../components/WidgetCard.jsx'
import FindingDrawer from '../../../components/FindingDrawer.jsx'
import { useToast } from '../../../components/Toast.jsx'
import { CloudService } from '../../../services/CloudService.js'
import { Icons } from '../../../shared/icons.jsx'
import { API_BASE } from '../../../config.js'

function RowBar({ label, pct, color, val }) {
  return (
    <div className="row">
      <span className="rn">{label}</span>
      <div className="pb" style={{ flex: 1 }}>
        <i style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="rv" style={{ color }}>{val}</span>
    </div>
  )
}

function SegControl({ options, active, onSelect, disabledOptions = [] }) {
  return (
    <div className="seg">
      {options.map(o => {
        const isDisabled = disabledOptions.includes(o)
        return (
          <button
            key={o}
            className={active === o ? 'on' : ''}
            onClick={() => !isDisabled && onSelect(o)}
            disabled={isDisabled}
            style={isDisabled ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

const CLOUD_API = `${API_BASE}/api/cloud`
const POLL_MS   = 4000

export default function CloudOverview() {
  const [summary, setSummary]         = useState(null)
  const [allFindings, setAllFindings] = useState([])
  const [findings, setFindings]       = useState([])
  const [simFindings, setSimFindings] = useState([])   // server-injected findings
  const [simActive, setSimActive]     = useState(false)
  const [compliance, setCompliance]   = useState([])
  const [ciem, setCiem]               = useState([])
  const [accounts, setAccounts]       = useState([])
  const [filter, setFilter]           = useState('All')
  const [loading, setLoading]         = useState(true)
  const [scanning, setScanning]       = useState(false)
  const [remediating, setRemediating] = useState(new Set())
  const [selectedFinding, setSelectedFinding] = useState(null)
  const tableRef = useRef(null)
  const pollRef  = useRef(null)
  const toast = useToast()

  async function fetchServerFindings() {
    try {
      const r = await fetch(CLOUD_API)
      if (!r.ok) throw new Error()
      const data = await r.json()
      setSimFindings(data.findings ?? [])
      setSimActive(data.simActive ?? false)
    } catch {
      setSimFindings([])
      setSimActive(false)
    }
  }

  useEffect(() => {
    Promise.all([
      CloudService.getSummary(),
      CloudService.getFindings(),
      CloudService.getCompliancePosture(),
      CloudService.getCiemRisks(),
      CloudService.getLinkedAccounts(),
      fetchServerFindings(),
    ]).then(([s, f, c, ci, a]) => {
      setSummary(s)
      setAllFindings(f)
      setFindings(pickRandom(f, 5))
      setCompliance(c)
      setCiem(ci)
      setAccounts(a)
      setLoading(false)
    })

    pollRef.current = setInterval(fetchServerFindings, POLL_MS)
    return () => clearInterval(pollRef.current)
  }, [])

  // Broadcast current displayed counts to server so Overview dashboard can sync
  useEffect(() => {
    if (loading) return
    const displayedEff = [
      ...simFindings,
      ...findings.filter(f => !simFindings.some(s => s.id === f.id)),
    ]
    const critEff = displayedEff.filter(f => f.sevCls === 'cr' && f.status !== 'RESOLVED').length
    const highEff = displayedEff.filter(f => f.sevCls === 'hi' && f.status !== 'RESOLVED').length
    fetch(`${CLOUD_API}/display-state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: displayedEff.length, critical: critEff, high: highEff }),
    }).catch(() => {})
  }, [findings, simFindings, loading])

  function handleScan() {
    if (scanning) return
    setScanning(true)
    toast('Scan triggered', 'Cloud environment scan started across AWS · GCP · Azure', 'in')

    setTimeout(() => {
      const n = 4 + Math.floor(Math.random() * 4)
      const fresh = pickRandom(allFindings, n).map(f => ({
        ...f,
        status: f.status === 'RESOLVED' ? 'OPEN' : f.status,
        statusCls: f.status === 'RESOLVED' ? 'cr' : f.statusCls,
      }))
      setFindings(fresh)
      setScanning(false)
      if (tableRef.current) {
        tableRef.current.classList.add('scan-pulse')
        setTimeout(() => tableRef.current?.classList.remove('scan-pulse'), 3700)
      }
      const crit = fresh.filter(f => f.sevCls === 'cr').length
      const high = fresh.filter(f => f.sevCls === 'hi').length
      toast(
        `Scan complete — ${fresh.length} findings`,
        `${crit} critical · ${high} high · results updated`,
        crit > 0 ? 'cr' : 'hi'
      )
    }, 2200)
  }

  function handleRemediate(id) {
    if (remediating.has(id)) return
    setRemediating(prev => new Set(prev).add(id))
    toast('Remediation started', `Working on ${id} — estimated 3–5 seconds`, 'hi')

    const delay = 3000 + Math.random() * 2000
    setTimeout(() => {
      setFindings(prev => prev.map(f =>
        f.id === id ? { ...f, status: 'RESOLVED', statusCls: 'ok' } : f
      ))
      setRemediating(prev => { const n = new Set(prev); n.delete(id); return n })
      toast(`${id} resolved`, 'Finding status updated to RESOLVED', 'ok')
    }, delay)
  }

  // "Revoke IAM" for Santosh's sim finding — resolves cloud finding AND
  // calls /resolve on the identity server so his row resets in Identity module too
  const [revoking, setRevoking] = useState(false)

  function handleRevokeIAM(findingId) {
    if (revoking) return
    setRevoking(true)
    toast('Revoking IAM credentials…', 'santosh@terralogic.com access keys being invalidated', 'hi')

    const delay = 3000 + Math.random() * 2000
    setTimeout(async () => {
      // Mark finding RESOLVED locally
      setSimFindings(prev => prev.map(f =>
        f.id === findingId ? { ...f, status: 'RESOLVED', statusCls: 'ok' } : f
      ))
      // Call server to reset identity entry
      try {
        await fetch(`${API_BASE}/api/cloud/santosh/revoke-iam`, { method: 'POST' })
      } catch { /* server may be down — local state is already updated */ }
      setRevoking(false)
      toast('IAM revoked — both modules resolved', 'santosh@terralogic.com credentials invalidated · Identity risk reset', 'ok')
    }, delay)
  }

  if (loading) return <div className="loading-state">Loading cloud data…</div>

  // Table display: random subset + sim findings (sim rows always visible)
  const allDisplayed = [
    ...simFindings,
    ...findings.filter(f => !simFindings.some(s => s.id === f.id)),
  ]

  // Cards count from what's shown in the table — matches exactly what the user sees
  const critCount = allDisplayed.filter(f => f.sevCls === 'cr' && f.status !== 'RESOLVED').length
  const highCount = allDisplayed.filter(f => f.sevCls === 'hi' && f.status !== 'RESOLVED').length

  const PROVIDERS = ['All', 'AWS', 'GCP', 'Azure']
  const filtered = filter === 'All' ? allDisplayed : allDisplayed.filter(f => f.provider === filter)
  const johnFinding = simFindings.find(f => f.id === 'CF-SANTOSH-001')

  // Grey out 3 of the 5 base (non-sim) findings shown, and 2 of the 3 CIEM risk rows
  const dimmedFindingIds = new Set(findings.slice(2).map(f => f.id))
  const dimmedCiemIds    = new Set(ciem.slice(1).map(r => r.id))

  return (
    <>
      {/* Insider threat correlation banner */}
      {simActive && johnFinding && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 14,
          background: 'rgba(249,115,22,.07)',
          border: '1px solid rgba(249,115,22,.3)',
          borderLeft: '4px solid var(--high)',
          borderRadius: 10, padding: '14px 18px', marginBottom: 18,
        }}>
          <div style={{ fontSize: 22, marginTop: 1 }}>🔗</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--high)', marginBottom: 3 }}>
              Correlated finding — insider threat activity detected in S3
            </div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', lineHeight: 1.5 }}>
              <b>santosh@terralogic.com</b> (PIP employee) made <b>4,200 GetObject calls</b> on{' '}
              <span className="mono">corp-data-prod</span> at 02:47 AM, transferring 4.2 GB.
              This finding is correlated with a <b>HIGH risk alert in the Identity module</b>.
              Click "Revoke IAM" on the finding row to invalidate credentials and resolve both modules.
            </div>
          </div>
          <span className="b hi" style={{ marginTop: 2, flexShrink: 0 }}><i />HIGH</span>
        </div>
      )}

      {/* KPI Cards — live counts reflect current findings state */}
      <div className="kg k4">
        <MetricCard cls="cr" num={String(critCount)} desc={summary.critical.label} label="P0 Critical"   foot={summary.critical.trend}  icon={Icons.alert} />
        <MetricCard cls="hi" num={String(highCount)} desc={summary.high.label}     label="P1 High"       foot={summary.high.trend}      icon={Icons.cloud} />
        <MetricCard cls="in" num={summary.accounts.count} desc={summary.accounts.label} label="Accounts" foot={summary.accounts.trend}  icon={Icons.cloud} />
        <div style={{ opacity: 0.45, pointerEvents: 'none' }}>
          <MetricCard cls="ok" num={summary.posture.count}  desc={summary.posture.label}  label="Posture Grade" foot={summary.posture.trend} icon={Icons.shield} />
        </div>
      </div>

      {/* CSPM Findings Table */}
      <div className="card" style={{ marginBottom: 18 }} ref={tableRef}>
        <div className="card-h">
          <h3>
            CSPM Findings
            <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--txt3)', marginLeft: 8 }}>
              {findings.length} results
            </span>
          </h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <SegControl options={PROVIDERS} active={filter} onSelect={setFilter} disabledOptions={['Azure']} />
            <button
              className="btn p"
              onClick={handleScan}
              disabled={scanning}
              style={{ opacity: scanning ? 0.65 : 1, minWidth: 90 }}
            >
              {scanning ? '⟳ Scanning…' : 'Scan now'}
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              {['ID', 'Severity', 'Resource', 'Provider', 'Issue', 'SLA', 'Status', ''].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => {
              const isRemediating = remediating.has(f.id)
              const isResolved = f.status === 'RESOLVED'
              const isDimmed = !f.sim && dimmedFindingIds.has(f.id)
              return (
                <tr
                  key={f.id}
                  style={{
                    opacity: isDimmed ? 0.45 : isRemediating ? 0.6 : 1,
                    transition: 'opacity .3s',
                    ...(f.sim && simActive ? { animation: 'rowFlash 1.2s ease', background: 'rgba(249,115,22,.04)' } : {}),
                  }}
                >
                  <td className="mono">{f.id}</td>
                  <td><SeverityBadge severity={f.severity} cls={f.sevCls} /></td>
                  <td className="mono pr">{f.resource}</td>
                  <td><span style={{ fontSize: 11, fontWeight: 700, color: f.providerColor }}>{f.provider}</span></td>
                  <td>
                    {f.issue ?? f.title}
                    {f.correlatedModule && (
                      <div style={{ marginTop: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(249,115,22,.12)', color: 'var(--high)', padding: '1px 6px', borderRadius: 4 }}>
                          ↗ Correlated: {f.correlatedModule}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="mono" style={{ color: f.slaColor }}>{f.sla}</td>
                  <td>
                    {(isRemediating || (f.sim && revoking))
                      ? <span className="b hi"><i />{f.sim ? 'REVOKING…' : 'REMEDIATING'}</span>
                      : <StatusBadge status={f.status} cls={f.statusCls} />
                    }
                  </td>
                  <td>
                    <div className="brow">
                      {f.sim
                        ? /* sim finding: Revoke IAM instead of Remediate */
                          !isResolved && (
                            <button
                              className="btn d"
                              disabled={revoking}
                              onClick={() => handleRevokeIAM(f.id)}
                            >
                              {revoking ? '…' : 'Revoke IAM'}
                            </button>
                          )
                        : /* regular finding: Remediate — greyed out, not in scope for phase-1 */
                          !isResolved && (
                            <button
                              className="btn p"
                              disabled
                              title="Not available in Phase-1"
                              style={{ opacity: 0.45, cursor: 'not-allowed' }}
                            >
                              Remediate
                            </button>
                          )
                      }
                      <button className="btn" onClick={() => setSelectedFinding(f)}>View</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Widgets */}
      <div className="g3">
        <div style={{ opacity: 0.45, pointerEvents: 'none' }}>
          <WidgetCard title="Compliance posture">
            {compliance.map(c => (
              <RowBar key={c.label} label={c.label} pct={c.pct} color={c.color} val={c.val} />
            ))}
          </WidgetCard>
        </div>

        <WidgetCard title="CIEM top risks">
          {ciem.map(r => (
            <div key={r.id} className="row" style={dimmedCiemIds.has(r.id) ? { opacity: 0.45 } : undefined}>
              <div style={{ flex: 1 }}>
                <div className="mono" style={{ fontSize: 12 }}>{r.id}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{r.desc}</div>
              </div>
              <span className={`b ${r.cls}`}><i />{r.cls === 'cr' ? 'CRIT' : 'HIGH'}</span>
            </div>
          ))}
        </WidgetCard>

        <WidgetCard title="Linked accounts">
          {accounts.map(a => {
            const isAzure = a.name.startsWith('Azure')
            return (
              <div key={a.name} className="row" style={isAzure ? { opacity: 0.45 } : undefined}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: a.cls === 'cr' ? 'var(--crit)' : 'var(--high)' }}>{a.findings}</div>
                </div>
                <button className="btn" disabled={isAzure} style={isAzure ? { cursor: 'not-allowed' } : undefined}>Scan</button>
              </div>
            )
          })}
        </WidgetCard>
      </div>

      {/* Finding Detail Drawer */}
      {selectedFinding && (
        <FindingDrawer
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
        />
      )}
    </>
  )
}
