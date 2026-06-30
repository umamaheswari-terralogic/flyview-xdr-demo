import { Router } from 'express'
import { simState } from '../simState.js'

const router = Router()

const AI_EXTENSIONS = ['ChatGPT', 'Claude', 'Perplexity', 'Gemini', 'Copilot', 'Bard']

function getAiExts() {
  return simState.deviceExtensions.filter(e =>
    AI_EXTENSIONS.some(ai => e.toLowerCase().includes(ai.toLowerCase()))
  )
}

// GET /api/threats/sim — polled by frontend every 3s
router.get('/sim', (_req, res) => {
  const incidents = []

  // Scenario 1: Antivirus disabled → malware exposure incident
  if (!simState.antivirusCompliant) {
    incidents.push({
      id:            'INC-SIM-002',
      severity:      'CRITICAL',
      severityClass: 'cr',
      title:         'Antivirus protection disabled on managed endpoint',
      detail:        'MDM: Antivirus disabled · Device is exposed to malware and ransomware · LT-VyshnaviT-3941',
      source:        ['Devices', 'Monitor'],
      time:          'Just now',
      status:        'OPEN',
      statusClass:   'cr',
      actions:       ['Investigate', 'Remediate'],
      sim:           true,
      scenario:      'antivirus',
    })
  }

  // Scenario 2: Blocked app (AI tool) → unauthorized AI incident
  if (!simState.deviceCompliant) {
    const aiExts = getAiExts()
    incidents.push({
      id:            'INC-SIM-001',
      severity:      'CRITICAL',
      severityClass: 'cr',
      title:         'Unauthorized AI tool on non-compliant endpoint',
      detail:        `MDM: Blocked app installed · AI-SPM: ${aiExts[0] ?? 'AI extension'} detected · Device: LT-VyshnaviT-3941`,
      source:        ['Devices', 'AI-SPM'],
      time:          'Just now',
      status:        'OPEN',
      statusClass:   'cr',
      actions:       ['Investigate', 'View'],
      sim:           true,
      scenario:      'blockedapp',
    })
  }

  res.json({
    antivirusNonCompliant: !simState.antivirusCompliant,
    deviceNonCompliant:    !simState.deviceCompliant,
    incidents,
  })
})

router.get('/', (_req, res) => res.json({ message: 'Threats API' }))

export default router
