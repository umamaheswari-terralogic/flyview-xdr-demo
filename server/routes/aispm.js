import { Router } from 'express'
import { simState } from '../simState.js'

const router = Router()

// AI tool keywords — used to filter MDM extension list
const AI_EXTENSIONS = ['ChatGPT', 'Claude', 'Perplexity', 'Gemini', 'Copilot', 'Bard']

// Manual browser session toggle (independent of MDM extension detection)
let chatgptActive = false

function getAiExtensions() {
  return simState.deviceExtensions.filter(ext =>
    AI_EXTENSIONS.some(ai => ext.toLowerCase().includes(ai.toLowerCase()))
  )
}

// GET /api/aispm/sim — polled by frontend every 3s
router.get('/sim', (_req, res) => {
  const aiExts           = getAiExtensions()
  const extensionDetected = aiExts.length > 0

  res.json({
    chatgptDetected:    chatgptActive,       // browser session toggle
    extensionDetected,                        // from MDM extension list
    detectedExtension:  extensionDetected ? aiExts[0] : null,
    deviceNonCompliant: !simState.deviceCompliant,
  })
})

// POST /api/aispm/trigger/chatgpt — manual browser session toggle
router.post('/trigger/chatgpt', (_req, res) => {
  chatgptActive = !chatgptActive
  const aiExts           = getAiExtensions()
  const extensionDetected = aiExts.length > 0
  res.json({
    chatgptDetected: chatgptActive,
    extensionDetected,
    detectedExtension: extensionDetected ? aiExts[0] : null,
    deviceNonCompliant: !simState.deviceCompliant,
  })
})

router.get('/', (_req, res) => res.json({ chatgptDetected: chatgptActive, extensionDetected: getAiExtensions().length > 0 }))

export default router
