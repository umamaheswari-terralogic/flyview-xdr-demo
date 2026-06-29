import { useState, useEffect, useRef } from 'react'
import MetricCard from '../../../components/MetricCard.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import WidgetCard from '../../../components/WidgetCard.jsx'
import { AISPMService } from '../../../services/AISPMService.js'
import { Icons } from '../../../shared/icons.jsx'

const API = 'http://localhost:3001'

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

function Terminal({ lines }) {
  return (
    <div style={{
      marginTop: 10, background: '#0d1117', borderRadius: 6, padding: '10px 12px',
      fontFamily: 'JetBrains Mono, monospace', fontSize: 11, lineHeight: 1.7,
      border: '1px solid rgba(255,255,255,.08)',
    }}>
      {lines.map((l, i) => (
        <div key={i} style={{ color: l.color ?? '#e6edf3' }}>
          {l.prompt && <span style={{ color: '#3fb950' }}>{l.prompt} </span>}
          {l.text}
          {l.blink && <span style={{ animation: 'pulse 1s infinite', color: '#e6edf3' }}>▌</span>}
        </div>
      ))}
    </div>
  )
}

function BrowserBar({ url, turns, size, active }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: '#f1f3f4', borderRadius: 20, padding: '5px 12px',
        border: '1px solid #dadce0', marginBottom: 8,
      }}>
        <span style={{ fontSize: 11 }}>🌐</span>
        <span style={{ fontSize: 11, color: '#1a0dab', fontFamily: 'monospace' }}>{url}</span>
        {active && <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#ea4335', animation: 'pulse 1.5s infinite' }} />}
      </div>
      <div style={{ fontSize: 11, color: 'var(--txt3)', display: 'flex', gap: 12 }}>
        <span style={{ color: 'var(--high)', fontWeight: 600 }}>{turns} turns</span>
        <span>{size} shared</span>
        <span style={{ color: 'var(--crit)', fontWeight: 600 }}>⚠ internal data detected</span>
      </div>
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

  const [cliLlm, setCliLlm]    = useState(false)
  const [chatgpt, setChatgpt]  = useState(false)
  const prevCli = useRef(false)
  const prevCgpt = useRef(false)
  const [cliFlash, setCliFlash]    = useState(false)
  const [cgptFlash, setCgptFlash]  = useState(false)

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

  // Poll sim status every 3s
  useEffect(() => {
    const poll = () =>
      fetch(`${API}/api/aispm/sim`)
        .then(r => r.json())
        .then(({ cliLlmActive, chatgptActive }) => {
          if (cliLlmActive && !prevCli.current) setCliFlash(true)
          if (chatgptActive && !prevCgpt.current) setCgptFlash(true)
          prevCli.current  = cliLlmActive
          prevCgpt.current = chatgptActive
          setCliLlm(cliLlmActive)
          setChatgpt(chatgptActive)
        })
        .catch(() => {})
    poll()
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => { if (cliFlash)  { const t = setTimeout(() => setCliFlash(false),  2500); return () => clearTimeout(t) } }, [cliFlash])
  useEffect(() => { if (cgptFlash) { const t = setTimeout(() => setCgptFlash(false), 2500); return () => clearTimeout(t) } }, [cgptFlash])

  const trigger = (endpoint, setter) => () =>
    fetch(`${API}/api/aispm/trigger/${endpoint}`, { method: 'POST' })
      .then(r => r.json())
      .then(({ cliLlmActive, chatgptActive }) => {
        setCliLlm(cliLlmActive); setChatgpt(chatgptActive)
        prevCli.current  = cliLlmActive
        prevCgpt.current = chatgptActive
        if (cliLlmActive)  setCliFlash(true)
        if (chatgptActive) setCgptFlash(true)
      })
      .catch(() => {})

  if (loading) return <div className="loading-state">Loading AI-SPM data…</div>

  const FILTERS = ['All', 'Shadow', 'Sanctioned', 'Review']
  const filtered = filter === 'All' ? assets
    : filter === 'Shadow'     ? assets.filter(a => a.sanction === 'SHADOW')
    : filter === 'Sanctioned' ? assets.filter(a => a.sanction === 'SANCTIONED')
    : assets.filter(a => a.sanction === 'REVIEW')

  // Inject sim asset at top when CLI sim is active
  const displayAssets = (cliLlm && (filter === 'All' || filter === 'Shadow'))
    ? [SIM_CLI_ASSET, ...filtered]
    : filtered

  // Adjust KPI count
  const shadowCount = cliLlm ? String(Number(summary.shadowAI.count) + 1) : summary.shadowAI.count

  return (
    <>
      {/* ── Simulation Controls ─────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 18, border: '1px solid var(--border)' }}>
        <div className="card-h">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15 }}>⚡</span> Shadow AI Simulation
          </h3>
          <span style={{ fontSize: 11, color: 'var(--txt3)' }}>Trigger live detections for demo — appears in Discover + Detect tabs</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingBottom: 4 }}>

          {/* CLI LLM scenario */}
          <div style={{
            padding: 14, borderRadius: 8,
            background: cliLlm ? 'rgba(239,68,68,.06)' : 'var(--bg3)',
            border: `1px solid ${cliLlm ? 'var(--crit)' : 'var(--border)'}`,
            transition: 'border-color .3s, background .3s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>CLI LLM Detection</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>
                  Simulates: <span style={{ fontFamily: 'monospace', color: 'var(--txt2)' }}>ollama run llama3</span> on LT-VyshnaviT-3941
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                <span className="dot" style={{ background: cliLlm ? 'var(--crit)' : 'var(--txt3)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: cliLlm ? 'var(--crit)' : 'var(--txt3)' }}>
                  {cliLlm ? 'LIVE' : 'IDLE'}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 10, lineHeight: 1.5 }}>
              Detects a local LLaMA 3 model running via Ollama CLI — flags as unregistered Shadow AI, no DLP coverage.
            </div>
            {cliLlm && (
              <Terminal lines={[
                { prompt: '$', text: 'ollama run llama3' },
                { text: 'pulling manifest ', color: '#3fb950' },
                { text: '▶ loading model weights (4.7 GB)', color: '#3fb950' },
                { text: '>>> [model active — awaiting prompt]', color: '#f0883e', blink: true },
              ]} />
            )}
            <button
              className={`btn${cliLlm ? ' d' : ' p'}`}
              style={{ width: '100%', marginTop: 12 }}
              onClick={trigger('cli-llm')}
            >
              {cliLlm ? '⏹ Stop Detection' : '▶ Trigger CLI LLM Detection'}
            </button>
          </div>

          {/* ChatGPT Browser scenario */}
          <div style={{
            padding: 14, borderRadius: 8,
            background: chatgpt ? 'rgba(245,158,11,.06)' : 'var(--bg3)',
            border: `1px solid ${chatgpt ? 'var(--high)' : 'var(--border)'}`,
            transition: 'border-color .3s, background .3s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>ChatGPT Browser Session</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>
                  Simulates: Chrome → <span style={{ fontFamily: 'monospace', color: 'var(--txt2)' }}>chatgpt.com</span> conversation
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                <span className="dot" style={{ background: chatgpt ? 'var(--high)' : 'var(--txt3)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: chatgpt ? 'var(--high)' : 'var(--txt3)' }}>
                  {chatgpt ? 'LIVE' : 'IDLE'}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 10, lineHeight: 1.5 }}>
              Detects an active ChatGPT session in Chrome — flags internal data being pasted into conversation.
            </div>
            {chatgpt && (
              <BrowserBar
                url="chatgpt.com/c/6836f2a1-cc40-8009-a7c3-..."
                turns={12}
                size="4.2 KB"
                active
              />
            )}
            <button
              className={`btn${chatgpt ? ' d' : ' p'}`}
              style={{ width: '100%', marginTop: 12 }}
              onClick={trigger('chatgpt')}
            >
              {chatgpt ? '⏹ Stop Detection' : '▶ Trigger ChatGPT Session'}
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────── */}
      <div className="kg k4">
        <MetricCard cls="cr" num={shadowCount}               desc={summary.shadowAI.label}      label="Shadow AI"      foot={`<b>▲ +${summary.shadowAI.trend}</b> ${summary.shadowAI.detail}`}  icon={Icons.cpu} />
        <MetricCard cls="hi" num={summary.criticalRisk.count}  desc={summary.criticalRisk.label}  label="Critical Risk"  foot={summary.criticalRisk.detail}                                        icon={Icons.alert} />
        <MetricCard cls="ok" num={summary.sanctioned.count}    desc={summary.sanctioned.label}    label="Sanctioned"     foot={summary.sanctioned.detail}                                          icon={Icons.check} />
        <MetricCard cls="hi" num={summary.complianceGap.count} desc={summary.complianceGap.label} label="Compliance Gap" foot={summary.complianceGap.detail}                                      icon={Icons.shield} />
      </div>

      {/* ── AI Asset Inventory Table ───────────────────────────────── */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>AI Asset Inventory
            {(cliLlm || chatgpt) && (
              <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 600, color: 'var(--crit)', background: 'rgba(239,68,68,.1)', padding: '2px 8px', borderRadius: 4 }}>
                {[cliLlm && 'CLI LLM', chatgpt && 'ChatGPT session'].filter(Boolean).join(' + ')} detected
              </span>
            )}
          </h3>
          <SegControl options={FILTERS} active={filter} onSelect={setFilter} />
        </div>
        <table>
          <thead>
            <tr>{['Asset', 'Vendor', 'Type', 'Users', 'Risk Score', 'Data Scope', 'Sanction', ''].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {displayAssets.map(a => {
              const isSimCli  = a.sim && a.simType === 'cli'
              const isChatGPT = a.name === 'ChatGPT Plus'
              const rowStyle  = isSimCli && cliFlash
                ? { animation: 'rowFlash 1.2s ease 2' }
                : isChatGPT && cgptFlash
                ? { animation: 'rowFlash 1.2s ease 2' }
                : {}
              return (
                <tr key={a.name} style={rowStyle}>
                  <td className="pr">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isSimCli && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="dot" style={{ background: 'var(--crit)', width: 8, height: 8 }} />
                        </span>
                      )}
                      {a.name}
                      {isSimCli && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--crit)', color: '#fff', borderRadius: 4, padding: '1px 6px', letterSpacing: .4 }}>
                          NEW DETECTION
                        </span>
                      )}
                      {isChatGPT && chatgpt && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--high)', color: '#fff', borderRadius: 4, padding: '1px 6px', letterSpacing: .4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="dot" style={{ background: '#fff', width: 5, height: 5 }} /> LIVE SESSION
                        </span>
                      )}
                    </div>
                    {isSimCli && (
                      <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 2, fontFamily: 'monospace' }}>
                        ollama run llama3 · LT-VyshnaviT-3941
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
