import { Router } from 'express'

const router = Router()

const SANTOSH_FINDING = {
  id: 'CF-SANTOSH-001',
  provider: 'AWS',
  service: 'S3',
  resource: 'corp-data-prod',
  region: 'ap-south-1',
  severity: 'HIGH',
  sevCls: 'hi',
  status: 'OPEN',
  title: 'Bulk object download by internal user — possible data exfiltration',
  category: 'Data Exfiltration',
  time: '02:47 AM',
  sim: true,
  correlatedUser: 'santosh@terralogic.com',
  correlatedModule: 'Identity',
  detail: {
    description: '4,200 S3 GetObject API calls were made on the corp-data-prod bucket within 12 minutes at 02:47 AM, totalling 4.2 GB transferred. The initiating IAM principal belongs to santosh@terralogic.com. This user is currently on a Performance Improvement Plan (PIP). Access at this hour is outside normal business hours and significantly exceeds baseline download patterns.',
    recommendation: 'Immediately revoke santosh@terralogic.com IAM credentials. Review S3 access logs to identify which objects were downloaded. Coordinate with HR given active PIP status. Consider enabling S3 Object Lock on sensitive buckets.',
    affectedRegion: 'ap-south-1 (Mumbai)',
    firstSeen: '02:47 AM today',
    lastSeen: '02:59 AM today',
    apiCallCount: 4200,
    dataVolume: '4.2 GB',
    owner: {
      name: 'Santosh',
      email: 'santosh@terralogic.com',
      dept: 'Engineering',
      riskScore: 76,
      pipStatus: true,
    },
    mitre: ['T1530 – Data from Cloud Storage', 'T1078 – Valid Accounts'],
  },
}

async function getSantoshActive() {
  try {
    const id = await import('./identity.js')
    return id.johnEscalated
  } catch {
    return false
  }
}

// GET /api/cloud — returns Santosh's finding when his identity trigger is active
router.get('/', async (_req, res) => {
  const active = await getSantoshActive()
  const findings = active ? [SANTOSH_FINDING] : []
  res.json({ findings, simActive: active })
})

// POST /api/cloud/santosh/revoke-iam
// Called by the Cloud UI "Revoke IAM" button — resolves the identity entry too
router.post('/santosh/revoke-iam', async (_req, res) => {
  try {
    const id = await import('./identity.js')
    id.johnEscalated = false   // directly flip the exported binding
  } catch { /* ignore */ }
  res.json({ resolved: true })
})

export default router
