import { fetchJson } from './mockApi.js'

export const AISPMService = {
  async getSummary() {
    const data = await fetchJson('aispm')
    return data.summary
  },

  async getAssets() {
    const data = await fetchJson('aispm')
    return data.assets
  },

  async getDetectionEvents() {
    const data = await fetchJson('aispm')
    return data.detectionEvents
  },

  async getEuAiActRegistry() {
    const data = await fetchJson('aispm')
    return data.euAiActRegistry
  },

  async getNistRmf() {
    const data = await fetchJson('aispm')
    return data.nistRmf
  },
}
