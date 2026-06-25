export default function StatusBadge({ status, cls }) {
  const map = {
    OPEN: 'cr', RESOLVED: 'ok', 'IN PROGRESS': 'hi', COMPLETED: 'ok',
    SUBMITTED: 'ne', ACTIVE: 'ok', OFFBOARDING: 'hi', 'IN REVIEW': 'or',
    OVERDUE: 'cr', SHADOW: 'cr', SANCTIONED: 'ok', REVIEW: 'or',
    HEALTHY: 'ok', ERROR: 'cr', ONLINE: 'ok', OFFLINE: 'cr',
    COMPLIANT: 'ok', 'NON-COMPLIANT': 'cr', 'GRACE PERIOD': 'hi',
    UNAUTHORIZED: 'cr', AUTHORIZED: 'ok', PLANNED: 'ne', CONFIRMED: 'hi',
    PROBABLE: 'me', CRITICAL: 'cr',
  }
  const c = cls ?? map[status?.toUpperCase()] ?? 'ne'
  return (
    <span className={`b ${c}`}>
      <i />
      {status}
    </span>
  )
}
