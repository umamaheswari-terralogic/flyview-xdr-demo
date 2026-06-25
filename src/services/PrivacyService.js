import { fetchJson } from './mockApi.js'

export const PrivacyService = {
  async getMetrics() {
    const data = await fetchJson('privacy')
    return data.metrics
  },

  async getDsars() {
    const data = await fetchJson('privacy')
    return data.dsars
  },

  async getPiiDiscovery() {
    const data = await fetchJson('privacy')
    return data.piiDiscovery
  },

  async getJurisdictionSlas() {
    const data = await fetchJson('privacy')
    return data.jurisdictionSlas
  },

  async getRopaCompleteness() {
    const data = await fetchJson('privacy')
    return data.ropaCompleteness
  },
}
