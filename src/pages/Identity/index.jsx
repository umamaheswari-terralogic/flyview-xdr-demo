import { useOutletContext } from "react-router-dom";
import IdentityOverview from "./tabs/Overview";
import UsersTab from "./tabs/Users";
import GroupsTab from "./tabs/Groups";
import RolesTab from "./tabs/Roles";
import ApplicationTab from "./tabs/Applications";
import OwnerMappingTab from "./tabs/OwnerMapping";

const TAB_MAP = {
  Overview: IdentityOverview,
  Users: UsersTab,
  Groups: GroupsTab,
  Roles: RolesTab,
  Applications: ApplicationTab,
  "Identity Mapping": OwnerMappingTab
}

export default function Identity() {
  const {activeTab} = useOutletContext();
  const Tab = TAB_MAP[activeTab] ?? IdentityOverview
  return <Tab/>
}
