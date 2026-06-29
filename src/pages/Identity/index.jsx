import { useOutletContext } from 'react-router-dom'
import IdentityOverview  from './tabs/Overview.jsx'
import Users             from './tabs/Users.jsx'
import GroupsRoles       from './tabs/GroupsRoles.jsx'
import SSOFederation     from './tabs/SSOFederation.jsx'
import PrivilegedAccess  from './tabs/PrivilegedAccess.jsx'
import AccessReviews     from './tabs/AccessReviews.jsx'

const TAB_MAP = {
  'Overview':          IdentityOverview,
  'Users':             Users,
  'Groups & Roles':    GroupsRoles,
  'SSO & Federation':  SSOFederation,
  'Privileged Access': PrivilegedAccess,
  'Access Reviews':    AccessReviews,
}

export default function Identity() {
  const { activeTab } = useOutletContext()
  const Tab = TAB_MAP[activeTab] ?? IdentityOverview
  return <Tab />
}
