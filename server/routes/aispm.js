import { Router } from 'express'

const router = Router()

// ── Sim state — same pattern as devices ───────────────────────
let chatgptDetected = false

const getSimEvent = () => chatgptDetected ? {
  id:       'SHADOW-001',
  domain:   'chatgpt.com',
  device:   'LT-VyshnaviT-3941',
  user:     'vyshnavi.thatikonda@terralogic.com',
  source:   'Chrome · Browser',
  detail:   'User opened chatgpt.com — unauthorized shadow AI tool, no DLP policy applied',
  risk:     'HIGH',
  riskCls:  'hi',
  time:     'Just now',
  status:   'OPEN',
  statusCls:'cr',
} : null

// GET /api/aispm/sim — polled by frontend every 3s
router.get('/sim', (_req, res) => {
  res.json({ chatgptDetected, event: getSimEvent() })
})

// POST /api/aispm/trigger/chatgpt — toggle detection on/off
router.post('/trigger/chatgpt', (_req, res) => {
  chatgptDetected = !chatgptDetected
  res.json({ chatgptDetected, event: getSimEvent() })
})

router.get('/', (_req, res) => res.json({ chatgptDetected }))

export default router
