import { useOutletContext } from 'react-router-dom'
import IdentityOverview from './tabs/Overview.jsx'

const TAB_MAP = {
  Overview: IdentityOverview,
}

export default function Identity() {
  const { activeTab } = useOutletContext()
  const Tab = TAB_MAP[activeTab] ?? IdentityOverview
  return <Tab />
}
