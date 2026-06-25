# FlyView XDR Demo Simulator

A production-grade demo simulator for an AI-powered XDR (Extended Detection and Response) platform. Built with React 19 and realistic mock data — designed for investor, media, prospect, and customer presentations.

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm 9+

### Install & Run

```bash
# 1. Navigate to the project directory
cd flyview-xdr-demo

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open your browser at **http://localhost:5173**

### Other Commands

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Runtime | React 19 |
| Routing | React Router v6 |
| Build Tool | Vite 6 |
| Styling | Plain CSS with CSS custom properties (no Tailwind) |
| State | React `useState` / `useEffect` (no external state library) |
| Data | JSON mock files with simulated API latency |

No authentication. No database. No real integrations. 100% frontend.

---

## Project Structure

```
src/
├── layouts/
│   └── AppLayout.jsx          # Shell: Sidebar + TopBar + TabNavigation + Outlet
│
├── components/                # Reusable UI components
│   ├── Sidebar.jsx            # Left navigation with all module links
│   ├── TopBar.jsx             # Page title, search bar, notifications
│   ├── TabNavigation.jsx      # Sub-tab bar per module
│   ├── SummaryCard.jsx        # Surface overview card (Overview page grid)
│   ├── MetricCard.jsx         # KPI card with colored top border and icon
│   ├── DataTable.jsx          # Reusable table wrapper
│   ├── SeverityBadge.jsx      # CRITICAL / HIGH / MEDIUM / LOW badge
│   ├── StatusBadge.jsx        # OPEN / RESOLVED / ACTIVE / etc. badge
│   ├── WidgetCard.jsx         # Card with header + body slot
│   ├── Timeline.jsx           # Investigation timeline with colored dots
│   ├── PageHeader.jsx         # Topbar title + subtitle slot
│   ├── SearchBar.jsx          # Search input with keyboard shortcut hint
│   └── ActionButtons.jsx      # View / Escalate / Isolate / Patch action buttons
│
├── pages/
│   ├── Overview/              # Dashboard — surface grid + attention items + breach gauge
│   ├── Threats/               # ★ Reference module — fully implemented
│   │   ├── index.jsx          # Tab router — delegates to active tab component
│   │   ├── ThreatDetail.jsx   # /threats/:id — full incident detail page
│   │   └── tabs/
│   │       ├── Overview.jsx   # KPI cards + incidents table + 3 bottom widgets
│   │       ├── Incidents.jsx  # Full incidents table with filter
│   │       ├── Events.jsx     # Event stream with risk scores
│   │       ├── Posture.jsx    # Framework coverage gauges + control failures
│   │       ├── HumanRisk.jsx  # High-risk user watchlist
│   │       ├── Intelligence.jsx  # Threat feeds + matched IoCs
│   │       └── Rules.jsx      # Detection rules with toggle on/off
│   ├── Devices/               # MDM — device inventory, platform split, patch gaps
│   ├── Monitor/               # RMM — active alerts, fleet health, script catalog
│   ├── Identity/              # IAM — user directory, PAM sessions, SSO federation
│   ├── Cloud/                 # CSPM+CIEM — findings table, compliance posture
│   ├── Network/               # NMS — device list, flow anomalies, config drift
│   ├── Privacy/               # DSPM — DSAR queue, PII discovery, RoPA
│   ├── AISPM/                 # AI-SPM — asset inventory, EU AI Act registry
│   ├── Reports/               # Client portfolio + report library
│   └── Settings/              # Connectors, platform toggles, team roster
│
├── services/
│   ├── mockApi.js             # Base fetch with simulated 200–500ms latency
│   ├── ThreatService.js       # All threat data methods (getSummary, getIncidents, etc.)
│   └── OverviewService.js     # Overview data methods
│
├── mock-data/
│   ├── threats.json           # Incidents, summary cards, events, MITRE, incident details
│   └── overview.json         # Surface cards, attention items, breach score, posture
│
├── routes/
│   └── index.jsx              # createBrowserRouter — all route definitions
│
└── shared/
    └── icons.jsx              # All SVG icons as named React elements
