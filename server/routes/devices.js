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

// ── Scenario 1: Antivirus disabled ─────────────────────────────────
let antivirusCompliant = true

const getAntivirusDevice = () => ({
  name:          'LT-VyshnaviT-3941',
  user:          'vyshnavi.thatikonda@terralogic.com',
  platform:      '⊞ Windows 11',
  status:        antivirusCompliant ? 'COMPLIANT' : 'NON-COMPLIANT',
  statusCls:     antivirusCompliant ? 'ok' : 'cr',
  enrollment:    'DEP',
  lastSeen:      'Just now',
  sim:           true,
  simScenario:   'antivirus',
  failingChecks: antivirusCompliant ? [] : ['Antivirus disabled'],
  extensions:    [],
})

// POST /api/devices/LT-VyshnaviT-3941/trigger — Scenario 1 toggle
router.post('/LT-VyshnaviT-3941/trigger', (_req, res) => {
  antivirusCompliant = !antivirusCompliant
  simState.antivirusCompliant = antivirusCompliant
  res.json({ triggered: true, scenario: 'antivirus', device: getAntivirusDevice() })
})

// ── Scenario 2: Blocked app installed ──────────────────────────────
let blockedAppCompliant = true

const getBlockedAppDevice = () => ({
  name:          'LT-VyshnaviT-3941',
  user:          'vyshnavi.thatikonda@terralogic.com',
  platform:      '⊞ Windows 11',
  status:        blockedAppCompliant ? 'COMPLIANT' : 'NON-COMPLIANT',
  statusCls:     blockedAppCompliant ? 'ok' : 'cr',
  enrollment:    'DEP',
  lastSeen:      'Just now',
  sim:           true,
  simScenario:   'blockedapp',
  failingChecks: blockedAppCompliant ? [] : ['Blocked app installed'],
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

// Which sim device is currently active? Prefer whichever is non-compliant.
function getActiveSimDevice() {
  if (!antivirusCompliant) return getAntivirusDevice()
  if (!blockedAppCompliant) return getBlockedAppDevice()
  return getAntivirusDevice() // both compliant — return default
}

// GET /api/devices
router.get('/', (_req, res) => {
  const all = [...getBaseDevices(), getActiveSimDevice()]
  res.json({ total: all.length, devices: all })
})

// GET /api/devices/:name
router.get('/:name', (req, res) => {
  if (req.params.name.toLowerCase() === 'lt-vyshnavit-3941') {
    return res.json(getActiveSimDevice())
  }
  const device = getBaseDevices().find(
    d => d.name.toLowerCase() === req.params.name.toLowerCase()
  )
  if (!device) return res.status(404).json({ error: 'Device not found' })
  res.json(device)
})

export default router
