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
  laptop: <><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/></>,
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></>,
  x: <path d="M18 6 6 18M6 6l12 12"/>,
  check: <path d="M20 6 9 17l-5-5"/>,
  package: <><path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></>,
  terminal: <><path d="m4 17 6-6-6-6M12 19h8"/></>,
}

export const Ico = (name, props = {}) => <Icon path={paths[name]} {...props} />

export const devicesSeed = [
  { id: 'd1', name: 'TVyshnavi-3941', user: 'vyshnavi.thatikonda@terralogic.com', os: 'Windows 11', osVersion: '11', osBuild: '22631.3737', status: 'NON-COMPLIANT', enrollment: 'MSI', lastSeen: 'Just now',
    cpu: 'Intel i7-1355U', cpuCores: 10, ram: '16 GB', storage: '512 GB (312 GB free)', serial: 'PF3XJ2R1', model: 'Dell Latitude 5440',
    ipAddress: '10.42.6.113', macAddress: '3C:A6:2F:8B:11:C4', ssid: 'TerraLogic-Corp-5G', localUsers: ['vyshnavi.thatikonda', 'Administrator'],
    security: { passcodeEnabled: true, diskEncryptionEnabled: false, firewallEnabled: true, antivirusActive: false, developerModeEnabled: false },
    dlpAgent: { vendor: 'Microsoft Purview Endpoint DLP', status: 'Running' },
    mdmState: { mdmProfileInstalled: true, enrollmentProfileId: 'ENR-MSI-WIN-01', enrolledAt: '2026-06-02 09:14', lastCheckInAt: '2026-07-21 12:03', agentVersion: '1.4.2' },
    checks: [{ name: 'BitLocker encryption', pass: false }, { name: 'Antivirus active', pass: false }, { name: 'OS version minimum', pass: true }, { name: 'Passcode/PIN required', pass: true }],
    apps: [{ name: 'Microsoft 365', version: '16.84', managed: true }, { name: '1Password', version: '8.10.36', managed: true }, { name: 'Zoom', version: '6.1.6', managed: false }] },
  { id: 'd2', name: 'LT-srinivasa-3424', user: 'srinivasa@terralogic.com', os: 'Windows 11', osVersion: '11', osBuild: '22631.3593', status: 'NON-COMPLIANT', enrollment: 'MSI', lastSeen: '14 min',
    cpu: 'Intel i5-1240P', cpuCores: 12, ram: '16 GB', storage: '256 GB (90 GB free)', serial: 'PF4KL8M2', model: 'Lenovo ThinkPad T14',
    ipAddress: '10.42.6.87', macAddress: 'A4:5E:60:D2:3F:19', ssid: 'TerraLogic-Corp-5G', localUsers: ['srinivasa', 'Administrator'],
    security: { passcodeEnabled: true, diskEncryptionEnabled: false, firewallEnabled: true, antivirusActive: true, developerModeEnabled: false },
    dlpAgent: { vendor: 'Forcepoint DLP', status: 'Running' },
    mdmState: { mdmProfileInstalled: true, enrollmentProfileId: 'ENR-MSI-WIN-01', enrolledAt: '2026-05-28 11:02', lastCheckInAt: '2026-07-21 11:49', agentVersion: '1.4.2' },
    checks: [{ name: 'BitLocker encryption', pass: false }, { name: 'Firewall enabled', pass: true }, { name: 'OS version minimum', pass: true }, { name: 'Antivirus active', pass: true }],
    apps: [{ name: 'Microsoft 365', version: '16.84', managed: true }, { name: 'Intune Company Portal', version: '5.2404', managed: true }] },
  { id: 'd3', name: 'LT-Yamini-3621', user: 'yamini.kalvai@terralogic.com', os: 'Windows 10', osVersion: '10', osBuild: '19045.4291', status: 'NON-COMPLIANT', enrollment: 'MSI', lastSeen: '1h 4m',
    cpu: 'Intel i5-8250U', cpuCores: 8, ram: '8 GB', storage: '256 GB (18 GB free)', serial: 'PF2HG9T4', model: 'HP ProBook 440 G5',
    ipAddress: '10.42.7.21', macAddress: '8C:16:45:91:0B:77', ssid: 'TerraLogic-Corp-5G', localUsers: ['yamini.kalvai'],
    security: { passcodeEnabled: true, diskEncryptionEnabled: false, firewallEnabled: true, antivirusActive: true, developerModeEnabled: false },
    dlpAgent: { vendor: null, status: null },
    mdmState: { mdmProfileInstalled: true, enrollmentProfileId: 'ENR-MSI-WIN-01', enrolledAt: '2025-11-14 08:30', lastCheckInAt: '2026-07-21 11:03', agentVersion: '1.3.9' },
    checks: [{ name: 'BitLocker encryption', pass: false }, { name: 'OS version minimum', pass: false }, { name: 'Antivirus active', pass: true }],
    apps: [{ name: 'Microsoft 365', version: '16.60', managed: true }, { name: 'Suspicious Tool X', version: '1.0.0', managed: false }] },
  { id: 'd4', name: 'LT-Laiju-4711', user: 'laiju.g@terralogic.com', os: 'Windows 11', osVersion: '11', osBuild: '22631.3737', status: 'COMPLIANT', enrollment: 'MSI', lastSeen: '7 min',
    cpu: 'Intel i7-1260P', cpuCores: 12, ram: '16 GB', storage: '512 GB (400 GB free)', serial: 'PF5NB3W7', model: 'Dell Latitude 7440',
    ipAddress: '10.42.6.44', macAddress: '10:D1:7F:4C:22:8E', ssid: 'TerraLogic-Corp-5G', localUsers: ['laiju.g', 'Administrator'],
    security: { passcodeEnabled: true, diskEncryptionEnabled: true, firewallEnabled: true, antivirusActive: true, developerModeEnabled: false },
    dlpAgent: { vendor: 'Microsoft Purview Endpoint DLP', status: 'Running' },
    mdmState: { mdmProfileInstalled: true, enrollmentProfileId: 'ENR-MSI-WIN-01', enrolledAt: '2026-04-02 10:12', lastCheckInAt: '2026-07-21 11:56', agentVersion: '1.4.2' },
    checks: [{ name: 'BitLocker encryption', pass: true }, { name: 'OS version minimum', pass: true }, { name: 'Antivirus active', pass: true }, { name: 'Firewall enabled', pass: true }],
    apps: [{ name: 'Microsoft 365', version: '16.84', managed: true }, { name: '1Password', version: '8.10.36', managed: true }, { name: 'Zoom', version: '6.1.6', managed: true }] },
  { id: 'd5', name: 'LT-Maqsood-4712', user: 'maqsood.a@terralogic.com', os: 'Windows 11', osVersion: '11', osBuild: '22631.3593', status: 'NON-COMPLIANT', enrollment: 'MSI', lastSeen: '22 min',
    cpu: 'AMD Ryzen 5 7530U', cpuCores: 6, ram: '16 GB', storage: '512 GB (280 GB free)', serial: 'PF6RT1Y9', model: 'HP EliteBook 645 G10',
    ipAddress: '10.42.6.201', macAddress: 'F0:2F:74:5A:9D:03', ssid: 'TerraLogic-Corp-5G', localUsers: ['maqsood.a'],
    security: { passcodeEnabled: true, diskEncryptionEnabled: true, firewallEnabled: true, antivirusActive: false, developerModeEnabled: false },
    dlpAgent: { vendor: 'Symantec DLP', status: 'Stopped' },
    mdmState: { mdmProfileInstalled: true, enrollmentProfileId: 'ENR-MSI-WIN-01', enrolledAt: '2026-06-18 14:47', lastCheckInAt: '2026-07-21 11:41', agentVersion: '1.4.2' },
    checks: [{ name: 'Antivirus active', pass: false }, { name: 'BitLocker encryption', pass: true }, { name: 'OS version minimum', pass: true }],
    apps: [{ name: 'Microsoft 365', version: '16.84', managed: true }] },
  { id: 'd6', name: 'WIN-SALES-031', user: 's.rao@terralogic.com', os: 'Windows 11', osVersion: '11', osBuild: '22631.3737', status: 'COMPLIANT', enrollment: 'MSI', lastSeen: '3 min',
    cpu: 'Intel i5-1240P', cpuCores: 12, ram: '16 GB', storage: '256 GB (150 GB free)', serial: 'PF7CV6X3', model: 'Lenovo ThinkPad T14',
    ipAddress: '10.42.6.55', macAddress: '44:85:00:3B:6E:C1', ssid: 'TerraLogic-Corp-5G', localUsers: ['s.rao'],
    security: { passcodeEnabled: true, diskEncryptionEnabled: true, firewallEnabled: true, antivirusActive: true, developerModeEnabled: false },
    dlpAgent: { vendor: 'Microsoft Purview Endpoint DLP', status: 'Running' },
    mdmState: { mdmProfileInstalled: true, enrollmentProfileId: 'ENR-MSI-WIN-01', enrolledAt: '2026-07-18 09:20', lastCheckInAt: '2026-07-21 12:00', agentVersion: '1.4.2' },
    checks: [{ name: 'BitLocker encryption', pass: true }, { name: 'OS version minimum', pass: true }, { name: 'Antivirus active', pass: true }, { name: 'Firewall enabled', pass: true }],
    apps: [{ name: 'Microsoft 365', version: '16.84', managed: true }, { name: 'CrowdStrike Falcon', version: '7.1', managed: true }] },
  { id: 'd7', name: 'WIN-DEV-055', user: 'p.nair@terralogic.com', os: 'Windows 11', osVersion: '11', osBuild: '22631.3737', status: 'COMPLIANT', enrollment: 'MSI', lastSeen: '9 min',
    cpu: 'Intel i7-1355U', cpuCores: 10, ram: '32 GB', storage: '1 TB (620 GB free)', serial: 'PF8DM4Z1', model: 'Dell Precision 5680',
    ipAddress: '10.42.6.72', macAddress: '9C:6B:00:1E:44:2A', ssid: 'TerraLogic-Corp-5G', localUsers: ['p.nair', 'Administrator'],
    security: { passcodeEnabled: true, diskEncryptionEnabled: true, firewallEnabled: true, antivirusActive: true, developerModeEnabled: true },
    dlpAgent: { vendor: 'Forcepoint DLP', status: 'Running' },
    mdmState: { mdmProfileInstalled: true, enrollmentProfileId: 'ENR-MSI-WIN-01', enrolledAt: '2026-07-19 15:30', lastCheckInAt: '2026-07-21 11:54', agentVersion: '1.4.2' },
    checks: [{ name: 'BitLocker encryption', pass: true }, { name: 'OS version minimum', pass: true }, { name: 'Antivirus active', pass: true }],
    apps: [{ name: 'Microsoft 365', version: '16.84', managed: true }, { name: '1Password', version: '8.10.36', managed: true }, { name: 'CrowdStrike Falcon', version: '7.1', managed: true }] },
  { id: 'd8', name: 'LT-Kavya-4820', user: 'kavya.s@terralogic.com', os: 'Windows 10', osVersion: '10', osBuild: '19045.4291', status: 'GRACE PERIOD', enrollment: 'MSI', lastSeen: '18 min',
    cpu: 'Intel i5-8365U', cpuCores: 8, ram: '8 GB', storage: '256 GB (60 GB free)', serial: 'PF9FN2Q8', model: 'HP EliteBook 840 G6',
    ipAddress: '10.42.7.33', macAddress: '70:B5:E8:2C:19:D4', ssid: 'TerraLogic-Corp-5G', localUsers: ['kavya.s'],
    security: { passcodeEnabled: true, diskEncryptionEnabled: true, firewallEnabled: true, antivirusActive: true, developerModeEnabled: false },
    dlpAgent: { vendor: null, status: null },
    mdmState: { mdmProfileInstalled: true, enrollmentProfileId: 'ENR-MSI-WIN-01', enrolledAt: '2025-09-10 13:05', lastCheckInAt: '2026-07-21 11:45', agentVersion: '1.3.9' },
    checks: [{ name: 'BitLocker encryption', pass: true }, { name: 'OS version minimum', pass: false }, { name: 'Antivirus active', pass: true }],
    apps: [{ name: 'Microsoft 365', version: '16.60', managed: true }] },
  { id: 'd9', name: 'LT-Ramya-3865', user: 'Ramya@terralogic.com', os: 'macOS 14.5', osVersion: '14.5', osBuild: '23F79', status: 'COMPLIANT', enrollment: 'DEP', lastSeen: '2 min',
    cpu: 'Apple M2', cpuCores: 8, ram: '16 GB', storage: '256 GB (140 GB free)', serial: 'C02FX3941', model: 'MacBook Pro 14-inch',
    ipAddress: '10.42.6.61', macAddress: '3C:22:FB:A1:5D:02', ssid: 'TerraLogic-Corp-5G', localUsers: ['ramya'],
    security: { passcodeEnabled: true, diskEncryptionEnabled: true, firewallEnabled: true, antivirusActive: true, developerModeEnabled: false },
    dlpAgent: { vendor: 'Microsoft Purview Endpoint DLP', status: 'Running' },
    mdmState: { mdmProfileInstalled: true, enrollmentProfileId: 'ENR-DEP-MAC-01', enrolledAt: '2026-03-11 09:00', lastCheckInAt: '2026-07-21 11:58', agentVersion: '1.4.0' },
    checks: [{ name: 'FileVault encryption', pass: true }, { name: 'SIP enabled', pass: true }, { name: 'Gatekeeper enabled', pass: true }],
    apps: [{ name: 'Microsoft 365', version: '16.84', managed: true }, { name: 'Slack', version: '4.39', managed: true }] },
  { id: 'd10', name: 'MAC-Sandeep-4102', user: 'sandeep.m@terralogic.com', os: 'macOS 14.5', osVersion: '14.5', osBuild: '23F79', status: 'COMPLIANT', enrollment: 'DEP', lastSeen: '3 min',
    cpu: 'Apple M3', cpuCores: 8, ram: '16 GB', storage: '512 GB (380 GB free)', serial: 'C02GX8812', model: 'MacBook Air 15-inch',
    ipAddress: '10.42.6.98', macAddress: '88:66:5A:1C:4E:11', ssid: 'TerraLogic-Corp-5G', localUsers: ['sandeep.m'],
    security: { passcodeEnabled: true, diskEncryptionEnabled: true, firewallEnabled: true, antivirusActive: true, developerModeEnabled: false },
    dlpAgent: { vendor: 'Jamf Protect DLP', status: 'Running' },
    mdmState: { mdmProfileInstalled: true, enrollmentProfileId: 'ENR-DEP-MAC-01', enrolledAt: '2026-05-02 10:30', lastCheckInAt: '2026-07-21 11:59', agentVersion: '1.4.0' },
    checks: [{ name: 'FileVault encryption', pass: true }, { name: 'SIP enabled', pass: true }, { name: 'Gatekeeper enabled', pass: true }],
    apps: [{ name: 'Microsoft 365', version: '16.84', managed: true }] },
  { id: 'd11', name: 'LT-uma-3865', user: 'uma@terralogic.com', os: 'macOS 13.7', osVersion: '13.7', osBuild: '22H420', status: 'NON-COMPLIANT', enrollment: 'Manual', lastSeen: '32 min',
    cpu: 'Apple M1', cpuCores: 8, ram: '8 GB', storage: '256 GB (30 GB free)', serial: 'C02DX5522', model: 'MacBook Pro 13-inch',
    ipAddress: '10.42.7.14', macAddress: 'F4:0F:24:8B:99:76', ssid: 'TerraLogic-Corp-5G', localUsers: ['uma'],
    security: { passcodeEnabled: true, diskEncryptionEnabled: false, firewallEnabled: true, antivirusActive: true, developerModeEnabled: false },
    dlpAgent: { vendor: 'Jamf Protect DLP', status: 'Stopped' },
    mdmState: { mdmProfileInstalled: true, enrollmentProfileId: 'ENR-DEP-MAC-01', enrolledAt: '2025-08-20 14:00', lastCheckInAt: '2026-07-21 11:30', agentVersion: '1.3.7' },
    checks: [{ name: 'FileVault encryption', pass: false }, { name: 'SIP enabled', pass: true }, { name: 'Gatekeeper enabled', pass: true }],
    apps: [{ name: 'Microsoft 365', version: '16.70', managed: true }] },
]

