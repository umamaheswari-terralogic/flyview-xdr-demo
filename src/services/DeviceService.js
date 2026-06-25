import { fetchJson } from './mockApi.js'

export const DeviceService = {
  async getMetrics() {
    const data = await fetchJson('devices')
    return data.metrics
  },

  async getInventory() {
    const data = await fetchJson('devices')
    return data.inventory
  },

  async getPlatformSplit() {
    const data = await fetchJson('devices')
    return data.platformSplit
  },

  async getFailingChecks() {
    const data = await fetchJson('devices')
    return data.failingChecks
  },

  async getApnsCert() {
    const data = await fetchJson('devices')
    return data.apnsCert
  },
}
