import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import http from 'http'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

import threatsRouter  from './routes/threats.js'
import devicesRouter  from './routes/devices.js'
import identityRouter from './routes/identity.js'
import cloudRouter    from './routes/cloud.js'
import monitorRouter  from './routes/monitor.js'
import networkRouter  from './routes/network.js'
import privacyRouter  from './routes/privacy.js'
import aispmRouter    from './routes/aispm.js'
import simRouter      from './routes/sim.js'

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
app.use('/api/sim',      simRouter)

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

// ── Phishing-demo server on port 4000 ────────────────────────────
const PHISH_PORT = 4000
const phishFile  = join(__dirname, 'phishing_demo.html')
http.createServer((_req, res) => {
  fs.readFile(phishFile, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(data)
  })
}).listen(PHISH_PORT, '0.0.0.0', () => {
  console.log(`Phishing demo running on http://0.0.0.0:${PHISH_PORT}`)
})

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
