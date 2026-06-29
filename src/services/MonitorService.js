import { fetchJson } from './mockApi.js'

export const MonitorService = {
  async getMetrics()         { const d = await fetchJson('monitor'); return d.metrics },
  async getAlerts()          { const d = await fetchJson('monitor'); return d.alerts },
  async getFleetHealth()     { const d = await fetchJson('monitor'); return d.fleetHealth },
  async getScriptCatalog()   { const d = await fetchJson('monitor'); return d.scriptCatalog },
  async getPatchGaps()       { const d = await fetchJson('monitor'); return d.patchGaps },
  async getMonitoredDevices(){ const d = await fetchJson('monitor'); return d.monitoredDevices },
  async getAlertRules()      { const d = await fetchJson('monitor'); return d.alertRules },
  async getScripts()         { const d = await fetchJson('monitor'); return d.scripts },
  async getRemoteSessions()  { const d = await fetchJson('monitor'); return d.remoteSessions },
  async getPatches()         { const d = await fetchJson('monitor'); return d.patches },
}