// Full compliance check lists exactly as defined in MDM PRD §7.1, split by platform.
const WINDOWS_CHECKS = [
  'OS version minimum', 'Passcode/PIN required', 'BitLocker Encryption', 'Screen Lock Configured',
  'Required apps installed', 'Blocked apps not installed', 'Last check-in', 'Windows Firewall',
  'Antivirus Active', 'Developer Mode Disabled',
]
const MACOS_CHECKS = [
  'OS version minimum', 'Passcode/PIN required', 'FileVault Encryption', 'Screen Lock Configured',
  'Jailbroken / rooted', 'Required apps installed', 'Blocked apps not installed', 'Last check-in',
  'Firewall enabled', 'SIP enabled', 'Gatekeeper enabled', 'Developer Mode Disabled',
]
export const NOT_IN_PRD_CHECKS = ['Antivirus Up-to-date', 'Secure Boot Enabled']

export function getComplianceChecks(device) {
  const isWindows = device.os.startsWith('Windows')
  const platformList = isWindows ? WINDOWS_CHECKS : MACOS_CHECKS
  const existing = {}
  device.checks.forEach((c) => { existing[c.name] = c.pass })
  const aliasMap = {
    'BitLocker encryption': 'BitLocker Encryption',
    'FileVault encryption': 'FileVault Encryption',
    'OS version minimum': 'OS version minimum',
    'Antivirus active': 'Antivirus Active',
    'Developer mode disabled': 'Developer Mode Disabled',
  }
  const resolved = {}
  Object.entries(existing).forEach(([k, v]) => { resolved[aliasMap[k] || k] = v })
  return platformList.map((name) => ({ name, pass: resolved[name] !== undefined ? resolved[name] : true }))
}

