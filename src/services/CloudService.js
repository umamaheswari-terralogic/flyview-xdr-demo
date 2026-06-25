import { fetchJson } from './mockApi.js'

export const CloudService = {
  async getSummary() {
    const data = await fetchJson('cloud')
    return data.summary
  },

  async getFindings() {
    const data = await fetchJson('cloud')
    return data.findings
  },

  async getCompliancePosture() {
    const data = await fetchJson('cloud')
    return data.compliancePosture
  },

  async getCiemRisks() {
    const data = await fetchJson('cloud')
    return data.ciemRisks
  },

  async getLinkedAccounts() {
    const data = await fetchJson('cloud')
    return data.linkedAccounts
  },
}
