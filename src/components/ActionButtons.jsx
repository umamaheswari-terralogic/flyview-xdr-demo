const ACTION_CONFIG = {
  View: { label: 'View', type: '' },
  Escalate: { label: 'Escalate', type: 'd' },
  Isolate: { label: 'Isolate', type: 'd' },
  Suspend: { label: 'Suspend', type: 'd' },
  PatchNow: { label: 'Patch Now', type: 'p' },
  Remediate: { label: 'Remediate', type: 'p' },
  Block: { label: 'Block', type: 'd' },
  Revoke: { label: 'Revoke all', type: 'd' },
}

export default function ActionButtons({ actions = [], onAction }) {
  return (
    <div className="brow">
      {actions.map(action => {
        const cfg = ACTION_CONFIG[action] ?? { label: action, type: '' }
        return (
          <button
            key={action}
            className={`btn ${cfg.type}`}
            onClick={e => { e.stopPropagation(); onAction?.(action) }}
          >
            {cfg.label}
          </button>
        )
      })}
    </div>
  )
}
