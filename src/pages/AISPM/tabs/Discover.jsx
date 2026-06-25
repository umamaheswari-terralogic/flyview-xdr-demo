import { useState, useEffect } from 'react'
import MetricCard from '../../../components/MetricCard.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import WidgetCard from '../../../components/WidgetCard.jsx'
import { AISPMService } from '../../../services/AISPMService.js'
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

function RiskBar({ risk, riskCls }) {
  const color = riskCls === 'cr' ? 'var(--crit)' : riskCls === 'hi' ? 'var(--high)' : riskCls === 'me' ? 'var(--med)' : 'var(--ok)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className="pb" style={{ width: 60 }}>
        <i style={{ width: `${risk}%`, background: color }} />
      </div>
      <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: riskCls === 'cr' || riskCls === 'hi' ? color : 'var(--txt2)' }}>{risk}</span>
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

export default function AISPMDiscover() {
  const [summary, setSummary]     = useState(null)
  const [assets, setAssets]       = useState([])
  const [events, setEvents]       = useState([])
  const [registry, setRegistry]   = useState([])
  const [nist, setNist]           = useState([])
  const [filter, setFilter]       = useState('All')
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      AISPMService.getSummary(),
      AISPMService.getAssets(),
      AISPMService.getDetectionEvents(),
      AISPMService.getEuAiActRegistry(),
      AISPMService.getNistRmf(),
    ]).then(([s, a, e, r, n]) => {
      setSummary(s)
      setAssets(a)
      setEvents(e)
      setRegistry(r)
      setNist(n)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading-state">Loading AI-SPM data…</div>

  const FILTERS = ['All', 'Shadow', 'Sanctioned', 'Review']
  const filtered = filter === 'All' ? assets
    : filter === 'Shadow'     ? assets.filter(a => a.sanction === 'SHADOW')
    : filter === 'Sanctioned' ? assets.filter(a => a.sanction === 'SANCTIONED')
    : assets.filter(a => a.sanction === 'REVIEW')

  return (
    <>
      {/* KPI Cards */}
      <div className="kg k4">
        <MetricCard cls="cr" num={summary.shadowAI.count}      desc={summary.shadowAI.label}      label="Shadow AI"      foot={`<b>▲ +${summary.shadowAI.trend}</b> ${summary.shadowAI.detail}`}        icon={Icons.cpu} />
        <MetricCard cls="hi" num={summary.criticalRisk.count}  desc={summary.criticalRisk.label}  label="Critical Risk"  foot={summary.criticalRisk.detail}                                              icon={Icons.alert} />
        <MetricCard cls="ok" num={summary.sanctioned.count}    desc={summary.sanctioned.label}    label="Sanctioned"     foot={summary.sanctioned.detail}                                                icon={Icons.check} />
        <MetricCard cls="hi" num={summary.complianceGap.count} desc={summary.complianceGap.label} label="Compliance Gap" foot={summary.complianceGap.detail}                                            icon={Icons.shield} />
      </div>

      {/* AI Asset Inventory Table */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h">
          <h3>AI Asset Inventory</h3>
          <SegControl options={FILTERS} active={filter} onSelect={setFilter} />
        </div>
        <table>
          <thead>
            <tr>
              {['Asset', 'Vendor', 'Type', 'Users', 'Risk Score', 'Data Scope', 'Sanction', ''].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.name}>
                <td className="pr">{a.name}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Widgets */}
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
          {nist.map(n => (
            <RowBar key={n.label} label={n.label} pct={n.pct} color={n.color} val={n.val} />
          ))}
        </WidgetCard>
      </div>
    </>
  )
}
