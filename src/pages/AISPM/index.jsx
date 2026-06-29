import { useOutletContext } from 'react-router-dom'
import AISPMDiscover from './tabs/Discover.jsx'
import Assess        from './tabs/Assess.jsx'
import Detect        from './tabs/Detect.jsx'
import Govern        from './tabs/Govern.jsx'
import Respond       from './tabs/Respond.jsx'

const TAB_MAP = {
  'Discover': AISPMDiscover,
  'Assess':   Assess,
  'Detect':   Detect,
  'Govern':   Govern,
  'Respond':  Respond,
}

export default function AISPM() {
  const { activeTab } = useOutletContext()
  const Tab = TAB_MAP[activeTab] ?? AISPMDiscover
  return <Tab />
}
