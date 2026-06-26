import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ message: 'Network API — not yet implemented' })
})

export default router
