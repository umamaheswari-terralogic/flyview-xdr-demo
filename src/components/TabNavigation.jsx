export default function TabNavigation({ tabs, activeTab, onTabChange }) {
  if (!tabs || tabs.length === 0) return null

  const BADGE_MAP = {
    Incidents: { count: 3, cls: 'cr' },
    'Active Alerts': { count: 5, cls: 'cr' },
  }

  return (
    <div className="subnav">
      {tabs.map(tab => {
        const badge = BADGE_MAP[tab]
        return (
          <a
            key={tab}
            className={activeTab === tab ? 'on' : ''}
            onClick={() => onTabChange(tab)}
          >
            {tab}
            {badge && <span className="snb">{badge.count}</span>}
          </a>
        )
      })}
    </div>
  )
}
