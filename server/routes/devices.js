import { Router } from 'express'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { simState } from '../simState.js'

const router = Router()
const __dirname = dirname(fileURLToPath(import.meta.url))

function getBaseDevices() {
  const raw  = readFileSync(join(__dirname, '../../src/mock-data/devices.json'), 'utf8')
  const data = JSON.parse(raw)
  return data.inventory.devices.filter(d => !d.sim)
}

// ── Scenario 1: Antivirus disabled — LT-VyshnaviT-3941 ─────────────
let antivirusCompliant = true

const getAntivirusDevice = () => ({
  id:            'sim-antivirus',
  name:          'LT-VyshnaviT-3941',
  user:          'vyshnavi.thatikonda@terralogic.com',
  platform:      '⊞ Windows 11',
  status:        antivirusCompliant ? 'COMPLIANT' : 'NON-COMPLIANT',
  statusCls:     antivirusCompliant ? 'ok' : 'cr',
  enrollment:    'MSI',
  lastSeen:      'Just now',
  sim:           true,
  simScenario:   'antivirus',
  failingChecks: antivirusCompliant ? [] : ['Antivirus disabled'],
  extensions:    [],
})

// POST /api/devices/LT-VyshnaviT-3941/trigger — Scenario 1 trigger
router.post('/LT-VyshnaviT-3941/trigger', (_req, res) => {
  antivirusCompliant = false
  simState.antivirusCompliant = false
  res.json({ triggered: true, scenario: 'antivirus', device: getAntivirusDevice() })
})


// POST /api/devices/LT-VyshnaviT-3941/reset — Scenario 1 reset
router.post('/LT-VyshnaviT-3941/reset', (_req, res) => {
  antivirusCompliant = true
  simState.antivirusCompliant = true
  res.json({ reset: true, scenario: 'antivirus', device: getAntivirusDevice() })
})

let blockedAppCompliant = true

const getBlockedAppDevice = () => ({
  id:            'sim-blockedapp',
  name:          'LT-VyshnaviT-3941',
  user:          'vyshnavi.thatikonda@terralogic.com',
  platform:      '⊞ Windows 11',
  status:        blockedAppCompliant ? 'COMPLIANT' : 'NON-COMPLIANT',
  statusCls:     blockedAppCompliant ? 'ok' : 'cr',
  enrollment:    'MSI',
  lastSeen:      'Just now',
  sim:           true,
  simScenario:   'blockedapp',
  failingChecks: blockedAppCompliant ? [] : ['Unauthorised AI tool installed'],
  extensions:    blockedAppCompliant ? [] : [
    'ChatGPT for Chrome',
    'Grammarly',
    'LastPass',
    'Dark Reader',
    'uBlock Origin',
  ],
})

// POST /api/devices/LT-VyshnaviT-3941/trigger/blockedapp — Scenario 2 trigger
router.post('/LT-VyshnaviT-3941/trigger/blockedapp', (_req, res) => {
  blockedAppCompliant = false
  simState.deviceCompliant  = false
  simState.deviceExtensions = [
    'ChatGPT for Chrome',
    'Grammarly',
    'LastPass',
    'Dark Reader',
    'uBlock Origin',
  ]
  res.json({ triggered: true, scenario: 'blockedapp', device: getBlockedAppDevice() })
})

// POST /api/devices/LT-VyshnaviT-3941/reset/blockedapp — Scenario 2 reset
router.post('/LT-VyshnaviT-3941/reset/blockedapp', (_req, res) => {
  blockedAppCompliant = true
  simState.deviceCompliant  = true
  simState.deviceExtensions = []
  res.json({ reset: true, scenario: 'blockedapp', device: getBlockedAppDevice() })
})

// ── GET routes ──────────────────────────────────────────────────────

// Baseline record shown when both scenarios are compliant (single row, no confusion)
const getBaselineSimDevice = () => ({
  id:            'sim-baseline',
  name:          'LT-VyshnaviT-3941',
  user:          'vyshnavi.thatikonda@terralogic.com',
  platform:      '⊞ Windows 11',
  status:        'COMPLIANT',
  statusCls:     'ok',
  enrollment:    'MSI',
  lastSeen:      'Just now',
  sim:           true,
  simScenario:   'baseline',
  failingChecks: [],
  extensions:    [],
})

router.get('/', (_req, res) => {
  const bothCompliant = antivirusCompliant && blockedAppCompliant

  let simDevices
  if (bothCompliant) {
    // Single compliant row — no active incident
    simDevices = [getBaselineSimDevice()]
  } else {
    // Show only the triggered (non-compliant) scenarios
    const active = []
    if (!antivirusCompliant) active.push(getAntivirusDevice())
    if (!blockedAppCompliant) active.push(getBlockedAppDevice())
    simDevices = active
  }

  const all = [...simDevices, ...getBaseDevices()]
  res.json({ total: all.length, devices: all })
})

// GET /api/devices/:name
router.get('/:name', (req, res) => {
  const n = req.params.name.toLowerCase()
  if (n === 'lt-vyshnavit-3941')  return res.json(getAntivirusDevice())
  const device = getBaseDevices().find(d => d.name.toLowerCase() === n)
  if (!device) return res.status(404).json({ error: 'Device not found' })
  res.json(device)
})

export default router