```

---

## Navigation Modules

| Route | Module | Status |
|---|---|---|
| `/` | Overview | Full — breach gauge, attention items, posture bars |
| `/threats` | Threats | **Full reference implementation** — all 7 tabs + detail page |
| `/devices` | Devices | Full — inventory table, platform split, APNs cert |
| `/monitor` | Monitor | Full — active alerts, script catalog, patch gaps |
| `/identity` | Identity | Full — user directory, PAM sessions, SSO federation |
| `/cloud` | Cloud | Full — CSPM findings, CIEM risks, linked accounts |
| `/network` | Network | Full — device list, flow anomalies, config audit |
| `/privacy` | Privacy | Full — DSAR queue, PII discovery, RoPA completeness |
| `/aispm` | AI-SPM | Full — asset inventory, EU AI Act registry, NIST RMF |
| `/reports` | Reports | Full — client portfolio + report library |
| `/settings` | Settings | Full — connectors, platform toggles, team |

---

## Threats Module — Reference Implementation

The Threats module at `/threats` is the **blueprint** for all other modules. It demonstrates the full architecture pattern:

```
Threats Page  (/threats)
  └── index.jsx           Reads activeTab from layout context, renders correct tab
      ├── tabs/Overview.jsx     KPI cards + incidents table + bottom widgets
      ├── tabs/Incidents.jsx    Full table with Open/Resolved filter
      ├── tabs/Events.jsx       Event stream with verdicts and risk scores
      ├── tabs/Posture.jsx      Framework coverage + control failure list
      ├── tabs/HumanRisk.jsx    High-risk user watchlist with MFA status
      ├── tabs/Intelligence.jsx Threat feeds health + matched IoCs
      └── tabs/Rules.jsx        Detection rules with live toggle

ThreatDetail  (/threats/:id)
  └── Loads incident by ID from threats.json
      ├── Summary + description
      ├── Risk score progress bar
      ├── Affected assets list
      ├── MITRE ATT&CK IDs
      ├── Investigation timeline (Timeline component)
      └── Recommended actions with action buttons

ThreatService.js
  ├── getSummary()          → KPI card data
  ├── getIncidents()        → Incidents table rows
  ├── getIncidentById(id)   → Full incident detail
  ├── getEventsWeekly()     → Spark bar data
  ├── getVerdictBreakdown() → Verdict distribution bars
  └── getMitreTechniques()  → MITRE technique list

mockApi.js
  └── fetchJson(path)       → Imports JSON, adds 200–500ms simulated delay

threats.json
  └── All data: summary, incidents, incidentDetails, events, verdict, mitre
```

---

## Adding a New Module

Follow the Threats module pattern:

1. **Create the JSON data file**
   ```
   src/mock-data/my-module.json
   ```

2. **Create the service**
   ```js
   // src/services/MyModuleService.js
   import { fetchJson } from './mockApi.js'
   export const MyModuleService = {
     async getData() {
       const data = await fetchJson('my-module')
       return data.items
     }
   }
   ```

3. **Create the page**
   ```
   src/pages/MyModule/index.jsx
   src/pages/MyModule/tabs/Overview.jsx
   ```

4. **Register the route** in `src/routes/index.jsx`

5. **Add the module config** in `src/layouts/AppLayout.jsx` (title, subtitle, tabs array)

6. **Add the nav link** in `src/components/Sidebar.jsx`

---

## Reusable Components Reference

| Component | Props | Use for |
|---|---|---|
| `MetricCard` | `cls, num, desc, label, foot, icon` | KPI summary cards with colored top border |
| `SummaryCard` | `severity, icon, label, value, desc, trend, trendColor, onClick` | Overview surface grid tiles |
| `SeverityBadge` | `severity, cls` | CRITICAL / HIGH / MEDIUM / LOW pill |
| `StatusBadge` | `status, cls` | OPEN / RESOLVED / ACTIVE / OFFBOARDING etc. |
| `WidgetCard` | `title, meta, children, actions` | Any card with header + content slot |
| `DataTable` | `headers, children` | Wraps a `<table>` in a card |
| `ActionButtons` | `actions, onAction` | Row action buttons (View, Escalate, Isolate…) |
| `Timeline` | `items[]` `{time, title, desc, color}` | Investigation timeline with colored dots |
| `TabNavigation` | `tabs, activeTab, onTabChange` | Sub-tab bar (rendered by AppLayout) |
| `SearchBar` | `placeholder` | Top bar search input |
| `PageHeader` | `title, subtitle` | Top bar title block (rendered by AppLayout) |

---

## CSS Design Tokens

All colors are defined as CSS custom properties in `src/index.css`:

```css
--orange / --orangeD / --orangeL   /* Primary brand */
--crit / --critL                   /* Critical severity */
--high / --highL                   /* High severity */
--med  / --medL                    /* Medium severity */
--ok   / --okL                     /* Healthy / resolved */
--info / --infoL                   /* Informational */
--txt / --txt2 / --txt3            /* Text hierarchy */
--border / --border2               /* Borders */
--bg / --white                     /* Backgrounds */
```

Severity class shorthand used throughout: `cr` = critical, `hi` = high, `me` = medium, `ok` = healthy, `in` = info, `or` = orange/warning.
