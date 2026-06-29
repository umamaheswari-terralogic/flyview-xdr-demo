import { fetchJson } from './mockApi.js'

export const PrivacyService = {
  async getMetrics()          { const d = await fetchJson('privacy'); return d.metrics },
  async getDsars()            { const d = await fetchJson('privacy'); return d.dsars },
  async getDataMap()          { const d = await fetchJson('privacy'); return d.dataMap },
  async getDataInventory()    { const d = await fetchJson('privacy'); return d.dataInventory },
  async getRopaEntries()      { const d = await fetchJson('privacy'); return d.ropaEntries },
  async getRopaCompleteness() { const d = await fetchJson('privacy'); return d.ropaCompleteness },
  async getLegalHolds()       { const d = await fetchJson('privacy'); return d.legalHolds },
  async getPiiDiscovery()     { const d = await fetchJson('privacy'); return d.piiDiscovery },
  async getJurisdictionSlas() { const d = await fetchJson('privacy'); return d.jurisdictionSlas },
}
