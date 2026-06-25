import { fetchJson } from './mockApi.js'

export const MonitorService = {
  async getMetrics() {
    const data = await fetchJson('monitor')
    return data.metrics
  },

  async getAlerts() {
    const data = await fetchJson('monitor')
    return data.alerts
  },

  async getFleetHealth() {
    const data = await fetchJson('monitor')
    return data.fleetHealth
  },

  async getScriptCatalog() {
    const data = await fetchJson('monitor')
    return data.scriptCatalog
  },

  async getPatchGaps() {
    const data = await fetchJson('monitor')
    return data.patchGaps
  },
}
