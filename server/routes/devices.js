import { Router } from 'express'

const router = Router()

const DEVICES = [
  {
    name: 'CORP-MAC-101',
    user: 'sarah.k@terralogic.com',
    platform: '🍎 macOS 14.5',
    status: 'COMPLIANT',
    statusCls: 'ok',
    enrollment: 'DEP',
    lastSeen: '2 min',
  },
  {
    name: 'WIN-FIN-04',
    user: 'john.d@terralogic.com',
    platform: '⊞ Windows 11',
    status: 'NON-COMPLIANT',
    statusCls: 'cr',
    enrollment: 'MSI',
    lastSeen: '14 min',
  },
  {
    name: 'CORP-iPAD-22',
    user: 'amy.t@terralogic.com',
    platform: '📱 iPadOS 17.4',
    status: 'COMPLIANT',
    statusCls: 'ok',
    enrollment: 'DEP',
    lastSeen: '1 min',
  },
  {
    name: 'DROID-SALES-07',
    user: 'mike.r@terralogic.com',
    platform: '🤖 Android 14',
    status: 'GRACE PERIOD',
    statusCls: 'hi',
    enrollment: 'Work Profile',
    lastSeen: '8 min',
  },
  {
    name: 'CORP-MAC-055',
    user: 'priya.v@terralogic.com',
    platform: '🍎 macOS 13.7',
    status: 'NON-COMPLIANT',
    statusCls: 'cr',
    enrollment: 'DEP',
    lastSeen: '32 min',
  },
  {
    name: 'CORP-WIN-088',
    user: 'carlos.m@terralogic.com',
    platform: '⊞ Windows 10',
    status: 'NON-COMPLIANT',
    statusCls: 'cr',
    enrollment: 'MSI',
    lastSeen: '1h 4m',
  },
]

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

// GET /api/devices — full device list including sim device
router.get('/', (_req, res) => {
  const all = [...DEVICES, getSimDevice()]
  res.json({ total: all.length, devices: all })
})

// GET /api/devices/:name — single device by name
router.get('/:name', (req, res) => {
  if (req.params.name.toLowerCase() === 'lt-vyshnavit-3941') {
    return res.json(getSimDevice())
  }
  const device = DEVICES.find(
    d => d.name.toLowerCase() === req.params.name.toLowerCase()
  )
  if (!device) return res.status(404).json({ error: 'Device not found' })
  res.json(device)
})

export default router
