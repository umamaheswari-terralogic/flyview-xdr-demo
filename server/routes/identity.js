import { Router } from 'express'
import { simState } from '../simState.js'

const router = Router()

// ── Scenario 3: Antivirus disabled → Adaptive Auth ─────────────────
// Vyshnavi's device (LT-VyshnaviT-3941) has antivirus disabled.
// When fired, her risk elevates and IAM triggers step-up MFA.

const getVyshnaviUser = () =>
  !simState.antivirusCompliant
    ? {
        name:    'LT-vyshnavi-3941',
        email:   'thatikonda.vyshnavi@terralogic.com',
        dept:    'Engineering',
        risk:    95,
        riskCls: 'cr',
        mfa:     'STEP-UP',
        login:   'Just now',
        status:  'ADAPTIVE AUTH',
        statusCls: 'cr',
        sim:     true,
        simId:   'vyshnavi-device',
        alert: {
          type:   'DEVICE_RISK',
          detail: 'MDM: Antivirus disabled on LT-VyshnaviT-3941 · All sessions require re-authentication · Step-up MFA enforced',
        },
      }
    : {
        name:    'LT-vyshnavi-3941',
        email:   'thatikonda.vyshnavi@terralogic.com',
        dept:    'Engineering',
        risk:    87,
        riskCls: 'cr',
        mfa:     'TOTP',
        login:   '09:14',
        status:  'ACTIVE',
        statusCls: 'ok',
        sim:     true,
        simId:   'vyshnavi-device',
        alert:   null,
      }

const USERS = [
  {
    name: 'Harshavardhan S.',
    email: 'harshavardhan.s@terralogic.com',
    dept: 'Finance',
    risk: 87,
    riskCls: 'cr',
    mfa: 'TOTP',
    login: '09:14',
    status: 'ACTIVE',
    statusCls: 'ok',
  },
  {
    name: 'Venkatesh Babu',
    email: 'venkatesh.b@terralogic.com',
    dept: 'Finance',
    risk: 91,
    riskCls: 'cr',
    mfa: null,
    login: 'Yesterday',
    status: 'OFFBOARDING',
    statusCls: 'hi',
  },
  {
    name: 'Kamakshee M.',
    email: 'kamakshee.m@terralogic.com',
    dept: 'Engineering',
    risk: 72,
    riskCls: 'hi',
    mfa: 'WebAuthn',
    login: '09:02',
    status: 'ACTIVE',
    statusCls: 'ok',
  },
  {
    name: 'Anurag Pandey',
    email: 'anurag.p@terralogic.com',
    dept: 'Sales',
    risk: 44,
    riskCls: 'me',
    mfa: 'Push',
    login: '08:55',
    status: 'ACTIVE',
    statusCls: 'ok',
  },
  {
    name: 'Soujanya Acharya',
    email: 'soujanya.a@terralogic.com',
    dept: 'HR',
    risk: 21,
    riskCls: 'ok',
    mfa: 'WebAuthn',
    login: '08:30',
    status: 'ACTIVE',
    statusCls: 'ok',
  },
]

// ── Sim user 1: Vyshnavi T. ───────────────────────────────────────
// Scenario: Impossible travel + MFA bypass → CRITICAL / UNDER REVIEW
// Trigger: POST /api/identity/vyshnavi.t%40terralogic.com/trigger

let simEscalated = false
const SIM_EMAIL = 'vyshnavi.t@terralogic.com'

const getSimUser = () =>
  simEscalated
    ? {
        name: 'Vyshnavi T.',
        email: SIM_EMAIL,
        dept: 'Engineering',
        risk: 94,
        riskCls: 'cr',
        mfa: 'BYPASSED',
        login: 'Just now',
        status: 'UNDER REVIEW',
        statusCls: 'cr',
        sim: true,
        simId: 'vyshnavi',
        alert: {
          type: 'IMPOSSIBLE_TRAVEL',
          detail: 'Login from Hyderabad (IN) at 09:41, then Singapore (SG) at 09:59 — 18 min apart · MFA challenge skipped',
        },
      }
    : {
        name: 'Vyshnavi T.',
        email: SIM_EMAIL,
        dept: 'Engineering',
        risk: 18,
        riskCls: 'ok',
        mfa: 'WebAuthn',
        login: '09:41',
        status: 'ACTIVE',
        statusCls: 'ok',
        sim: true,
        simId: 'vyshnavi',
        alert: null,
      }

// ── Sim user 2: Santosh ─────────────────────────────────────────
// Scenario: Employee on PIP silently logged into cloud storage and
// started bulk-downloading corporate data — insider threat / data exfil.
// Trigger:   POST /api/identity/shabbeer%40terralogic.com/trigger
// Resolve:   POST /api/identity/shabbeer%40terralogic.com/resolve
//            (called automatically by the Cloud "Revoke IAM" button)

let johnEscalated = false
const JOHN_EMAIL = 'santosh@terralogic.com'

