import { Router } from 'express'

const router = Router()

const USERS = [
  {
    name: 'John Doe',
    email: 'john.d@terralogic.com',
    dept: 'Finance',
    risk: 87,
    riskCls: 'cr',
    mfa: 'TOTP',
    login: '09:14',
    status: 'ACTIVE',
    statusCls: 'ok',
  },
  {
    name: 'Robert Chen',
    email: 'r.chen@terralogic.com',
    dept: 'Finance',
    risk: 91,
    riskCls: 'cr',
    mfa: null,
    login: 'Yesterday',
    status: 'OFFBOARDING',
    statusCls: 'hi',
  },
  {
    name: 'Sarah Kim',
    email: 'sarah.k@terralogic.com',
    dept: 'Engineering',
    risk: 72,
    riskCls: 'hi',
    mfa: 'WebAuthn',
    login: '09:02',
    status: 'ACTIVE',
    statusCls: 'ok',
  },
  {
    name: 'Mike Ross',
    email: 'mike.r@terralogic.com',
    dept: 'Sales',
    risk: 44,
    riskCls: 'me',
    mfa: 'Push',
    login: '08:55',
    status: 'ACTIVE',
    statusCls: 'ok',
  },
  {
    name: 'Emma Clark',
    email: 'emma.c@terralogic.com',
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

// ── Sim user 2: Shabbeer ─────────────────────────────────────────
// Scenario: Employee on PIP silently logged into cloud storage and
// started bulk-downloading corporate data — insider threat / data exfil.
// Trigger:   POST /api/identity/shabbeer%40terralogic.com/trigger
// Resolve:   POST /api/identity/shabbeer%40terralogic.com/resolve
//            (called automatically by the Cloud "Revoke IAM" button)

let johnEscalated = false
const JOHN_EMAIL = 'shabbeer@terralogic.com'

const getJohnUser = () =>
  johnEscalated
    ? {
        name: 'Shabbeer',
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
        name: 'Shabbeer',
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
  simEscalated = !simEscalated
  res.json({ triggered: true, user: getSimUser() })
})

// POST /api/identity/shabbeer@terralogic.com/trigger  — escalate (toggle)
router.post(`/${encodeURIComponent(JOHN_EMAIL)}/trigger`, (_req, res) => {
  johnEscalated = !johnEscalated
  res.json({ triggered: true, user: getJohnUser() })
})

// POST /api/identity/shabbeer@terralogic.com/resolve  — force-resolve (called by Cloud "Revoke IAM")
router.post(`/${encodeURIComponent(JOHN_EMAIL)}/resolve`, (_req, res) => {
  johnEscalated = false
  res.json({ resolved: true, user: getJohnUser() })
})

// Expose john's escalation state so cloud route can read it
export { johnEscalated, getJohnUser }

// GET /api/identity — full user list; escalated Shabbeer floats to top
router.get('/', (_req, res) => {
  const shabbeer = getJohnUser()
  const all = johnEscalated
    ? [shabbeer, ...USERS, getSimUser()]
    : [...USERS, getSimUser(), shabbeer]
  res.json({ total: all.length, users: all })
})

// GET /api/identity/:email — single user by email
router.get('/:email', (req, res) => {
  const em = req.params.email.toLowerCase()
  if (em === SIM_EMAIL.toLowerCase()) return res.json(getSimUser())
  if (em === JOHN_EMAIL.toLowerCase()) return res.json(getJohnUser())
  const user = USERS.find(u => u.email.toLowerCase() === em)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
})

export default router
