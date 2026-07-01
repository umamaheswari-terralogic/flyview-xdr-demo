const COLORS = {
  gray:  { border: '#9ca3af', text: '#6b7280' },
  green: { border: '#16a34a', text: '#16a34a' },
  amber: { border: '#d97706', text: '#d97706' },
  red:   { border: '#dc2626', text: '#dc2626' },
  blue:  { border: '#2563eb', text: '#2563eb' },
}

// Each node: center coords, label, sublabel, color key
const NODES = [
  { id: 'isp',      label: 'ISP Router',    sub: 'rtr-isp-01',              x: 450, y: 90,  color: 'gray'  },
  { id: 'fw-core',  label: 'fw-core-01',    sub: 'Palo Alto · HQ',          x: 270, y: 235, color: 'green' },
  { id: 'fw-br',    label: 'fw-branch-01',  sub: 'Palo Alto · Branch-SG',   x: 660, y: 235, color: 'green' },
  { id: 'sw-core',  label: 'sw-core-01',    sub: 'Cisco · HQ Core',         x: 160, y: 378, color: 'green' },
  { id: 'lb',       label: 'lb-prod-01/02', sub: 'F5 BIG-IP · DC-1',        x: 440, y: 378, color: 'green' },
  { id: 'velo',     label: 'velo-edge-01',  sub: 'VMware · Branch-SG',      x: 710, y: 378, color: 'green' },
  { id: 'sw-acc03', label: 'sw-access-03',  sub: 'Cisco · HQ · DRIFT',      x: 120, y: 515, color: 'amber' },
  { id: 'sw-dc01',  label: 'sw-dc-01',      sub: 'Juniper · DC-1',          x: 440, y: 515, color: 'green' },
  { id: 'sw-dc02',  label: 'sw-dc-02',      sub: 'Juniper · DC-1 · OFFLINE',x: 650, y: 515, color: 'red'   },
  { id: 'eps',      label: 'Endpoints /24', sub: '847 managed devices',     x: 120, y: 650, color: 'blue'  },
  { id: 'srv',      label: 'Servers /24',   sub: 'DC-1 server farm',        x: 440, y: 650, color: 'blue'  },
]

// Box half-widths and half-heights
const W = 82  // half-width of node box
const H = 24  // half-height of node box

// Edges: from/to are node ids; stroke = color hex; dashed = bool
const EDGES = [
  { from: 'isp',      to: 'fw-core',  stroke: '#9ca3af', dashed: false },
  { from: 'isp',      to: 'fw-br',    stroke: '#9ca3af', dashed: false },
  { from: 'fw-core',  to: 'sw-core',  stroke: '#9ca3af', dashed: false },
  { from: 'fw-core',  to: 'lb',       stroke: '#9ca3af', dashed: false },
  { from: 'fw-br',    to: 'velo',     stroke: '#9ca3af', dashed: false },
  { from: 'sw-core',  to: 'sw-acc03', stroke: '#d97706', dashed: false },
  { from: 'lb',       to: 'sw-dc01',  stroke: '#9ca3af', dashed: false },
  { from: 'sw-dc01',  to: 'sw-dc02',  stroke: '#dc2626', dashed: true  },
  { from: 'sw-acc03', to: 'eps',      stroke: '#d97706', dashed: false },
  { from: 'sw-dc01',  to: 'srv',      stroke: '#9ca3af', dashed: false },
]

const PATH_ANALYSIS = [
  { label: 'Active paths',     value: '12 of 13 healthy'           },
  { label: 'Degraded paths',   value: '1 — sw-dc-02 bypass'        },
  { label: 'Redundancy',       value: 'sw-dc-01 covering DC-1'      },
  { label: 'BGP sessions',     value: '4 active · 0 down'           },
  { label: 'OSPF adjacencies', value: '8 active · 0 stuck'          },
  { label: 'STP root',         value: 'sw-core-01 (priority 4096)'  },
]

const SITES = [
  { name: 'HQ',        loc: 'London · 22 devices',         status: 'HEALTHY',   cls: 'ok' },
  { name: 'DC-1',      loc: 'London Colocation · 18 devices', status: 'ATTENTION', cls: 'hi' },
  { name: 'Branch-SG', loc: 'Singapore · 14 devices',      status: 'HEALTHY',   cls: 'ok' },
  { name: 'Branch-NY', loc: 'New York · 8 devices',        status: 'HEALTHY',   cls: 'ok' },
  { name: 'Cloud GW',  loc: 'AWS VPC · 2 virtual',         status: 'HEALTHY',   cls: 'ok' },
]

