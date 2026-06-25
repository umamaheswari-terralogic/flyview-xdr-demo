export default function SeverityBadge({ severity, cls }) {
  const map = {
    CRITICAL: 'cr', HIGH: 'hi', MEDIUM: 'me', LOW: 'ok', INFO: 'in',
  }
  const c = cls ?? map[severity?.toUpperCase()] ?? 'ne'
  return (
    <span className={`b ${c}`}>
      <i />
      {severity}
    </span>
  )
}
