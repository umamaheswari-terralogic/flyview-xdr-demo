import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ message: 'Privacy API — not yet implemented' })
})

export default router
