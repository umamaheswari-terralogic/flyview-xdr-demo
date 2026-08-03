import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import DevicesOverview    from './tabs/Overview.jsx'
import AllDevices         from './tabs/AllDevices.jsx'
import Enrollment         from './tabs/Enrollment.jsx'
import DeviceFullPage     from './tabs/DeviceFullPage.jsx'
import AgentManagement    from './tabs/AgentManagement.jsx'
import { devicesSeed }    from './tabs/_prototypeShared.jsx'
// import Profiles           from './tabs/Profiles.jsx'
// import Applications       from './tabs/Applications.jsx'
// import CompliancePolicies from './tabs/CompliancePolicies.jsx'

const TAB_MAP = {
  'Overview':             DevicesOverview,
  'All Devices':          AllDevices,
  'Enrollment':           Enrollment,
  'Agent Management':     AgentManagement,
  // 'Profiles':             Profiles,
  // 'Applications':         Applications,
  // 'Compliance Policies':  CompliancePolicies,
}

export default function Devices() {
  const { activeTab } = useOutletContext()
  const [viewingId, setViewingId] = useState(null)
  const viewingDevice = devicesSeed.find(d => d.id === viewingId)

  if (viewingDevice) {
    return (
      <DeviceFullPage
        device={viewingDevice}
        devices={devicesSeed}
        onSelectDevice={setViewingId}
        onBack={() => setViewingId(null)}
      />
    )
  }

  const Tab = TAB_MAP[activeTab] ?? DevicesOverview
  return <Tab onView={setViewingId} />
}
