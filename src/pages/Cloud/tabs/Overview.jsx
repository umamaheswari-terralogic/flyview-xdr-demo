import { useState, useEffect, useRef } from 'react'
import MetricCard from '../../../components/MetricCard.jsx'
import SeverityBadge from '../../../components/SeverityBadge.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import WidgetCard from '../../../components/WidgetCard.jsx'
import FindingDrawer from '../../../components/FindingDrawer.jsx'
import { useToast } from '../../../components/Toast.jsx'
import { CloudService } from '../../../services/CloudService.js'
import { Icons } from '../../../shared/icons.jsx'

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

function SegControl({ options, active, onSelect }) {
  return (
    <div className="seg">
      {options.map(o => (
        <button key={o} className={active === o ? 'on' : ''} onClick={() => onSelect(o)}>{o}</button>
      ))}
    </div>
  )
}

function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

export default function CloudOverview() {
  const [summary, setSummary]       = useState(null)
  const [allFindings, setAllFindings] = useState([])
  const [findings, setFindings]     = useState([])
  const [compliance, setCompliance] = useState([])
  const [ciem, setCiem]             = useState([])
  const [accounts, setAccounts]     = useState([])
  const [filter, setFilter]         = useState('All')
  const [loading, setLoading]       = useState(true)
  const [scanning, setScanning]     = useState(false)
  const [remediating, setRemediating] = useState(new Set())
  const [selectedFinding, setSelectedFinding] = useState(null)
  const tableRef = useRef(null)
  const toast = useToast()

  useEffect(() => {
    Promise.all([
      CloudService.getSummary(),
      CloudService.getFindings(),
      CloudService.getCompliancePosture(),
      CloudService.getCiemRisks(),
      CloudService.getLinkedAccounts(),
    ]).then(([s, f, c, ci, a]) => {
      setSummary(s)
      setAllFindings(f)
      setFindings(pickRandom(f, 5))
      setCompliance(c)
      setCiem(ci)
      setAccounts(a)
      setLoading(false)
    })
  }, [])

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
        f.id === id
          ? { ...f, status: 'RESOLVED', statusCls: 'ok' }
          : f
      ))
      setRemediating(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      toast(`${id} resolved`, 'Finding status updated to RESOLVED', 'ok')
    }, delay)
  }

  if (loading) return <div className="loading-state">Loading cloud data…</div>

  const PROVIDERS = ['All', 'AWS', 'GCP', 'Azure']
  const filtered = filter === 'All' ? findings : findings.filter(f => f.provider === filter)

  const critCount = findings.filter(f => f.sevCls === 'cr' && f.status !== 'RESOLVED').length
  const highCount = findings.filter(f => f.sevCls === 'hi' && f.status !== 'RESOLVED').length

  return (
    <>
      {/* KPI Cards — live counts reflect current findings state */}
      <div className="kg k4">
        <MetricCard cls="cr" num={String(critCount)} desc={summary.critical.label} label="P0 Critical"   foot={summary.critical.trend}  icon={Icons.alert} />
        <MetricCard cls="hi" num={String(highCount)} desc={summary.high.label}     label="P1 High"       foot={summary.high.trend}      icon={Icons.cloud} />
        <MetricCard cls="in" num={summary.accounts.count} desc={summary.accounts.label} label="Accounts" foot={summary.accounts.trend}  icon={Icons.cloud} />
        <MetricCard cls="ok" num={summary.posture.count}  desc={summary.posture.label}  label="Posture Grade" foot={summary.posture.trend} icon={Icons.shield} />
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
            <SegControl options={PROVIDERS} active={filter} onSelect={setFilter} />
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
              return (
                <tr key={f.id} style={{ opacity: isRemediating ? 0.6 : 1, transition: 'opacity .3s' }}>
                  <td className="mono">{f.id}</td>
                  <td><SeverityBadge severity={f.severity} cls={f.sevCls} /></td>
                  <td className="mono pr">{f.resource}</td>
                  <td><span style={{ fontSize: 11, fontWeight: 700, color: f.providerColor }}>{f.provider}</span></td>
                  <td>{f.issue}</td>
                  <td className="mono" style={{ color: f.slaColor }}>{f.sla}</td>
                  <td>
                    {isRemediating
                      ? <span className="b hi"><i />REMEDIATING</span>
                      : <StatusBadge status={f.status} cls={f.statusCls} />
                    }
                  </td>
                  <td>
                    <div className="brow">
                      {!isResolved && (
                        <button
                          className="btn p"
                          disabled={isRemediating}
                          onClick={() => handleRemediate(f.id)}
                        >
                          {isRemediating ? '…' : 'Remediate'}
                        </button>
                      )}
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
        <WidgetCard title="Compliance posture">
          {compliance.map(c => (
            <RowBar key={c.label} label={c.label} pct={c.pct} color={c.color} val={c.val} />
          ))}
        </WidgetCard>

        <WidgetCard title="CIEM top risks">
          {ciem.map(r => (
            <div key={r.id} className="row">
              <div style={{ flex: 1 }}>
                <div className="mono" style={{ fontSize: 12 }}>{r.id}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{r.desc}</div>
              </div>
              <span className={`b ${r.cls}`}><i />{r.cls === 'cr' ? 'CRIT' : 'HIGH'}</span>
            </div>
          ))}
        </WidgetCard>

        <WidgetCard title="Linked accounts">
          {accounts.map(a => (
            <div key={a.name} className="row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: a.cls === 'cr' ? 'var(--crit)' : 'var(--high)' }}>{a.findings}</div>
              </div>
              <button className="btn">Scan</button>
            </div>
          ))}
        </WidgetCard>
      </div>

      {/* Finding Detail Drawer */}
      {selectedFinding && (
        <FindingDrawer
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
          onRemediate={handleRemediate}
        />
      )}
    </>
  )
}