const getJohnUser = () =>
  johnEscalated
    ? {
        name: 'Santosh',
        email: JOHN_EMAIL,
        dept: 'Engineering',
        risk: 76,
        riskCls: 'hi',
        mfa: 'TOTP',
        login: '02:47 AM',
        status: 'MONITORING',
        statusCls: 'hi',
        sim: true,
        simId: 'john',
        alert: {
          type: 'DATA_EXFILTRATION',
          severity: 'hi',
          detail: 'Bulk cloud download at 02:47 AM — 4,200 GetObject calls on corp-data-prod S3 bucket (4.2 GB) · Employee is on PIP · Access outside business hours',
          correlatedModule: 'Cloud',
          correlatedFinding: 'CF-SHABBEER-001',
        },
      }
    : {
        name: 'Santosh',
        email: JOHN_EMAIL,
        dept: 'Engineering',
        risk: 34,
        riskCls: 'me',
        mfa: 'TOTP',
        login: 'Yesterday',
        status: 'ACTIVE',
        statusCls: 'ok',
        sim: true,
        simId: 'john',
        alert: null,
      }

// POST /api/identity/vyshnavi.t@terralogic.com/trigger
router.post(`/${encodeURIComponent(SIM_EMAIL)}/trigger`, (_req, res) => {
  simEscalated = true
  res.json({ triggered: true, user: getSimUser() })
})

// POST /api/identity/vyshnavi.t@terralogic.com/reset
router.post(`/${encodeURIComponent(SIM_EMAIL)}/reset`, (_req, res) => {
  simEscalated = false
  res.json({ reset: true, user: getSimUser() })
})

// POST /api/identity/santosh@terralogic.com/trigger — escalate
router.post(`/${encodeURIComponent(JOHN_EMAIL)}/trigger`, (_req, res) => {
  johnEscalated = true
  res.json({ triggered: true, user: getJohnUser() })
})

// POST /api/identity/santosh@terralogic.com/reset — reset
router.post(`/${encodeURIComponent(JOHN_EMAIL)}/reset`, (_req, res) => {
  johnEscalated = false
  res.json({ reset: true, user: getJohnUser() })
})

// POST /api/identity/santosh@terralogic.com/resolve  — force-resolve (called by Cloud "Revoke IAM")
router.post(`/${encodeURIComponent(JOHN_EMAIL)}/resolve`, (_req, res) => {
  johnEscalated = false
  res.json({ resolved: true, user: getJohnUser() })
})

// Expose john's escalation state so cloud route can read it
export { johnEscalated, getJohnUser }

export function resetIdentitySim() { simEscalated = false; johnEscalated = false }

// GET /api/identity/sim — polled by frontend; returns adaptive auth signal when antivirus disabled
router.get('/sim', (_req, res) => {
  const antivirusNonCompliant = !simState.antivirusCompliant
  res.json({
    antivirusNonCompliant,
    riskSignal: antivirusNonCompliant
      ? {
          user:    'vyshnavi.thatikonda@terralogic.com',
          name:    'Vyshnavi T.',
          device:  'LT-VyshnaviT-3941',
          risk:    88,
          riskCls: 'cr',
          reason:  'Device antivirus disabled — adaptive MFA step-up required',
          action:  'STEP_UP_MFA',
          detail:  'MDM signal: antivirus protection disabled on enrolled Windows 11 device. All sessions from this device require re-authentication.',
        }
      : null,
  })
})

// GET /api/identity — full user list; high-risk sim users float to top
router.get('/', (_req, res) => {
  const shabbeer  = getJohnUser()
  const vyshnavi  = getVyshnaviUser()
  const isDeviceRisk = !simState.antivirusCompliant

  const simVyshnavi = getSimUser()
  const vyshnaviEscalated = simEscalated

  let all
  if (vyshnaviEscalated && johnEscalated) {
    all = [simVyshnavi, shabbeer, vyshnavi, ...USERS]
  } else if (vyshnaviEscalated) {
    all = [simVyshnavi, vyshnavi, ...USERS, shabbeer]
  } else if (isDeviceRisk && johnEscalated) {
    all = [vyshnavi, shabbeer, ...USERS, simVyshnavi]
  } else if (isDeviceRisk) {
    all = [vyshnavi, ...USERS, simVyshnavi, shabbeer]
  } else if (johnEscalated) {
    all = [shabbeer, ...USERS, simVyshnavi, vyshnavi]
  } else {
    all = [...USERS, simVyshnavi, vyshnavi, shabbeer]
  }
  res.json({ total: all.length, users: all })
})

// GET /api/identity/:email — single user by email
router.get('/:email', (req, res) => {
  const em = req.params.email.toLowerCase()
  if (em === SIM_EMAIL.toLowerCase()) return res.json(getSimUser())
  if (em === JOHN_EMAIL.toLowerCase()) return res.json(getJohnUser())
  if (em === 'thatikonda.vyshnavi@terralogic.com') return res.json(getVyshnaviUser())
  const user = USERS.find(u => u.email.toLowerCase() === em)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
})

export default router