const LEGEND_ITEMS = [
  { color: '#16a34a', border: true,  label: 'Green border',          desc: 'Device online · fully healthy'  },
  { color: '#d97706', border: true,  label: 'Yellow / amber border',  desc: 'Config drift detected'          },
  { color: '#dc2626', border: true,  label: 'Red border',             desc: 'Device offline'                 },
  { color: '#dc2626', border: false, label: 'Dashed red line',        desc: 'Degraded / failed path'         },
  { color: '#9ca3af', border: false, label: 'Solid line',             desc: 'Active link'                    },
]

function nodeById(id) { return NODES.find(n => n.id === id) }

function edgeLine(e) {
  const fr = nodeById(e.from)
  const to = nodeById(e.to)
  if (!fr || !to) return null

  // For horizontal edge (sw-dc-01 → sw-dc-02): connect right side to left side
  if (Math.abs(fr.y - to.y) < 10) {
    return { x1: fr.x + W, y1: fr.y, x2: to.x - W, y2: to.y }
  }
  // Normal: bottom center to top center
  return { x1: fr.x, y1: fr.y + H, x2: to.x, y2: to.y - H }
}

export default function Topology() {
  return (
    <>
      {/* SVG topology */}
      <div className="card" style={{ marginBottom: 18, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', background: '#eef2f7', borderRadius: '10px 10px 0 0' }}>
          <svg viewBox="0 0 900 710" style={{ display: 'block', width: '100%', minWidth: 700, maxHeight: 700 }}>
            {/* background */}
            <rect width="900" height="710" fill="#eef2f7" />

            {/* edges */}
            {EDGES.map((e, i) => {
              const coords = edgeLine(e)
              if (!coords) return null
              return (
                <line key={i}
                  x1={coords.x1} y1={coords.y1} x2={coords.x2} y2={coords.y2}
                  stroke={e.stroke} strokeWidth={e.dashed ? 2 : 1.5}
                  strokeDasharray={e.dashed ? '7 5' : 'none'}
                  opacity={0.7}
                />
              )
            })}

            {/* nodes */}
            {NODES.map(n => {
              const c = COLORS[n.color]
              return (
                <g key={n.id}>
                  {/* box */}
                  <rect x={n.x - W} y={n.y - H} width={W * 2} height={H * 2} rx={9}
                    fill="white" stroke={c.border} strokeWidth={2} />
                  {/* label */}
                  <text x={n.x} y={n.y - 5} textAnchor="middle" dominantBaseline="middle"
                    fontSize="13" fontWeight="700" fontFamily="inherit" fill={c.text}>
                    {n.label}
                  </text>
                  {/* sublabel below the box */}
                  <text x={n.x} y={n.y + H + 14} textAnchor="middle" dominantBaseline="middle"
                    fontSize="10" fontFamily="inherit" fill="#9ca3af">
                    {n.sub}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* legend strip */}
        <div style={{ display: 'flex', gap: 24, padding: '10px 20px 12px', background: '#eef2f7', flexWrap: 'wrap' }}>
          {[
            { dot: '#22c55e', label: 'Online' },
            { dot: '#f59e0b', label: 'Config Drift' },
            { dot: '#ef4444', label: 'Offline' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.dot }} />
              <span style={{ fontSize: 12, color: '#374151' }}>{l.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="28" height="10"><line x1="0" y1="5" x2="28" y2="5" stroke="#dc2626" strokeWidth="2" strokeDasharray="5 4" /></svg>
            <span style={{ fontSize: 12, color: '#374151' }}>Dashed = degraded path</span>
          </div>
        </div>
      </div>

      {/* 3-column info panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'flex-start' }}>

        {/* Topology Legend */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, padding: '14px 18px 10px' }}>Topology Legend</div>
          <div style={{ padding: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {LEGEND_ITEMS.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '9px 0', borderBottom: i < LEGEND_ITEMS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  {l.border ? (
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2.5px solid ${l.color}`, background: 'transparent' }} />
                  ) : (
                    <svg width="20" height="12" style={{ display: 'block' }}>
                      <line x1="0" y1="6" x2="20" y2="6" stroke={l.color} strokeWidth="2"
                        strokeDasharray={l.label.includes('Dashed') ? '5 3' : 'none'} />
                    </svg>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--txt)', lineHeight: 1.3 }}>{l.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--txt3)', marginTop: 1 }}>{l.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Path Analysis */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, padding: '14px 18px 10px' }}>Path Analysis</div>
          <div style={{ padding: '0 18px 14px' }}>
            {PATH_ANALYSIS.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 0', borderBottom: i < PATH_ANALYSIS.length - 1 ? '1px solid var(--border)' : 'none', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--txt3)', flexShrink: 0 }}>{p.label}</span>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--txt2)', textAlign: 'right' }}>{p.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sites */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, padding: '14px 18px 10px' }}>Sites</div>
          <div style={{ padding: '0 18px 14px' }}>
            {SITES.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < SITES.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>{s.loc}</div>
                </div>
                <span className={'b ' + s.cls} style={{ fontSize: 11, flexShrink: 0 }}><i />{s.status}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
