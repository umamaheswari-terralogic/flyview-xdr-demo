import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Icons } from '../shared/icons.jsx'
import terrologicLogo from '../assets/terralogic-logo.svg'

const NAV = [
  { group: 'Workspace', items: [
    { key: 'overview', label: 'Overview', icon: Icons.home, path: '/' },
  ]},
  { group: 'Security', items: [
    { key: 'threats', label: 'Threats', icon: Icons.shield, path: '/threats', badge: 3, badgeCls: 'cr' },
    { key: 'devices', label: 'Devices', icon: Icons.laptop, path: '/devices', badge: 12, badgeCls: 'hi' },
    { key: 'monitor', label: 'Monitor', icon: Icons.activity, path: '/monitor', badge: 5, badgeCls: 'hi' },
  ]},
  { group: 'Identity & Access', items: [
    { key: 'identity', label: 'Identity', icon: Icons.user, path: '/identity', badge: 4, badgeCls: 'cr' },
  ]},
  { group: 'Infrastructure', items: [
    { key: 'cloud', label: 'Cloud', icon: Icons.cloud, path: '/cloud', badge: 7, badgeCls: 'hi' },
    { key: 'network', label: 'Network', icon: Icons.network, path: '/network' },
  ]},
  { group: 'Compliance', items: [
    { key: 'privacy', label: 'Privacy', icon: Icons.lock, path: '/privacy', badge: 1, badgeCls: 'me' },
    { key: 'aispm', label: 'AI-SPM', icon: Icons.clock, path: '/aispm', badge: 3, badgeCls: 'hi' },
  ]},
]

const BOTTOM_NAV = [
  { key: 'clients', label: 'Clients', icon: Icons.building, path: '/clients' },
  { key: 'reports', label: 'Reports', icon: Icons.file, path: '/reports' },
  { key: 'settings', label: 'Settings', icon: Icons.settings, path: '/settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = path => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <aside className={`side${collapsed ? ' side-collapsed' : ''}`}>
      <div className="side-top">
        {/* Brand */}
        <div className="brand">
          {collapsed
            ? <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: 14 }}>F</div>
            : <img src={terrologicLogo} alt="Terralogic FlyView" style={{ width: 136, height: 'auto', display: 'block' }} />
          }
        </div>

        {/* Tenant Selector */}
        <div className="tenant">
          <div className="t-av">TL</div>
          {!collapsed && <div>
            <div className="t-name">Terralogic</div>
            <div className="t-sub">▾</div>
          </div>}
        </div>

        {/* Main Nav */}
        <nav>
          {NAV.map(group => (
            <div key={group.group}>
              {!collapsed && <div className="nl">{group.group}</div>}
              {group.items.map(item => (
                <a
                  key={item.key}
                  className={isActive(item.path) ? 'on' : ''}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!collapsed && item.label}
                  {!collapsed && item.badge && (
                    <span className="nb" style={{ background: `var(--${item.badgeCls}L)`, color: `var(--${item.badgeCls})` }}>
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge && (
                    <span className="nb nb-dot" style={{ background: `var(--${item.badgeCls})` }} />
                  )}
                </a>
              ))}
            </div>
          ))}

          <div className="sd" />

          {BOTTOM_NAV.map(item => (
            <a
              key={item.key}
              className={isActive(item.path) ? 'on' : ''}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Footer — profile + collapse toggle */}
      <div className="side-foot">
        <div className="av">AM</div>
        {!collapsed && <>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="un">Ahmed M.</div>
            <div className="ur">Security Admin</div>
          </div>
          <div className="live">
            <div className="dot" />
            Live
          </div>
        </>}
        {/* Collapse / expand toggle */}
        <button
          className="side-toggle"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>
    </aside>
  )
}
