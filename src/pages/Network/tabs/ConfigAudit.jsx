const KPI = [
  { key: 'UNAUTHORIZED', num: 2, desc: 'Unauthorised configuration changes', foot: 'No change record',         cls: 'cr',   icon: '⚠' },
  { key: 'AUTHORIZED',   num: 1, desc: 'Authorised change (Panorama)',       foot: 'fw-core-01 · approved',   cls: 'ok',   icon: '✓' },
  { key: 'MONITORED',    num: 4, desc: 'Devices monitored for drift',        foot: 'Baseline comparison',     cls: 'info', icon: '◎' },
  { key: 'SNAPSHOTS',    num: 18,desc: 'Config snapshots stored',            foot: 'NETCONF + SNMP',          cls: 'ok',   icon: '◎' },
]

const EVENTS = [
  {
    device: 'sw-access-03', title: 'ACL rule added',
    vendor: 'Cisco Catalyst', detail: 'No change ticket · No approver · Unauthorized',
    status: 'UNAUTHORIZED', statusCls: 'cr',
    date: 'Jun 28 08:20', note: 'Rollback available',
    icon: '⚠', iconCls: 'cr',
  },
  {
    device: 'sw-dc-02', title: 'Interface shutdown',
    vendor: 'Juniper EX4300', detail: 'No change record · Coincides with offline event',
    status: 'UNAUTHORIZED', statusCls: 'cr',
    date: 'Jun 28 05:08', note: 'Under investigation',
    icon: '⚠', iconCls: 'cr',
  },
  {
    device: 'fw-core-01', title: 'Policy update',
    vendor: 'Palo Alto PA-3260', detail: 'Via Panorama · CHG-0281 · Approved by ahmed.m',
    status: 'AUTHORIZED', statusCls: 'ok',
    date: 'Jun 27 22:00', note: 'Authorized',
    icon: '✓', iconCls: 'ok',
  },
  {
    device: 'velo-edge-01', title: 'Routing update',
    vendor: 'VMware VCG', detail: 'BGP neighbor config · CHG-0280 · SD-WAN policy',
    status: 'AUTHORIZED', statusCls: 'ok',
    date: 'Jun 26 14:00', note: 'Authorized',
    icon: '✓', iconCls: 'ok',
  },
]

const DIFF_LINES = [
  { text: 'interface GigabitEthernet1/0/24',    type: 'ctx' },
  { text: ' switchport mode access',             type: 'ctx' },
  { text: ' switchport access vlan 10',          type: 'ctx' },
  { text: '+ ip access-group DENY-MGMT in',     type: 'add' },
  { text: '+ ip access-group ALLOW-VLAN28 out', type: 'add' },
  { text: ' spanning-tree portfast',             type: 'ctx' },
]

const POLICY = [
  { label: 'Snapshot frequency', value: 'Every 15 min via NETCONF/SNMP' },
  { label: 'Diff engine',        value: 'Unified diff · line-level'      },
  { label: 'Alert on change',    value: 'Immediate · SIEM emitted'       },
  { label: 'Retention',          value: '30 snapshots per device'        },
  { label: 'Approved changes',   value: 'Via ITSM change ticket ref'     },
  { label: 'Rollback method',    value: 'NETCONF replace-config'         },
]

const CLS_COLOR = { cr: 'var(--crit)', hi: 'var(--high)', me: 'var(--med)', ok: 'var(--ok)', info: 'var(--info)' }

export default function ConfigAudit() {
  return (
    <>
      {/* KPI strip */}
      <div className="kg k4" style={{ marginBottom: 18 }}>
        {KPI.map(k => (
          <div key={k.key} className="card" style={{ padding: '18px 22px', borderTop: `3px solid ${CLS_COLOR[k.cls]}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: 'var(--txt3)', marginBottom: 6, textTransform: 'uppercase' }}>{k.key}</div>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 36, fontWeight: 700, color: CLS_COLOR[k.cls], lineHeight: 1 }}>{k.num}</div>
              </div>
              <div style={{ fontSize: 20, color: CLS_COLOR[k.cls], opacity: 0.5 }}>{k.icon}</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 8 }}>{k.desc}</div>
            <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 4 }}>{k.foot}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18, alignItems: 'flex-start' }}>
        {/* Left — config change event cards */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--txt3)', marginBottom: 12 }}>Config Change Events (7D)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {EVENTS.map((e, i) => (
              <div key={i} className="card" style={{ padding: '14px 18px', borderLeft: `4px solid ${CLS_COLOR[e.statusCls]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0, marginTop: 2,
                      background: `${CLS_COLOR[e.iconCls]}18`,
                      border: `1px solid ${CLS_COLOR[e.iconCls]}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, color: CLS_COLOR[e.iconCls],
                    }}>{e.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>
                        <span style={{ color: CLS_COLOR[e.statusCls] }}>{e.device}</span>
                        <span style={{ color: 'var(--txt2)', fontWeight: 400 }}> — {e.title}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 8 }}>
                        {e.vendor} · {e.detail}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={'b ' + e.statusCls} style={{ fontSize: 11 }}><i />{e.status}</span>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--txt3)', background: 'var(--bg2)', padding: '2px 7px', borderRadius: 4 }}>{e.date}</span>
                        <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{e.note}</span>
                      </div>
                    </div>
                  </div>
                  {e.statusCls === 'cr' && (
                    <button className="btn d" style={{ marginLeft: 12, flexShrink: 0 }}>Rollback</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — baseline diff + policy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Baseline diff panel */}
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--txt3)', padding: '14px 16px 8px' }}>
              Baseline Diff — SW-ACCESS-03
            </div>
            <div style={{ padding: '0 16px 4px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--crit)', marginBottom: 6 }}>Config Delta (Unauthorized Change)</div>
              <div style={{
                background: '#0d1117', borderRadius: 7, padding: '12px 14px',
                fontFamily: 'JetBrains Mono,monospace', fontSize: 11, lineHeight: 1.75,
              }}>
                {DIFF_LINES.map((l, i) => (
                  <div key={i} style={{
                    color: l.type === 'add' ? '#f85149' : '#8b949e',
                    fontWeight: l.type === 'add' ? 600 : 400,
                  }}>{l.text}</div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, padding: '12px 16px 14px', flexWrap: 'wrap' }}>
              <button className="btn d">Rollback to Baseline</button>
              <button className="btn">Approve Change</button>
              <button className="btn">View Full Diff</button>
            </div>
          </div>

          {/* Baseline policy panel */}
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--txt3)', padding: '14px 16px 8px' }}>Baseline Policy</div>
            <div style={{ padding: '4px 16px 14px' }}>
              {POLICY.map(p => (
                <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--txt3)' }}>{p.label}</span>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--txt2)', textAlign: 'right', maxWidth: 190 }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
