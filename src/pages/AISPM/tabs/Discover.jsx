import { useState, useEffect, useRef } from 'react'
import MetricCard from '../../../components/MetricCard.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import WidgetCard from '../../../components/WidgetCard.jsx'
import { AISPMService } from '../../../services/AISPMService.js'
import { Icons } from '../../../shared/icons.jsx'
import { API_BASE } from '../../../config.js'

const API = API_BASE

const SIM_CLI_ASSET = {
  name: 'Ollama / LLaMA 3',
  vendor: 'Meta (local)',
  type: 'Local CLI Model',
  users: 1,
  risk: 91,
  riskCls: 'cr',
  dataScope: 'CONFIDENTIAL',
  scopeCls: 'hi',
  sanction: 'SHADOW',
  sanctionCls: 'cr',
  sim: true,
  simType: 'cli',
}

const SIM_CHATGPT_ASSET = {
  name: 'ChatGPT — Live Session',
  vendor: 'OpenAI',
  type: 'Browser Session',
  users: 1,
  risk: 74,
  riskCls: 'hi',
  dataScope: 'INTERNAL',
  scopeCls: 'hi',
  sanction: 'SHADOW',
  sanctionCls: 'cr',
  sim: true,
  simType: 'chatgpt',
  device: 'LT-VyshnaviT-3941',
}

const SIM_EXT_ASSET = {
  name: 'ChatGPT for Chrome',
  vendor: 'OpenAI',
  type: 'Browser Extension',
  users: 1,
  risk: 82,
  riskCls: 'cr',
  dataScope: 'INTERNAL',
  scopeCls: 'hi',
  sanction: 'SHADOW',
  sanctionCls: 'cr',
  sim: true,
  simType: 'extension',
  device: 'LT-VyshnaviT-3941',
}

function RowBar({ label, pct, color, val }) {
  return (
    <div className="row">
      <span className="rn">{label}</span>
      <div className="pb" style={{ flex: 1 }}><i style={{ width: `${pct}%`, background: color }} /></div>
      <span className="rv" style={{ color }}>{val}</span>
    </div>
  )
}

function RiskBar({ risk, riskCls }) {
  const color = riskCls === 'cr' ? 'var(--crit)' : riskCls === 'hi' ? 'var(--high)' : riskCls === 'me' ? 'var(--med)' : 'var(--ok)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className="pb" style={{ width: 60 }}><i style={{ width: `${risk}%`, background: color }} /></div>
      <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: (riskCls === 'cr' || riskCls === 'hi') ? color : 'var(--txt2)' }}>{risk}</span>
    </div>
  )
}

function SegControl({ options, active, onSelect }) {
  return (
    <div className="seg">
      {options.map(o => <button key={o} className={active === o ? 'on' : ''} onClick={() => onSelect(o)}>{o}</button>)}
    </div>
  )
}

