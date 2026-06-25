import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SummaryCard from '../../components/SummaryCard.jsx'
import { Icons } from '../../shared/icons.jsx'
import { OverviewService } from '../../services/OverviewService.js'

const SURFACE_ICONS = {
  threats: Icons.shield, devices: Icons.laptop, monitor: Icons.activity,
  identity: Icons.user, cloud: Icons.cloud, network: Icons.wifi,
  privacy: Icons.lock, aispm: Icons.cpu,
}

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

function BreachGauge({ score, label, labelColor, trend, trendColor, note }) {
  const pct = score / 100
  const dashArray = 289
  const dashOffset = dashArray * (1 - pct)

  return (
    <div className="card">
      <div className="card-h">
        <h3>Breach probability</h3>
        <span className="meta">30-day</span>
      </div>
      <div className="card-b">
        <svg width="100%" viewBox="0 0 220 130" style={{ display: 'block', margin: 'auto', maxWidth: 240 }}>
          <defs>
            <linearGradient id="ag" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
          <path d="M18 115 A92 92 0 0 1 202 115" fill="none" stroke="#F0F4F8" strokeWidth="16" strokeLinecap="round" />
          <path
            d="M18 115 A92 92 0 0 1 202 115"
            fill="none"
            stroke="url(#ag)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={dashArray}
            strokeDashoffset={dashArray - (dashArray * pct)}
          />
          <text x="110" y="100" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="36" fontWeight="700" fill="#0D1B2A">{score}</text>
          <text x="110" y="116" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fill="#8FA3B4">out of 100</text>
        </svg>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: labelColor }}>{label}</div>
          <div style={{ fontSize: 11, color: trendColor, marginTop: 2 }}>{trend}</div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 10, lineHeight: 1.6 }}>
          {note}
        </div>
      </div>
    </div>
  )
}

export default function Overview() {
  const navigate = useNavigate()
  const [surfaces, setSurfaces] = useState([])
  const [attention, setAttention] = useState([])
  const [breach, setBreach] = useState(null)
  const [posture, setPosture] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      OverviewService.getSurfaces(),
      OverviewService.getAttentionItems(),
      OverviewService.getBreachProbability(),
      OverviewService.getPostureByModule(),
    ]).then(([s, a, b, p]) => {
      setSurfaces(s)
      setAttention(a)
      setBreach(b)
      setPosture(p)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="loading-state">Loading overview…</div>
  }

  return (
    <>
      {/* Surface Grid */}
      <div className="sg">
        {surfaces.map(s => (
          <SummaryCard
            key={s.key}
            severity={s.severity}
            icon={SURFACE_ICONS[s.key]}
            label={s.label}
            value={s.value}
            desc={s.desc}
            trend={s.trend}
            trendColor={s.trendColor}
            onClick={() => navigate(`/${s.key}`)}
          />
        ))}
      </div>

      {/* 2-column layout */}
      <div className="g2">
        {/* Attention Items */}
        <div className="card">
          <div className="card-h">
            <h3>Needs your attention</h3>
            <span className="meta">Sorted by cross-module impact score</span>
          </div>
          {attention.map((item, i) => (
            <div key={i} className={`ac ${item.severity}`}>
              <div>
                <div className="at">{item.title}</div>
                <div className="cs">
                  {item.chips.map(c => (
                    <span key={c} className="ch">{c}</span>
                  ))}
                </div>
                <div className="ab brow">
                  {item.actions.map(a => (
                    <button
                      key={a.label}
                      className={`btn ${a.type}`}
                      onClick={() => item.incidentId && navigate(`/threats/${item.incidentId}`)}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className="att-foot">
            {Icons.check}
            142 other items healthy across all surfaces — nothing else needs a human
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {breach && (
            <BreachGauge
              score={breach.score}
              label={breach.label}
              labelColor={breach.labelColor}
              trend={breach.trend}
              trendColor={breach.trendColor}
              note={breach.note}
            />
          )}

          <div className="card">
            <div className="card-h">
              <h3>Posture by surface</h3>
            </div>
            <div className="card-b">
              {posture.map(p => (
                <RowBar key={p.label} label={p.label} pct={p.pct} color={p.color} val={p.val} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
