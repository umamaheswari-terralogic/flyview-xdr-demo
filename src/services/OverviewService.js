import { fetchJson } from './mockApi.js'

export const OverviewService = {
  async getSurfaces() {
    const data = await fetchJson('overview')
    return data.surfaces
  },

  async getAttentionItems() {
    const data = await fetchJson('overview')
    return data.attentionItems
  },

  async getBreachProbability() {
    const data = await fetchJson('overview')
    return data.breachProbability
  },

  async getPostureByModule() {
    const data = await fetchJson('overview')
    return data.postureByModule
  },
}
