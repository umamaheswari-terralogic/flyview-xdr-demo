import { Router } from 'express'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const router = Router()
const __dirname = dirname(fileURLToPath(import.meta.url))

// Read base devices from devices.json on every request — so edits to the JSON
// are reflected immediately without restarting the server
function getBaseDevices() {
  const raw = readFileSync(join(__dirname, '../../src/mock-data/devices.json'), 'utf8')
  const data = JSON.parse(raw)
  return data.inventory.devices.filter(d => !d.sim)
}

// Sim device — status toggled via POST /api/devices/LT-VyshnaviT-3941/trigger
let simCompliant = true

const getSimDevice = () => ({
  name: 'LT-VyshnaviT-3941',
  user: 'vyshnavi.thatikonda@terralogic.com',
  platform: '⊞ Windows 11',
  status: simCompliant ? 'COMPLIANT' : 'NON-COMPLIANT',
  statusCls: simCompliant ? 'ok' : 'cr',
  enrollment: 'DEP',
  lastSeen: 'Just now',
  sim: true,
  failingChecks: simCompliant ? [] : ['Antivirus disabled'],
})

// POST /api/devices/LT-VyshnaviT-3941/trigger — toggle sim device status
router.post('/LT-VyshnaviT-3941/trigger', (_req, res) => {
  simCompliant = !simCompliant
  res.json({ triggered: true, device: getSimDevice() })
})

// GET /api/devices — full device list from JSON + sim device
router.get('/', (_req, res) => {
  const all = [...getBaseDevices(), getSimDevice()]
  res.json({ total: all.length, devices: all })
})

// GET /api/devices/:name — single device by name
router.get('/:name', (req, res) => {
  if (req.params.name.toLowerCase() === 'lt-vyshnavit-3941') {
    return res.json(getSimDevice())
  }
  const device = getBaseDevices().find(
    d => d.name.toLowerCase() === req.params.name.toLowerCase()
  )
  if (!device) return res.status(404).json({ error: 'Device not found' })
  res.json(device)
})

export default router
