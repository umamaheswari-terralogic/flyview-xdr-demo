import StatusBadge from './StatusBadge.jsx'

function initials(email) {
  return email.split('@')[0].split('.').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function displayName(email) {
  return email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const CHECK_DETAILS = {
  'Antivirus disabled': {
    sevCls: 'cr',
    severity: 'CRITICAL',
    description: 'Real-time antivirus protection has been disabled on this device. The endpoint is exposed to malware, ransomware, and other threats without active scanning or detection.',
    recommendation: 'Re-enable Windows Defender or the enrolled antivirus via MDM profile push. If the user disabled it manually, trigger the "Quarantine endpoint" remediation script from the Monitor page.',
    mitre: ['T1562.001 — Impair Defenses: Disable Security Tools'],
  },
  'Blocked app installed': {
    sevCls: 'cr',
    severity: 'CRITICAL',
    description: 'MDM policy has detected a blocked application installed on this device. The application category violates the endpoint security policy. AI-SPM will identify the specific tool and assess data exposure risk.',
    recommendation: 'Remove the blocked application via MDM remote action. Review the AI-SPM module to identify the specific AI tool and any data already shared with it.',
    mitre: ['T1204.002 — User Execution: Malicious File', 'T1567 — Exfiltration Over Web Service'],
  },
}

const GENERIC_CHECK = {
  sevCls: 'hi',
  severity: 'HIGH',
  description: 'This device is failing one or more compliance checks defined in the enrolled policy.',
  recommendation: 'Review the device policy and push a remediation profile via MDM.',
  mitre: [],
}

export default function DeviceDrawer({ device, onClose }) {
  if (!device) return null

  const isNonCompliant = device.statusCls === 'cr'
  const failingChecks = device.failingChecks ?? []

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">

        {/* Header */}
        <div className="drawer-head">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <StatusBadge status={device.status} cls={device.statusCls} />
              <span style={{ fontSize: 11, color: 'var(--txt3)', fontFamily: 'JetBrains Mono, monospace' }}>{device.platform}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--txt)' }}>{device.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--txt3)', marginTop: 3 }}>{device.user}</div>
          </div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className="drawer-body">

          {isNonCompliant && failingChecks.length > 0 ? (
            failingChecks.map(check => {
              const d = CHECK_DETAILS[check] ?? GENERIC_CHECK
              return (
                <div key={check}>
                  <div className="drawer-section-title">Failing check</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span className={`b ${d.sevCls}`}><i />{d.severity}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)' }}>{check}</span>
                  </div>
                  <div className="drawer-desc">{d.description}</div>

                  <div className="drawer-section-title" style={{ marginTop: 16 }}>Detection details</div>
                  <div className="drawer-meta-grid">
                    <div className="drawer-meta-item">
                      <div className="drawer-meta-label">Enrollment</div>
                      <div className="drawer-meta-value">{device.enrollment}</div>
                    </div>
                    <div className="drawer-meta-item">
                      <div className="drawer-meta-label">Last seen</div>
                      <div className="drawer-meta-value">{device.lastSeen}</div>
                    </div>
                    <div className="drawer-meta-item">
                      <div className="drawer-meta-label">Detected</div>
                      <div className="drawer-meta-value" style={{ color: 'var(--crit)' }}>Just now</div>
                    </div>
                    <div className="drawer-meta-item">
                      <div className="drawer-meta-label">Policy</div>
                      <div className="drawer-meta-value">CIS Endpoint Baseline v2</div>
                    </div>
                  </div>

                  <div className="drawer-section-title" style={{ marginTop: 16 }}>Recommended remediation</div>
                  <div className="drawer-desc">{d.recommendation}</div>

                  {d.mitre.length > 0 && (
                    <>
                      <div className="drawer-section-title" style={{ marginTop: 16 }}>MITRE ATT&CK</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {d.mitre.map(m => <span key={m} className="drawer-mitre-tag">{m}</span>)}
                      </div>
                    </>
                  )}
                </div>
              )
            })
          ) : isNonCompliant ? (
            <div>
              <div className="drawer-section-title">Compliance violation</div>
              <div className="drawer-desc">This device is non-compliant with the enrolled MDM policy. Check the Monitor page for active alerts on this endpoint.</div>
              <div className="drawer-meta-grid" style={{ marginTop: 12 }}>
                <div className="drawer-meta-item">
                  <div className="drawer-meta-label">Enrollment</div>
                  <div className="drawer-meta-value">{device.enrollment}</div>
                </div>
                <div className="drawer-meta-item">
                  <div className="drawer-meta-label">Last seen</div>
                  <div className="drawer-meta-value">{device.lastSeen}</div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="drawer-section-title">Compliance status</div>
              <div className="drawer-desc" style={{ color: 'var(--ok)' }}>All compliance checks passing. No issues detected on this device.</div>
              <div className="drawer-meta-grid" style={{ marginTop: 12 }}>
                <div className="drawer-meta-item">
                  <div className="drawer-meta-label">Enrollment</div>
                  <div className="drawer-meta-value">{device.enrollment}</div>
                </div>
                <div className="drawer-meta-item">
                  <div className="drawer-meta-label">Last seen</div>
                  <div className="drawer-meta-value">{device.lastSeen}</div>
                </div>
              </div>
            </div>
          )}

          {/* Device owner */}
          <div>
            <div className="drawer-section-title">Device owner</div>
            <div className="drawer-owner-card">
              <div className="drawer-owner-avatar">{initials(device.user)}</div>
              <div style={{ flex: 1 }}>
                <div className="drawer-owner-name">{displayName(device.user)}</div>
                <div className="drawer-owner-meta">{device.user}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="drawer-actions">
          {isNonCompliant && <button className="btn d">Lock device</button>}
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  )
}
