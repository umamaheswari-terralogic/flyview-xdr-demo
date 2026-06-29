import { useOutletContext } from 'react-router-dom'
import CloudOverview     from './tabs/Overview.jsx'
import Findings          from './tabs/Findings.jsx'
import CloudIdentities   from './tabs/CloudIdentities.jsx'
import AuditLog          from './tabs/AuditLog.jsx'
import Accounts          from './tabs/Accounts.jsx'
import Reports           from './tabs/Reports.jsx'

const TAB_MAP = {
  'Overview':          CloudOverview,
  'Findings':          Findings,
  'Cloud Identities':  CloudIdentities,
  'Audit Log':         AuditLog,
  'Accounts':          Accounts,
  'Reports':           Reports,
}

export default function Cloud() {
  const { activeTab } = useOutletContext()
  const Tab = TAB_MAP[activeTab] ?? CloudOverview
  return <Tab />
}
