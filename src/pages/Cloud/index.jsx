import { useOutletContext } from 'react-router-dom'
import CloudOverview from './tabs/Overview.jsx'

const TAB_MAP = {
  Overview: CloudOverview,
}

export default function Cloud() {
  const { activeTab } = useOutletContext()
  const Tab = TAB_MAP[activeTab] ?? CloudOverview
  return <Tab />
}
