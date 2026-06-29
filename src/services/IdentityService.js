import { fetchJson } from './mockApi.js'

export const IdentityService = {
  async getSummary()          { const d = await fetchJson('identity'); return d.summary },
  async getUsers()            { const d = await fetchJson('identity'); return d.users },
  async getRiskDistribution() { const d = await fetchJson('identity'); return d.riskDistribution },
  async getPamSessions()      { const d = await fetchJson('identity'); return d.pamSessions },
  async getPamRequests()      { const d = await fetchJson('identity'); return d.pamRequests },
  async getSsoFederation()    { const d = await fetchJson('identity'); return d.ssoFederation },
  async getSsoProviders()     { const d = await fetchJson('identity'); return d.ssoProviders },
  async getScimConfig()       { const d = await fetchJson('identity'); return d.scimConfig },
  async getGroups()           { const d = await fetchJson('identity'); return d.groups },
  async getAccessReviews()    { const d = await fetchJson('identity'); return d.accessReviews },
}