export function getLocalDatabases(device) {
  const pool = [
    { name: 'PostgreSQL', version: '15.2', port: 5432, status: 'Running' },
    { name: 'MySQL', version: '8.0.36', port: 3306, status: 'Stopped' },
    { name: 'SQLite (local app data)', version: '3.45.1', port: null, status: 'File-based' },
    { name: 'Microsoft SQL Server Express', version: '15.0', port: 1433, status: 'Running' },
  ]
  const seed = device.id.charCodeAt(1) || 1
  return pool.filter((_, i) => (seed + i) % 3 !== 0)
}

export function getExtensions(device) {
  const base = [
    { name: 'Google Docs Offline', id: 'ghbmnnjooekpmoecnnnilnnbdlolhkhi', version: '1.106.1' },
    { name: 'Edge relevant text changes', id: 'jmjflgjpcpepeafmmgdpfkogkghcpiha', version: '1.2.1' },
  ]
  if (device.status === 'NON-COMPLIANT') {
    base.unshift({ name: 'Unknown extension', id: 'nmmhkkegccagdldgiimedpiccmgmieda', version: '1.0.0.6' })
  }
  return base
}

export function getActivity(device) {
  const entries = []
  for (let i = 0; i < 5; i++) {
    entries.push({ type: 'checkin', message: `Device checked in — compliance: ${device.status.toLowerCase().replace(' ', '_')}`, time: `Jul ${21 - i}, 2026, ${8 - i}:${(25 - i * 3).toString().padStart(2, '0')} PM` })
  }
  entries.push({ type: 'command', message: 'Command collect_inventory → completed', time: 'Jul 18, 2026, 7:35:03 PM' })
  entries.push({ type: 'command', message: 'Command collect_inventory → completed', time: 'Jul 15, 2026, 7:35:03 PM' })
  return entries
}

export function DataField({ label, value, mono }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded p-2.5">
      <div className="text-xs text-gray-400">{label}</div>
      <div className={`text-sm text-gray-800 mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}

export function BoolField({ label, value, invert }) {
  const good = invert ? !value : value
  return (
    <div className="bg-gray-50 border border-gray-100 rounded p-2.5 flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`flex items-center gap-1 text-xs font-medium ${good ? 'text-emerald-600' : 'text-rose-600'}`}>
        {Ico(value ? 'check' : 'x', { size: 11 })} {value ? 'Yes' : 'No'}
      </span>
    </div>
  )
}

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
