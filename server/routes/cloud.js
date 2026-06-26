import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ message: 'Cloud API — not yet implemented' })
})

export default router
