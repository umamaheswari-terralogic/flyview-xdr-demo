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

// ── Scenario 2: Unauthorised AI tool installed — LT-ShabbeerM-4102 ──
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
  failingChecks: blockedAppCompliant ? [] : ['Unauthorised AI tool installed'],
  extensions:    blockedAppCompliant ? [] : [
    'ChatGPT for Chrome',
    'Grammarly',
    'LastPass',
    'Dark Reader',
    'uBlock Origin',
  ],
})

// POST /api/devices/LT-VyshnaviT-3941/trigger/blockedapp — Scenario 2 toggle
router.post('/LT-VyshnaviT-3941/trigger/blockedapp', (_req, res) => {
  blockedAppCompliant = !blockedAppCompliant
  simState.deviceCompliant  = blockedAppCompliant
  simState.deviceExtensions = blockedAppCompliant ? [] : [
    'ChatGPT for Chrome',
    'Grammarly',
    'LastPass',
    'Dark Reader',
    'uBlock Origin',
  ]
  res.json({ triggered: true, scenario: 'blockedapp', device: getBlockedAppDevice() })
})

// ── GET routes ──────────────────────────────────────────────────────

// Both sim devices always appear at the top; non-compliant ones first
router.get('/', (_req, res) => {
  const av  = getAntivirusDevice()
  const blk = getBlockedAppDevice()

  // Sort sim devices: non-compliant first, then compliant
  const simDevices = [av, blk].sort((a, b) => {
    if (a.statusCls === 'cr' && b.statusCls !== 'cr') return -1
    if (b.statusCls === 'cr' && a.statusCls !== 'cr') return 1
    return 0
  })

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
