export default function InfoRow({ label, children }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 140, fontSize: 11, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '.06em', paddingTop: 2 }}>{label}</div>
      <div style={{ flex: 1, fontSize: 13, color: 'var(--txt2)' }}>{children}</div>
    </div>
  )
}
