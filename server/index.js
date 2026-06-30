import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

import threatsRouter  from './routes/threats.js'
import devicesRouter  from './routes/devices.js'
import identityRouter from './routes/identity.js'
import cloudRouter    from './routes/cloud.js'
import monitorRouter  from './routes/monitor.js'
import networkRouter  from './routes/network.js'
import privacyRouter  from './routes/privacy.js'
import aispmRouter    from './routes/aispm.js'

const app  = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/threats',  threatsRouter)
app.use('/api/devices',  devicesRouter)
app.use('/api/identity', identityRouter)
app.use('/api/cloud',    cloudRouter)
app.use('/api/monitor',  monitorRouter)
app.use('/api/network',  networkRouter)
app.use('/api/privacy',  privacyRouter)
app.use('/api/aispm',    aispmRouter)

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Serve built frontend in production ────────────────────────────
const distDir = join(__dirname, '../dist')
if (existsSync(distDir)) {
  app.use(express.static(distDir))
  // SPA fallback — all non-API routes serve index.html
  app.get('*', (_req, res) => res.sendFile(join(distDir, 'index.html')))
} else {
  app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))
}

app.listen(PORT, () => {
  console.log(`FlyView API server running on http://localhost:${PORT}`)
  console.log('  Endpoints:')
  console.log('    GET /api/threats')
  console.log('    GET /api/devices')
  console.log('    GET /api/devices/:name')
  console.log('    GET /api/identity')
  console.log('    GET /api/cloud')
  console.log('    GET /api/monitor')
  console.log('    POST /api/monitor/trigger')
  console.log('    GET /api/network')
  console.log('    GET /api/privacy')
  console.log('    GET /api/aispm')
  console.log('    GET /health')
})
