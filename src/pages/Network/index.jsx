import { useOutletContext } from 'react-router-dom'
import NetworkOverview  from './tabs/Overview.jsx'
import NetworkDevices   from './tabs/Devices.jsx'
import TrafficNetflow   from './tabs/TrafficNetflow.jsx'
import ConfigAudit      from './tabs/ConfigAudit.jsx'
import Syslog           from './tabs/Syslog.jsx'

const TAB_MAP = {
  'Overview':           NetworkOverview,
  'Devices':            NetworkDevices,
  'Traffic (NetFlow)':  TrafficNetflow,
  'Config Audit':       ConfigAudit,
  'Syslog':             Syslog,
}

export default function Network() {
  const { activeTab } = useOutletContext()
  const Tab = TAB_MAP[activeTab] ?? NetworkOverview
  return <Tab />
}
