import { useOutletContext } from 'react-router-dom'
import ThreatsOverview from './tabs/Overview.jsx'
import IncidentsTab from './tabs/Incidents.jsx'
import AlertsTab from './tabs/Alerts.jsx'
import CasesTab from './tabs/Cases.jsx'
import PipelineTab from './tabs/Pipeline.jsx'
import DetectionRulesTab from './tabs/DetectionRules.jsx'
import UEBATab from './tabs/UEBA.jsx'
import ThreatIntelTab from './tabs/ThreatIntel.jsx'
import SiemPostureTab from './tabs/SiemPosture.jsx'
import ThreatHuntTab from './tabs/ThreatHunt.jsx'
import BlazeAITab from './tabs/BlazeAI.jsx'

const TAB_MAP = {
  'Overview':         ThreatsOverview,
  'Incidents':        IncidentsTab,
  'Alerts':           AlertsTab,
  'Cases':            CasesTab,
  'Pipeline':         PipelineTab,
  'Detection Rules':  DetectionRulesTab,
  'UEBA':             UEBATab,
  'Threat Intel':     ThreatIntelTab,
  'SIEM Posture':     SiemPostureTab,
  'Threat Hunt':      ThreatHuntTab,
  'Blazey AI':        BlazeAITab,
}

export default function Threats() {
  const { activeTab } = useOutletContext()
  const Tab = TAB_MAP[activeTab] ?? ThreatsOverview
  return <Tab />
}
