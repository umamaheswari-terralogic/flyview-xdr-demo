// Central owner + the apps they are mapped to.
const OWNER = { name: "Venkatesh", x: 190, y: 175, w: 180, h: 52 };

const APPS = [
  { name: "Microsoft",        cx: 280, cy: 60,  rx: 62, ry: 26 },
  { name: "Slack",            cx: 130, cy: 300, rx: 62, ry: 26 },
  { name: "Google Workspace", cx: 450, cy: 300, rx: 80, ry: 30 },
];

// Edge from the owner rectangle's center to a point on the target ellipse's rim.
function edgeToEllipse(owner, app) {
  const ox = owner.x + owner.w / 2;
  const oy = owner.y + owner.h / 2;
  const dx = app.cx - ox;
  const dy = app.cy - oy;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  // point where the edge exits the owner rectangle's perimeter
  const tr = Math.min((owner.w / 2) / Math.abs(ux || 1e-9), (owner.h / 2) / Math.abs(uy || 1e-9));
  const x1 = ox + ux * tr;
  const y1 = oy + uy * tr;
  // true distance from the ellipse center to its rim along the edge direction,
  // then pull the endpoint 6px outside so the arrowhead sits on the border
  const t = 1 / Math.hypot(ux / app.rx, uy / app.ry);
  const x2 = app.cx - ux * (t + 6);
  const y2 = app.cy - uy * (t + 6);
  return { x1, y1, x2, y2 };
}

export default function OwnerMappingTab() {
  return (
    <div className="card">
      <div className="card-h">
        <div>
          <h3>Identity Mapping</h3>
          <div className="meta">Identity → application ownership</div>
        </div>
        <button className="btn p">+ Map owner</button>
      </div>

      <div className="card-b">
        <svg viewBox="0 0 560 400" style={{ width: "100%", height: "auto" }}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--txt2)" />
            </marker>
          </defs>

          {/* edges */}
          {APPS.map(app => {
            const e = edgeToEllipse(OWNER, app);
            return (
              <line key={app.name}
                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke="var(--txt2)" strokeWidth="1.5" markerEnd="url(#arrow)" />
            );
          })}

          {/* owner node */}
          <g>
            <rect x={OWNER.x} y={OWNER.y} width={OWNER.w} height={OWNER.h} rx="8"
              fill="var(--orangeL)" stroke="var(--orange)" strokeWidth="1.5" />
            <text x={OWNER.x + OWNER.w / 2} y={OWNER.y + OWNER.h / 2}
              textAnchor="middle" dominantBaseline="central"
              fontSize="14" fontWeight="700" fill="var(--txt)">{OWNER.name}</text>
          </g>

          {/* app nodes */}
          {APPS.map(app => (
            <g key={app.name}>
              <ellipse cx={app.cx} cy={app.cy} rx={app.rx} ry={app.ry}
                fill="var(--white)" stroke="var(--border2)" strokeWidth="1.5" />
              <text x={app.cx} y={app.cy} textAnchor="middle" dominantBaseline="central"
                fontSize="13" fontWeight="600" fill="var(--txt)">{app.name}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
