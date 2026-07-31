import { useState } from 'react'
import {
  Ico, DataField, BoolField, NOT_IN_PRD_CHECKS,
  getComplianceChecks, getLocalDatabases, getExtensions, getActivity,
} from './_prototypeShared.jsx'

// Ported from DeviceFullPage in src/assets/flyview-windows-prototype_15.html
export default function DeviceFullPage({ device, devices, onSelectDevice, onBack }) {
  const [tab, setTab] = useState('Overview')
  const complianceChecks = getComplianceChecks(device)
  const isWindows = device.os.startsWith('Windows')
  const tabsDef = [
    { name: 'Overview' }, { name: 'Compliance', count: complianceChecks.filter((c) => !c.pass).length },
    { name: 'Hardware' }, { name: 'Apps', count: device.apps.length },
    { name: 'Extensions', count: getExtensions(device).length },
    { name: 'Local Accounts', count: device.localUsers.length },
    { name: 'Databases', count: getLocalDatabases(device).length },
    { name: 'Activity' },
  ]
  const activity = getActivity(device)
  const extensions = getExtensions(device)

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-64 border-r border-gray-100 bg-white flex-shrink-0 overflow-y-auto">
        <div className="px-4 py-4 border-b border-gray-100">
          <button onClick={onBack} className="text-xs text-gray-400 hover:text-gray-600 mb-2 block">← All devices</button>
          <div className="text-[10px] tracking-wider text-gray-400 font-medium">DEVICE FLEET</div>
        </div>
        <div className="p-2">
          {devices.map((d) => (
            <button
              key={d.id}
              onClick={() => onSelectDevice(d.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 ${d.id === device.id ? 'bg-orange-50 border border-orange-100' : 'hover:bg-gray-50 border border-transparent'}`}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">{Ico('laptop', { size: 13, className: 'text-gray-400' })} {d.name}</div>
              <div className="text-xs text-gray-400 mt-0.5 pl-5">{d.os} · {d.lastSeen}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">{Ico('laptop', { size: 16, className: 'text-gray-400' })}<span className="font-medium text-gray-900 text-lg">{device.name}</span></div>
          <div className="text-xs text-gray-400 mt-0.5">{device.serial} · {device.os} · User: {device.user} · Enrolled: {device.mdmState.enrolledAt.split(' ')[0]} · Last seen: {device.lastSeen}</div>
        </div>

        <div className="flex gap-5 px-6 border-b border-gray-100 flex-shrink-0 overflow-x-auto">
          {tabsDef.map((t) => (
            <button key={t.name} onClick={() => setTab(t.name)} className={`py-3 text-sm whitespace-nowrap border-b-2 flex items-center gap-1 ${tab === t.name ? 'border-orange-500 text-orange-600 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.name}{t.count != null && <span className={tab === t.name ? 'text-orange-400' : 'text-gray-400'}>({t.count})</span>}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'Overview' && (
            <div className="space-y-6">
              <div>
                <div className="text-[10px] tracking-wider text-gray-400 font-medium mb-2">OPERATING SYSTEM</div>
                <div className="grid grid-cols-3 gap-3">
                  <DataField label="OS" value={device.os} />
                  <DataField label="Version" value={device.osVersion} />
                  <DataField label="Build" value={device.osBuild} mono />
                  <DataField label="Last boot" value={device.mdmState.lastCheckInAt} />
                  <DataField label="User" value={device.user} />
                  <DataField label="Device ID" value={device.mdmState.enrollmentProfileId} mono />
                </div>
              </div>
              <div>
                <div className="text-[10px] tracking-wider text-gray-400 font-medium mb-2">NETWORK</div>
                <div className="grid grid-cols-3 gap-3">
                  <DataField label="IP" value={device.ipAddress} mono />
                  <DataField label="MAC" value={device.macAddress} mono />
                  <DataField label="Wi-Fi" value={device.ssid} />
                </div>
              </div>
              <div>
                <div className="text-[10px] tracking-wider text-gray-400 font-medium mb-2">SECURITY</div>
                <div className="grid grid-cols-3 gap-3">
                  <BoolField label={isWindows ? 'BitLocker' : 'FileVault'} value={device.security.diskEncryptionEnabled} />
                  <BoolField label="Firewall" value={device.security.firewallEnabled} />
                  {isWindows && <BoolField label="Antivirus" value={device.security.antivirusActive} />}
                  <BoolField label="Dev mode" value={device.security.developerModeEnabled} invert />
                </div>
              </div>
              <div>
                <div className="text-[10px] tracking-wider text-gray-400 font-medium mb-2">ENDPOINT EVIDENCE (COMPLIANCE)</div>
                <div className="grid grid-cols-3 gap-3">
                  <BoolField label={isWindows ? 'Disk encryption (BitLocker)' : 'Disk encryption (FileVault)'} value={device.security.diskEncryptionEnabled} />
                  <DataField label="DLP vendor" value={device.dlpAgent.vendor || 'None detected'} />
                  <div className="bg-gray-50 border border-gray-100 rounded p-2.5">
                    <div className="text-xs text-gray-400">DLP service status</div>
                    <div className={`text-sm mt-0.5 font-medium ${device.dlpAgent.status === 'Running' ? 'text-emerald-600' : device.dlpAgent.status === 'Stopped' ? 'text-rose-600' : 'text-gray-400'}`}>
                      {device.dlpAgent.status || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-2">This is the "endpoint posture evidence" use case — disk encryption is an existing MDM compliance check; DLP status is detected via Windows Service Control Manager and is a new gap-fill capability, not part of MDM's own compliance checks.</div>
              </div>
            </div>
          )}

          {tab === 'Compliance' && (
            <div className="space-y-2">
              <div className="text-xs text-gray-400 mb-2">{isWindows ? 'Windows' : 'macOS'} compliance checks — per MDM PRD §7.1</div>
              {complianceChecks.map((c, i) => (
                <div key={i} className={`px-4 py-3 rounded-lg border ${c.pass ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                  <span className={`flex items-center gap-2 text-sm font-medium ${c.pass ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {Ico(c.pass ? 'check' : 'x', { size: 14 })} {c.name}
                  </span>
                </div>
              ))}
              {complianceChecks.some((c) => !c.pass) && (
                <div className="px-4 py-3 rounded-lg bg-amber-50 border border-amber-100 text-sm text-amber-700 flex items-center gap-2">
                  {Ico('alert', { size: 14 })} {complianceChecks.filter((c) => !c.pass).length} failure{complianceChecks.filter((c) => !c.pass).length > 1 ? 's' : ''} — IAM access may be restricted after grace period.
                </div>
              )}
              <div className="px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-500 mt-4">
                <strong>Not shown</strong> — "{NOT_IN_PRD_CHECKS.join('", "')}" aren't in the MDM PRD's compliance model (§7.1 or the security-state schema); they're not tracked by this build.
              </div>
            </div>
          )}

          {tab === 'Hardware' && (
            <div className="space-y-6">
              <div>
                <div className="text-[10px] tracking-wider text-gray-400 font-medium mb-2">PROCESSOR</div>
                <div className="grid grid-cols-2 gap-3">
                  <DataField label="CPU" value={device.cpu} />
                  <DataField label="Cores" value={device.cpuCores} />
                </div>
              </div>
              <div>
                <div className="text-[10px] tracking-wider text-gray-400 font-medium mb-2">MEMORY & STORAGE</div>
                <div className="grid grid-cols-2 gap-3">
                  <DataField label="RAM" value={device.ram} />
                  <DataField label="Storage" value={device.storage} />
                </div>
              </div>
              <div>
                <div className="text-[10px] tracking-wider text-gray-400 font-medium mb-2">DEVICE</div>
                <div className="grid grid-cols-2 gap-3">
                  <DataField label="Model" value={device.model} />
                  <DataField label="Serial" value={device.serial} mono />
                </div>
              </div>
            </div>
          )}

          {tab === 'Apps' && (
            <div className="space-y-2">
              {device.apps.map((a, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded bg-gray-50 border border-gray-100">
                  <span className="flex items-center gap-2 text-sm text-gray-700">{Ico('package', { size: 13, className: 'text-gray-400' })} {a.name} <span className="text-gray-400 text-xs">v{a.version}</span></span>
                  <span className={`text-xs font-medium ${a.managed ? 'text-orange-500' : 'text-gray-400'}`}>{a.managed ? 'Managed' : 'Personal'}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'Extensions' && (
            <div className="space-y-2">
              {extensions.map((e, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded bg-gray-50 border border-gray-100">
                  <div>
                    <div className="text-sm text-gray-800">{e.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{e.id}</div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{e.version}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'Local Accounts' && (
            <div className="space-y-2">
              <div className="text-xs text-gray-400 mb-2">Local machine accounts reported by the agent.</div>
              {device.localUsers.map((u, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded bg-gray-50 border border-gray-100">
                  {Ico('user', { size: 13, className: 'text-gray-400' })}
                  <span className="text-sm text-gray-800 font-mono">{u}</span>
                  {u === 'Administrator' && <span className="text-xs text-amber-600 ml-auto font-medium">Admin</span>}
                </div>
              ))}
            </div>
          )}

          {tab === 'Databases' && (
            <div className="space-y-2">
              <div className="text-xs text-gray-400 mb-2">Local database software detected on this device (repository inventory - on-device only, not cloud/SaaS).</div>
              {getLocalDatabases(device).length === 0 ? (
                <div className="text-sm text-gray-400 italic">No local database software detected.</div>
              ) : (
                getLocalDatabases(device).map((db, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded bg-gray-50 border border-gray-100">
                    <div>
                      <div className="text-sm text-gray-800">{db.name}</div>
                      <div className="text-xs text-gray-400 font-mono">v{db.version}{db.port ? ` · port ${db.port}` : ''}</div>
                    </div>
                    <span className={`text-xs font-medium ${db.status === 'Running' ? 'text-emerald-600' : db.status === 'Stopped' ? 'text-gray-400' : 'text-gray-500'}`}>{db.status}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'Activity' && (
            <div className="space-y-3">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5">{Ico(a.type === 'command' ? 'terminal' : 'activity', { size: 13, className: 'text-gray-400' })}</div>
                  <div>
                    <div className="text-sm text-gray-700">{a.message}</div>
                    <div className="text-xs text-gray-400">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
