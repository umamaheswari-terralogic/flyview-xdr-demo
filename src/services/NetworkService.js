import { fetchJson } from './mockApi.js'

export const NetworkService = {
  async getMetrics()       { const d = await fetchJson('network'); return d.metrics },
  async getDevices()       { const d = await fetchJson('network'); return d.devices },
  async getFlowAnomalies() { const d = await fetchJson('network'); return d.flowAnomalies },
  async getTopTalkers()    { const d = await fetchJson('network'); return d.topTalkers },
  async getConfigChanges() { const d = await fetchJson('network'); return d.configChanges },
  async getSyslogs()       { const d = await fetchJson('network'); return d.syslogs },
  async getVendorCoverage(){ const d = await fetchJson('network'); return d.vendorCoverage },
}
