import { useOutletContext } from 'react-router-dom'
import DevicesOverview    from './tabs/Overview.jsx'
import AllDevices         from './tabs/AllDevices.jsx'
import Enrollment         from './tabs/Enrollment.jsx'
// import Profiles           from './tabs/Profiles.jsx'
// import Applications       from './tabs/Applications.jsx'
// import CompliancePolicies from './tabs/CompliancePolicies.jsx'

const TAB_MAP = {
  'Overview':             DevicesOverview,
  'All Devices':          AllDevices,
  'Enrollment':           Enrollment,
  // 'Profiles':             Profiles,
  // 'Applications':         Applications,
  // 'Compliance Policies':  CompliancePolicies,
}

export default function Devices() {
  const { activeTab } = useOutletContext()
  const Tab = TAB_MAP[activeTab] ?? DevicesOverview
  return <Tab />
}
