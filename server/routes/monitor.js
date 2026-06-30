import { Router } from 'express'

const router = Router()

// ── Baseline alerts (always present) ─────────────────────────────
const BASE_ALERTS = [
  {
    id: 'ALT-001', device: 'LT-VyshnaviT-3941', type: 'Service stopped',
    severity: 'HIGH', sevCls: 'hi', metric: 'nginx stopped 15m',
    rule: 'Service health', time: '5m', status: 'firing', statusCls: 'cr', ackBy: null,
  },
  {
    id: 'ALT-002', device: 'DB-MASTER-01', type: 'Disk pressure',
    severity: 'HIGH', sevCls: 'hi', metric: '87% (+1.2%/hr)',
    rule: 'Disk trend', time: '12m', status: 'firing', statusCls: 'cr', ackBy: null,
  },
  {
    id: 'ALT-003', device: 'CORP-WIN-088', type: 'CPU spike',
    severity: 'MEDIUM', sevCls: 'me', metric: 'CPU 94% for 8m',
    rule: 'CPU threshold', time: '19m', status: 'acknowledged', statusCls: 'hi', ackBy: 'Sarah Chen',
  },
  {
    id: 'ALT-004', device: 'CORP-MAC-055', type: 'Agent offline',
    severity: 'HIGH', sevCls: 'hi', metric: 'No check-in 32m',
    rule: 'Heartbeat', time: '32m', status: 'firing', statusCls: 'cr', ackBy: null,
  },
  {
    id: 'ALT-005', device: 'CORP-LAPTOP-007', type: 'Patch missing',
    severity: 'MEDIUM', sevCls: 'me', metric: 'CVE-2026-1337',
    rule: 'Vuln policy', time: '1h', status: 'firing', statusCls: 'cr', ackBy: null,
  },
]

// ── BEC sim alert — injected on trigger ──────────────────────────
// What FlyView actually sees on the endpoint:
//   PRIMARY trigger: chrome.exe spawned cmd.exe with encoded args (process tree anomaly)
//   SUPPORTING signal: chrome.exe had an active TLS connection to hr-portal-secure[.]ru:443
//                      at the time of spawn (network telemetry correlation)
// What FlyView does NOT know: which site was open in Chrome, which link was clicked,
// whether it was Gmail or any other web app — that requires email gateway integration.
const BEC_ALERT = {
  id: 'ALT-BEC-001',
  device: 'LT-VyshnaviT-3941',
  user: 'vyshnavi.thatikonda@terralogic.com',
  type: 'Suspicious process spawn',
  severity: 'CRITICAL',
  sevCls: 'cr',
  metric: 'chrome.exe → cmd.exe',
  rule: 'Browser spawned shell process',
  time: 'Just now',
  status: 'firing',
  statusCls: 'cr',
  ackBy: null,
  sim: true,
  detail: {
    // PRIMARY detection signal
    primarySignal: {
      label: 'Process spawn (alert trigger)',
      value: 'chrome.exe spawned cmd.exe /c powershell -enc <base64>',
      why: 'A browser spawning a shell is almost never legitimate. This is the rule that fired the alert.',
    },
    // SUPPORTING signal — correlated from OS-level network telemetry (SNI inspection)
    // FlyView sees this via the TLS ClientHello SNI field (plaintext before encryption).
    // This does NOT mean the user deliberately opened this site — Chrome may have
    // landed there via a redirect chain from a phishing link. FlyView only sees that
    // chrome.exe had an open socket to this hostname at the time the child process spawned.
    supportingSignal: {
      label: 'Network connection at time of spawn (SNI telemetry)',
      value: 'chrome.exe socket → hr-portal-secure[.]ru:443 (SNI visible in TLS handshake)',
      why: 'chrome.exe had an active TLS session to this domain at the time the shell process was spawned — correlated via OS-level network telemetry.',
    },
    processChain: 'chrome.exe → cmd.exe → powershell.exe',
    destination: 'hr-portal-secure[.]ru:443',
    technique: 'T1059.001 – PowerShell / T1566.002 – Spearphishing Link (inferred)',
    // What the analyst must do separately — not FlyView's detection
    analystNote: 'Isolate the endpoint immediately. Check Google Workspace or email gateway logs to identify the originating email and sender.',
  },
}

let simTriggered = false

// POST /api/monitor/trigger — trigger BEC phishing event
router.post('/trigger', (_req, res) => {
  simTriggered = true
  res.json({ triggered: true, alert: BEC_ALERT })
})

// POST /api/monitor/reset — reset BEC phishing event
router.post('/reset', (_req, res) => {
  simTriggered = false
  res.json({ reset: true, alert: null })
})

// GET /api/monitor — alerts list (BEC alert prepended when triggered)
router.get('/', (_req, res) => {
  const alerts = simTriggered ? [BEC_ALERT, ...BASE_ALERTS] : BASE_ALERTS
  res.json({ total: alerts.length, alerts, simTriggered })
})

export default router