export default function AISPMDiscover() {
  const [summary, setSummary]   = useState(null)
  const [assets, setAssets]     = useState([])
  const [events, setEvents]     = useState([])
  const [registry, setRegistry] = useState([])
  const [nist, setNist]         = useState([])
  const [filter, setFilter]     = useState('All')
  const [loading, setLoading]   = useState(true)

  const [cliLlm, setCliLlm]         = useState(false)
  const [chatgpt, setChatgpt]       = useState(false)
  const [extDetected, setExtDetected] = useState(false)
  const prevCli  = useRef(false)
  const prevCgpt = useRef(false)
  const prevExt  = useRef(false)
  const [cliFlash, setCliFlash]     = useState(false)
  const [cgptFlash, setCgptFlash]   = useState(false)
  const [extFlash, setExtFlash]     = useState(false)

  useEffect(() => {
    Promise.all([
      AISPMService.getSummary(),
      AISPMService.getAssets(),
      AISPMService.getDetectionEvents(),
      AISPMService.getEuAiActRegistry(),
      AISPMService.getNistRmf(),
    ]).then(([s, a, e, r, n]) => {
      setSummary(s); setAssets(a); setEvents(e); setRegistry(r); setNist(n)
      setLoading(false)
    })
  }, [])

  // Poll sim state every 3s
  useEffect(() => {
    const poll = () =>
      fetch(`${API}/api/aispm/sim`)
        .then(r => r.json())
        .then(({ chatgptDetected, extensionDetected }) => {
          if (chatgptDetected  && !prevCgpt.current) setCgptFlash(true)
          if (extensionDetected && !prevExt.current)  setExtFlash(true)
          prevCgpt.current = chatgptDetected
          prevExt.current  = extensionDetected
          setChatgpt(chatgptDetected)
          setExtDetected(extensionDetected)
        })
        .catch(() => {})
    poll()
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => { if (cliFlash)  { const t = setTimeout(() => setCliFlash(false),  2500); return () => clearTimeout(t) } }, [cliFlash])
  useEffect(() => { if (cgptFlash) { const t = setTimeout(() => setCgptFlash(false), 2500); return () => clearTimeout(t) } }, [cgptFlash])
  useEffect(() => { if (extFlash)  { const t = setTimeout(() => setExtFlash(false),  2500); return () => clearTimeout(t) } }, [extFlash])

  const triggerChatgpt = () =>
    fetch(`${API}/api/aispm/trigger/chatgpt`, { method: 'POST' })
      .then(r => r.json())
      .then(({ chatgptDetected }) => {
        if (chatgptDetected && !prevCgpt.current) setCgptFlash(true)
        prevCgpt.current = chatgptDetected
        setChatgpt(chatgptDetected)
      })
      .catch(() => {})

  if (loading) return <div className="loading-state">Loading AI-SPM data…</div>

  const FILTERS = ['All', 'Shadow', 'Sanctioned', 'Review']
  const filtered = filter === 'All' ? assets
    : filter === 'Shadow'     ? assets.filter(a => a.sanction === 'SHADOW')
    : filter === 'Sanctioned' ? assets.filter(a => a.sanction === 'SANCTIONED')
    : assets.filter(a => a.sanction === 'REVIEW')

  const simAssets = [
    ...(extDetected && (filter === 'All' || filter === 'Shadow') ? [SIM_EXT_ASSET]     : []),
    ...(chatgpt    && (filter === 'All' || filter === 'Shadow') ? [SIM_CHATGPT_ASSET] : []),
    ...(cliLlm     && (filter === 'All' || filter === 'Shadow') ? [SIM_CLI_ASSET]     : []),
  ]
  const displayAssets = [...simAssets, ...filtered]

  const shadowCount = String(
    Number(summary.shadowAI.count) + (cliLlm ? 1 : 0) + (chatgpt ? 1 : 0) + (extDetected ? 1 : 0)
  )

  return (
    <>
      {/* ── Shadow AI Detection Banner ───────────────────────────── */}
      {(chatgpt || cliLlm || extDetected) && (
        <div style={{ marginBottom: 18, padding: '12px 16px', background: 'rgba(245,158,11,.08)', borderRadius: 8, border: '1px solid rgba(245,158,11,.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="dot" style={{ background: 'var(--high)', width: 9, height: 9 }} />
          <span style={{ fontSize: 12, color: 'var(--high)', fontWeight: 600 }}>
            Shadow AI detected on LT-VyshnaviT-3941
            {extDetected && ' — ChatGPT for Chrome extension (MDM flagged)'}
            {chatgpt && ' — chatgpt.com opened in Chrome'}
            {cliLlm  && ' — ollama run llama3 via CLI'}
            {' · '}check the Detect tab for the full record
          </span>
        </div>
      )}

      {/* ── KPI Cards ─────────────────────────────────────────────── */}
      <div className="kg k4">
        <MetricCard cls="cr" num={shadowCount}                desc={summary.shadowAI.label}      label="Shadow AI"      foot={`<b>▲ +${summary.shadowAI.trend}</b> ${summary.shadowAI.detail}`}  icon={Icons.cpu} />
        <MetricCard cls="hi" num={summary.criticalRisk.count} desc={summary.criticalRisk.label}  label="Critical Risk"  foot={summary.criticalRisk.detail}                                        icon={Icons.alert} />
        <MetricCard cls="ok" num={summary.sanctioned.count}   desc={summary.sanctioned.label}    label="Sanctioned"     foot={summary.sanctioned.detail}                                          icon={Icons.check} />
        <MetricCard cls="hi" num={summary.complianceGap.count} desc={summary.complianceGap.label} label="Compliance Gap" foot={summary.complianceGap.detail}                                     icon={Icons.shield} />
      </div>

      {/* ── AI Asset Inventory ────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>AI Asset Inventory</h3>
          <SegControl options={FILTERS} active={filter} onSelect={setFilter} />
        </div>
        <table>
          <thead>
            <tr>{['Asset', 'Vendor', 'Type', 'Users', 'Risk Score', 'Data Scope', 'Sanction', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {displayAssets.map(a => {
              const isSimCli    = a.sim && a.simType === 'cli'
              const isSimChatgpt = a.sim && a.simType === 'chatgpt'
              const isSimExt    = a.sim && a.simType === 'extension'
              const isSim       = isSimCli || isSimChatgpt || isSimExt
              const dotColor    = isSimCli ? 'var(--crit)' : 'var(--high)'
              const rowStyle    = (isSimCli && cliFlash) || (isSimChatgpt && cgptFlash) || (isSimExt && extFlash)
                ? { animation: 'rowFlash 1.2s ease 2' }
                : {}
              return (
                <tr key={a.name} style={rowStyle}>
                  <td className="pr">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isSim && <span className="dot" style={{ background: dotColor, width: 8, height: 8 }} />}
                      {a.name}
                      {isSim && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: dotColor, color: '#fff', borderRadius: 4, padding: '1px 6px' }}>
                          NEW DETECTION
                        </span>
                      )}
                    </div>
                    {isSimCli && (
                      <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 2, fontFamily: 'monospace' }}>
                        ollama run llama3 · LT-VyshnaviT-3941
                      </div>
                    )}
                    {isSimChatgpt && (
                      <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 2, fontFamily: 'monospace' }}>
                        chatgpt.com · LT-VyshnaviT-3941 · Chrome
                      </div>
                    )}
                    {isSimExt && (
                      <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 2, fontFamily: 'monospace' }}>
                        MDM flagged · LT-VyshnaviT-3941 · Chrome extension
                      </div>
                    )}
                  </td>
                  <td>{a.vendor}</td>
                  <td><span className="ch">{a.type}</span></td>
                  <td className="mono">{a.users}</td>
                  <td><RiskBar risk={a.risk} riskCls={a.riskCls} /></td>
                  <td><span className={`b ${a.scopeCls}`}><i />{a.dataScope}</span></td>
                  <td><StatusBadge status={a.sanction} cls={a.sanctionCls} /></td>
                  <td>
                    <div className="brow">
                      {a.sanctionCls === 'cr' && <button className="btn d">Block</button>}
                      <button className="btn">Review</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Bottom Widgets ─────────────────────────────────────────── */}
      <div className="g3">
        <WidgetCard title="Detection events (24h)">
          {events.map(e => (
            <div key={e.event} className="row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{e.event}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{e.source}</div>
              </div>
              <span className={`b ${e.cls}`}><i />{e.cls === 'cr' ? 'CRITICAL' : e.cls === 'hi' ? 'HIGH' : 'MEDIUM'}</span>
            </div>
          ))}
        </WidgetCard>

        <WidgetCard title="EU AI Act registry">
          {registry.map(r => (
            <div key={r.name} className="row">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{r.desc}</div>
              </div>
              <span className={`b ${r.cls}`}><i />{r.status}</span>
            </div>
          ))}
        </WidgetCard>

        <WidgetCard title="NIST AI RMF posture">
          {nist.map(n => <RowBar key={n.label} label={n.label} pct={n.pct} color={n.color} val={n.val} />)}
        </WidgetCard>
      </div>
    </>
  )
}
