import { fetchJson } from './mockApi.js'

export const IdentityService = {
  async getSummary() {
    const data = await fetchJson('identity')
    return data.summary
  },

  async getUsers() {
    const data = await fetchJson('identity')
    return data.users
  },

  async getRiskDistribution() {
    const data = await fetchJson('identity')
    return data.riskDistribution
  },

  async getPamSessions() {
    const data = await fetchJson('identity')
    return data.pamSessions
  },

  async getSsoFederation() {
    const data = await fetchJson('identity')
    return data.ssoFederation
  },
}
