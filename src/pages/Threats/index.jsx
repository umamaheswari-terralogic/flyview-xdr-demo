import { useOutletContext } from 'react-router-dom'
import ThreatsOverview from './tabs/Overview.jsx'
import IncidentsTab from './tabs/Incidents.jsx'
import EventsTab from './tabs/Events.jsx'
import PostureTab from './tabs/Posture.jsx'
import HumanRiskTab from './tabs/HumanRisk.jsx'
import IntelligenceTab from './tabs/Intelligence.jsx'
import RulesTab from './tabs/Rules.jsx'

const TAB_MAP = {
  Overview: ThreatsOverview,
  Incidents: IncidentsTab,
  Events: EventsTab,
  Posture: PostureTab,
  'Human Risk': HumanRiskTab,
  Intelligence: IntelligenceTab,
  Rules: RulesTab,
}

export default function Threats() {
  const { activeTab } = useOutletContext()
  const Tab = TAB_MAP[activeTab] ?? ThreatsOverview
  return <Tab />
}
