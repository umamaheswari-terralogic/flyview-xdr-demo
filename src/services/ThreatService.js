import { fetchJson } from './mockApi.js'

export const ThreatService = {
  async getSummary() {
    const data = await fetchJson('threats')
    return data.summary
  },

  async getIncidents() {
    const data = await fetchJson('threats')
    return data.incidents
  },

  async getIncidentById(id) {
    const data = await fetchJson('threats')
    return data.incidentDetails?.[id] ?? null
  },

  async getEventsWeekly() {
    const data = await fetchJson('threats')
    return { values: data.eventsWeekly, days: data.eventsDays }
  },

  async getVerdictBreakdown() {
    const data = await fetchJson('threats')
    return data.verdictBreakdown
  },

  async getMitreTechniques() {
    const data = await fetchJson('threats')
    return data.mitreTechniques
  },
}
