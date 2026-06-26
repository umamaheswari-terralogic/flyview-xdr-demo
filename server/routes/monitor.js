import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ message: 'Monitor API — not yet implemented' })
})

export default router
