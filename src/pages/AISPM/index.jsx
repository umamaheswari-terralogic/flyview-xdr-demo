import { useOutletContext } from 'react-router-dom'
import AISPMDiscover from './tabs/Discover.jsx'

const TAB_MAP = {
  Discover: AISPMDiscover,
}

export default function AISPM() {
  const { activeTab } = useOutletContext()
  const Tab = TAB_MAP[activeTab] ?? AISPMDiscover
  return <Tab />
}
