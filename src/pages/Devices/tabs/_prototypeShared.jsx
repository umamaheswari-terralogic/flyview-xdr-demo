// Shared helpers ported from src/assets/flyview-windows-prototype_15.html
// Used by Overview.jsx, AllDevices.jsx, Enrollment.jsx (Devices module tabs)

export function Icon({ path, size = 15, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      {path}
    </svg>
  )
}

export const paths = {
  qrcode: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h4v4h-4zM14 21h3M21 14v3"/></>,
  monitor: <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>,
  alert: <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4M12 17h.01"/></>,
  lock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
  search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
}

export const Ico = (name, props = {}) => <Icon path={paths[name]} {...props} />

export const devicesSeed = [
  { id: 'd1', name: 'TVyshnavi-3941', user: 'vyshnavi.thatikonda@terralogic.com', os: 'Windows 11', osVersion: '11', status: 'NON-COMPLIANT', enrollment: 'MSI', lastSeen: 'Just now',
    checks: [{ name: 'BitLocker encryption', pass: false }, { name: 'Antivirus active', pass: false }, { name: 'OS version minimum', pass: true }, { name: 'Passcode/PIN required', pass: true }] },
  { id: 'd2', name: 'LT-srinivasa-3424', user: 'srinivasa@terralogic.com', os: 'Windows 11', osVersion: '11', status: 'NON-COMPLIANT', enrollment: 'MSI', lastSeen: '14 min',
    checks: [{ name: 'BitLocker encryption', pass: false }, { name: 'Firewall enabled', pass: true }, { name: 'OS version minimum', pass: true }, { name: 'Antivirus active', pass: true }] },
  { id: 'd3', name: 'LT-Yamini-3621', user: 'yamini.kalvai@terralogic.com', os: 'Windows 10', osVersion: '10', status: 'NON-COMPLIANT', enrollment: 'MSI', lastSeen: '1h 4m',
    checks: [{ name: 'BitLocker encryption', pass: false }, { name: 'OS version minimum', pass: false }, { name: 'Antivirus active', pass: true }] },
  { id: 'd4', name: 'LT-Laiju-4711', user: 'laiju.g@terralogic.com', os: 'Windows 11', osVersion: '11', status: 'COMPLIANT', enrollment: 'MSI', lastSeen: '7 min',
    checks: [{ name: 'BitLocker encryption', pass: true }, { name: 'OS version minimum', pass: true }, { name: 'Antivirus active', pass: true }, { name: 'Firewall enabled', pass: true }] },
  { id: 'd5', name: 'LT-Maqsood-4712', user: 'maqsood.a@terralogic.com', os: 'Windows 11', osVersion: '11', status: 'NON-COMPLIANT', enrollment: 'MSI', lastSeen: '22 min',
    checks: [{ name: 'Antivirus active', pass: false }, { name: 'BitLocker encryption', pass: true }, { name: 'OS version minimum', pass: true }] },
  { id: 'd6', name: 'WIN-SALES-031', user: 's.rao@terralogic.com', os: 'Windows 11', osVersion: '11', status: 'COMPLIANT', enrollment: 'MSI', lastSeen: '3 min',
    checks: [{ name: 'BitLocker encryption', pass: true }, { name: 'OS version minimum', pass: true }, { name: 'Antivirus active', pass: true }, { name: 'Firewall enabled', pass: true }] },
  { id: 'd7', name: 'WIN-DEV-055', user: 'p.nair@terralogic.com', os: 'Windows 11', osVersion: '11', status: 'COMPLIANT', enrollment: 'MSI', lastSeen: '9 min',
    checks: [{ name: 'BitLocker encryption', pass: true }, { name: 'OS version minimum', pass: true }, { name: 'Antivirus active', pass: true }] },
  { id: 'd8', name: 'LT-Kavya-4820', user: 'kavya.s@terralogic.com', os: 'Windows 10', osVersion: '10', status: 'GRACE PERIOD', enrollment: 'MSI', lastSeen: '18 min',
    checks: [{ name: 'BitLocker encryption', pass: true }, { name: 'OS version minimum', pass: false }, { name: 'Antivirus active', pass: true }] },
  { id: 'd9', name: 'LT-Ramya-3865', user: 'Ramya@terralogic.com', os: 'macOS 14.5', osVersion: '14.5', status: 'COMPLIANT', enrollment: 'DEP', lastSeen: '2 min',
    checks: [{ name: 'FileVault encryption', pass: true }, { name: 'SIP enabled', pass: true }, { name: 'Gatekeeper enabled', pass: true }] },
  { id: 'd10', name: 'MAC-Sandeep-4102', user: 'sandeep.m@terralogic.com', os: 'macOS 14.5', osVersion: '14.5', status: 'COMPLIANT', enrollment: 'DEP', lastSeen: '3 min',
    checks: [{ name: 'FileVault encryption', pass: true }, { name: 'SIP enabled', pass: true }, { name: 'Gatekeeper enabled', pass: true }] },
  { id: 'd11', name: 'LT-uma-3865', user: 'uma@terralogic.com', os: 'macOS 13.7', osVersion: '13.7', status: 'NON-COMPLIANT', enrollment: 'Manual', lastSeen: '32 min',
    checks: [{ name: 'FileVault encryption', pass: false }, { name: 'SIP enabled', pass: true }, { name: 'Gatekeeper enabled', pass: true }] },
]

export function statusStyle(status) {
  if (status === 'COMPLIANT' || status === 'ACTIVE' || status === 'ENROLLED') return { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' }
  if (status === 'GRACE PERIOD' || status === 'PARTIAL' || status === 'PENDING POLICY') return { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' }
  if (status === 'OPTIONAL') return { dot: 'bg-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50' }
  if (status === 'AWAITING DEVICE') return { dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-100' }
  return { dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' }
}

export function KpiCard({ color, icon, label, value, sub, trend }) {
  const borderColor = { emerald: 'border-t-emerald-500', rose: 'border-t-rose-500', amber: 'border-t-amber-500' }[color]
  const iconBg = { emerald: 'bg-emerald-50 text-emerald-600', rose: 'bg-rose-50 text-rose-600', amber: 'bg-amber-50 text-amber-600' }[color]
  return (
    <div className={`bg-white border border-gray-100 border-t-4 ${borderColor} rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] tracking-wider text-gray-400 font-medium">{label}</span>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${iconBg}`}>{Ico(icon)}</div>
      </div>
      <div className="text-3xl font-semibold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{sub}</div>
      {trend && <div className="text-xs mt-1 text-gray-400">{trend}</div>}
    </div>
  )
}

export function DeviceRow({ d, onView }) {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50">
      <td className="py-3 px-4 text-sm">
        <button onClick={() => onView(d.id)} className="font-medium text-gray-800 hover:text-orange-600 hover:underline text-left">{d.name}</button>
      </td>
      <td className="py-3 px-4 text-sm text-gray-500">{d.user}</td>
      <td className="py-3 px-4 text-sm text-gray-700">{d.os.startsWith('Windows') ? '🪟' : '🍎'} {d.os}</td>
      <td className="py-3 px-4"><span className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600">{d.enrollment}</span></td>
      <td className="py-3 px-4 text-sm text-gray-400 font-mono">{d.osVersion}</td>
      <td className="py-3 px-4 text-sm text-gray-500">{d.lastSeen}</td>
    </tr>
  )
}
