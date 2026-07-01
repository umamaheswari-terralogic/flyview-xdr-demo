import { Router } from 'express'
import { simState } from '../simState.js'
import { resetMonitorSim } from './monitor.js'
import { resetIdentitySim } from './identity.js'

const router = Router()

// POST /api/sim/reset-all — resets every simulation scenario to baseline
router.post('/reset-all', (_req, res) => {
  // Shared state (devices / antivirus / AI-SPM scenarios)
  simState.antivirusCompliant = true
  simState.deviceCompliant    = true
  simState.deviceExtensions   = []

  // Module-local state
  resetMonitorSim()
  resetIdentitySim()

  res.json({ reset: true, timestamp: new Date().toISOString() })
})

export default router
