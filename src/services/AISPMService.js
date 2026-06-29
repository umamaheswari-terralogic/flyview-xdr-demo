import { fetchJson } from './mockApi.js'

export const AISPMService = {
  async getSummary()            { const d = await fetchJson('aispm'); return d.summary },
  async getAssets()             { const d = await fetchJson('aispm'); return d.assets },
  async getAssessments()        { const d = await fetchJson('aispm'); return d.assessments },
  async getDetectionEvents()    { const d = await fetchJson('aispm'); return d.detectionEvents },
  async getEuAiActRegistry()    { const d = await fetchJson('aispm'); return d.euAiActRegistry },
  async getGovernancePolicies() { const d = await fetchJson('aispm'); return d.governancePolicies },
  async getNistRmf()            { const d = await fetchJson('aispm'); return d.nistRmf },
  async getResponseActions()    { const d = await fetchJson('aispm'); return d.responseActions },
}
