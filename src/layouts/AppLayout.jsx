import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import TopBar from '../components/TopBar.jsx'
import TabNavigation from '../components/TabNavigation.jsx'
import { ToastProvider } from '../components/Toast.jsx'
import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '../config.js'

const API = API_BASE

const MODULE_CONFIG = {
  '/': {
    title: 'Good morning. <b>5 things</b> need your attention',
    subtitle: 'Friday 29 May 2026 · last sync 14s ago · 1,284 assets across 8 surfaces',
    tabs: [],
  },
  '/threats': {
    title: 'Threats — <b>3 critical</b> incidents open',
    subtitle: 'SIEM · v4.4 · 847 endpoints · 148,302 events today',
    tabs: ['Overview', 'Incidents', 'Events', 'Posture', 'Human Risk', 'Intelligence', 'Rules'],
  },
  '/devices': {
    title: 'Devices — <b>12 non-compliant</b> of 847 enrolled',
    subtitle: 'MDM · macOS · iOS · Android · Windows',
    tabs: ['Overview', 'All Devices', 'Enrollment', 'Profiles', 'Applications', 'Compliance Policies'],
  },
  '/monitor': {
    title: 'Monitor — <b>5 active alerts</b> · 98.2% uptime',
    subtitle: 'RMM · 847 managed endpoints · InfluxDB telemetry',
    tabs: ['Overview', 'Devices', 'Active Alerts', 'Alert Rules', 'Scripts', 'Remote Access', 'Patches'],
  },
  '/identity': {
    title: 'Identity — <b>4 high-risk</b> users of 930',
    subtitle: 'IAM · SSO · MFA · PAM · SCIM provisioning',
    tabs: ['Overview', 'Users', 'Groups & Roles', 'SSO & Federation', 'Privileged Access', 'Access Reviews'],
  },
  '/cloud': {
    title: 'Cloud — <b>7 critical</b> misconfigurations',
    subtitle: 'CSPM + CIEM · AWS · GCP · Azure',
    tabs: ['Overview', 'Findings', 'Cloud Identities', 'Audit Log', 'Accounts', 'Reports'],
  },
  '/network': {
    title: 'Network — <b>1 offline</b>, 2 config drift events',
    subtitle: 'NMS · 64 devices · Palo Alto · Cisco · Fortinet',
    tabs: ['Overview', 'Devices', 'Traffic (NetFlow)', 'Config Audit', 'Syslog'],
  },
  '/privacy': {
    title: 'Privacy — <b>1 overdue DSAR</b> · RoPA 96%',
    subtitle: 'DSPM · GDPR · CCPA · PIPL · DPDP',
    tabs: ['Overview', 'DSARs', 'Data Map', 'Data Inventory', 'RoPA', 'Legal Holds'],
  },
  '/aispm': {
    title: 'AI-SPM — <b>3 shadow AI</b> detected · 10 assets',
    subtitle: 'AI Security Posture · EU AI Act · NIST AI RMF',
    tabs: ['Discover', 'Assess', 'Detect', 'Govern', 'Respond'],
  },
  '/clients': {
    title: 'MSSP — <b>12 clients</b> under management',
    subtitle: 'Multi-tenant · Cross-client threat intelligence',
    tabs: ['All Clients', 'War Room', 'Reports'],
  },
  '/reports': {
    title: 'Reports — compliance, incidents, posture',
    subtitle: 'SOC 2 · ISO 27001 · NIST CSF · Executive summary',
    tabs: ['Incident Reports', 'Compliance', 'Posture', 'Executive Summary'],
  },
  '/settings': {
    title: 'Settings — connectors, agents, team',
    subtitle: 'System configuration · Integrations · Agent management',
    tabs: ['Connectors', 'Agents', 'Notifications', 'Integrations', 'Team'],
  },
}

function getModuleKey(pathname) {
  if (pathname === '/') return '/'
  const match = Object.keys(MODULE_CONFIG).find(
    k => k !== '/' && pathname.startsWith(k)
  )
  return match ?? '/'
}

export default function AppLayout() {
  const location = useLocation()
  const moduleKey = getModuleKey(location.pathname)
  const cfg = MODULE_CONFIG[moduleKey] ?? MODULE_CONFIG['/']
  const [activeTab, setActiveTab] = useState(cfg.tabs[0] ?? '')
  const [simIncidentCount, setSimIncidentCount] = useState(0)

  // Poll threats sim so header count and tab badge stay live
  useEffect(() => {
    const poll = () =>
      fetch(`${API}/api/threats/sim`)
        .then(r => r.json())
        .then(({ incidents: sim = [] }) => setSimIncidentCount(sim.length))
        .catch(() => {})
    poll()
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [])

  // Override threats title when sim incidents are active
  const resolvedCfg = { ...cfg }
  if (moduleKey === '/threats') {
    const total = 3 + simIncidentCount
    resolvedCfg.title = `Threats — <b>${total} critical</b> incidents open`
  }

  useEffect(() => {
    setActiveTab(cfg.tabs[0] ?? '')
  }, [moduleKey])

  const hasTabs = cfg.tabs.length > 0
  const isDetailPage = location.pathname.split('/').length > 2

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <TopBar title={resolvedCfg.title} subtitle={resolvedCfg.subtitle} />
        {hasTabs && !isDetailPage && (
          <TabNavigation
            tabs={resolvedCfg.tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            badgeOverrides={moduleKey === '/threats' ? { Incidents: 3 + simIncidentCount } : {}}
          />
        )}
        <div className="content">
          <Outlet context={{ activeTab, setActiveTab, moduleConfig: cfg }} />
        </div>
      </div>
      <ToastProvider />
    </div>
  )
}
