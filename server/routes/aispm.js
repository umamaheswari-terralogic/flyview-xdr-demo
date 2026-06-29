import { Router } from 'express'

const router = Router()

// ── Sim state ─────────────────────────────────────────────────
let cliLlmActive  = false
let chatgptActive = false

// GET /api/aispm/sim — current sim state (polled by frontend every 3s)
router.get('/sim', (_req, res) => {
  res.json({ cliLlmActive, chatgptActive })
})

// POST /api/aispm/trigger/cli-llm — toggle ollama/LLaMA 3 detection
router.post('/trigger/cli-llm', (_req, res) => {
  cliLlmActive = !cliLlmActive
  res.json({ cliLlmActive, chatgptActive })
})

// POST /api/aispm/trigger/chatgpt — toggle Chrome→ChatGPT session detection
router.post('/trigger/chatgpt', (_req, res) => {
  chatgptActive = !chatgptActive
  res.json({ cliLlmActive, chatgptActive })
})

// GET /api/aispm — stub (data is served from JSON via frontend service)
router.get('/', (_req, res) => {
  res.json({ cliLlmActive, chatgptActive })
})

export default router
