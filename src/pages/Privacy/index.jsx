import { useOutletContext } from 'react-router-dom'
// import PrivacyOverview from './tabs/Overview.jsx'
// import DSARs          from './tabs/DSARs.jsx'
// import DataMap        from './tabs/DataMap.jsx'
import DataInventory  from './tabs/DataInventory.jsx'
// import RoPA           from './tabs/RoPA.jsx'
// import LegalHolds     from './tabs/LegalHolds.jsx'

const TAB_MAP = {
  // 'Overview':       PrivacyOverview,
  // 'DSARs':          DSARs,
  // 'Data Map':       DataMap,
  'Data Inventory': DataInventory,
  // 'RoPA':           RoPA,
  // 'Legal Holds':    LegalHolds,
}

export default function Privacy() {
  const { activeTab } = useOutletContext()
  const Tab = TAB_MAP[activeTab] ?? DataInventory
  return <Tab />
}
