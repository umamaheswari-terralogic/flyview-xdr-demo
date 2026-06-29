import { fetchJson } from './mockApi.js'

export const CloudService = {
  async getSummary()           { const d = await fetchJson('cloud'); return d.summary },
  async getFindings()          { const d = await fetchJson('cloud'); return d.findings },
  async getCompliancePosture() { const d = await fetchJson('cloud'); return d.compliancePosture },
  async getCiemRisks()         { const d = await fetchJson('cloud'); return d.ciemRisks },
  async getLinkedAccounts()    { const d = await fetchJson('cloud'); return d.linkedAccounts },
  async getCloudIdentities()   { const d = await fetchJson('cloud'); return d.cloudIdentities },
  async getAuditLog()          { const d = await fetchJson('cloud'); return d.auditLog },
  async getAccounts()          { const d = await fetchJson('cloud'); return d.accounts },
  async getComplianceReports() { const d = await fetchJson('cloud'); return d.complianceReports },
}
