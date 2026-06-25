import { fetchJson } from './mockApi.js'

export const NetworkService = {
  async getMetrics() {
    const data = await fetchJson('network')
    return data.metrics
  },

  async getDevices() {
    const data = await fetchJson('network')
    return data.devices
  },

  async getFlowAnomalies() {
    const data = await fetchJson('network')
    return data.flowAnomalies
  },

  async getConfigChanges() {
    const data = await fetchJson('network')
    return data.configChanges
  },

  async getVendorCoverage() {
    const data = await fetchJson('network')
    return data.vendorCoverage
  },
}
