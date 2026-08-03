import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import TopBar from '../components/TopBar.jsx'
import TabNavigation from '../components/TabNavigation.jsx'
import { ToastProvider } from '../components/Toast.jsx'
import { useState, useEffect, useRef, useCallback } from 'react'

function useLiveClock() {
  const fmt = () => {
    const now = new Date()
    return now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
      ' · ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
  const [clock, setClock] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setClock(fmt()), 1000)
    return () => clearInterval(id)
  }, [])
  return clock
}
import { API_BASE } from '../config.js'

const API = API_BASE

const MODULE_CONFIG = {
  '/': {
    title: 'Identity — <b>4 high-risk</b> users of 930',
    subtitle: 'IAM · SSO · MFA · PAM · SCIM provisioning',
    tabs: ['Overview', 'Users', 'Groups', 'Roles', 'Applications', 'Identity Mapping'],
  },
  '/threats': {
    title: 'Threats — <b>3 critical</b> incidents open',
    subtitle: 'SIEM · v4.4',
    tabs: ['Overview', 'Incidents', 'Alerts', 'Cases', 'Pipeline', 'Detection Rules', 'UEBA', 'Threat Intel', 'SIEM Posture', 'Threat Hunt', 'Blazey AI'],
  },
  '/devices': {
    title: 'Devices — <b>12 non-compliant</b> of 847 enrolled',
    subtitle: 'MDM · macOS · iOS · Android · Windows',
    tabs: ['Overview', 'All Devices', 'Enrollment', 'Agent Management' /*, 'Profiles', 'Applications', 'Compliance Policies' */],
  },
  '/monitor': {
    title: 'Monitor — <b>5 active alerts</b> · 98.2% uptime',
    subtitle: 'RMM · 847 managed endpoints · InfluxDB telemetry',
    tabs: ['Overview', 'Devices', 'Active Alerts', 'Alert Rules', 'Scripts', 'Remote Access', 'Patches'],
  },
  '/identity': {
    title: 'Identity — <b>4 high-risk</b> users of 930',
    subtitle: 'IAM · SSO · MFA · PAM · SCIM provisioning',
    tabs: ['Overview', 'Users', 'Groups', 'Roles', 'Applications'],
  },
  '/cloud': {
    title: 'Cloud — <b>7 critical</b> misconfigurations',
    subtitle: 'CSPM + CIEM · AWS · GCP · <span style="opacity:.45">Azure</span>',
    tabs: [/* 'Overview', */ 'Findings', 'Cloud Identities', 'Data Repositories', /* 'Audit Log', */ 'Accounts' /*, 'Reports' */],
  },
  '/network': {
    title: 'Network — <b>1 offline</b>, 2 config drift events',
    subtitle: 'NMS · 64 devices · Palo Alto · Cisco · Fortinet',
    tabs: ['Overview', 'Devices', 'Traffic (NetFlow)', 'Config Audit', 'Topology', 'Syslog', 'Alerts'],
  },
  '/privacy': {
    title: 'Privacy — <b>1 overdue DSAR</b> · RoPA 96%',
    subtitle: 'DSPM · GDPR · CCPA · PIPL · DPDP',
    tabs: [/* 'Overview', 'DSARs', 'Data Map', */ 'Data Inventory' /*, 'RoPA', 'Legal Holds' */],
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
    title: 'Settings',
    subtitle: '',
    // Agent Management moved to the Devices module — tabs: ['Agent Management'],
    tabs: [],
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
  const liveClock = useLiveClock()

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
  const resolvedCfg = { ...cfg, subtitle: moduleKey === '/' ? liveClock : cfg.subtitle }
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
