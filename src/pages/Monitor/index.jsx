import { useOutletContext } from 'react-router-dom'
import MonitorOverview from './tabs/Overview.jsx'
import MonitorDevices  from './tabs/Devices.jsx'
import ActiveAlerts    from './tabs/ActiveAlerts.jsx'
import AlertRules      from './tabs/AlertRules.jsx'
import Scripts         from './tabs/Scripts.jsx'
import RemoteAccess    from './tabs/RemoteAccess.jsx'
import Patches         from './tabs/Patches.jsx'

const TAB_MAP = {
  'Overview':      MonitorOverview,
  'Devices':       MonitorDevices,
  'Active Alerts': ActiveAlerts,
  'Alert Rules':   AlertRules,
  'Scripts':       Scripts,
  'Remote Access': RemoteAccess,
  'Patches':       Patches,
}

export default function Monitor() {
  const { activeTab } = useOutletContext()
  const Tab = TAB_MAP[activeTab] ?? MonitorOverview
  return <Tab />
}
