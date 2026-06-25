import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout.jsx'
import Overview from '../pages/Overview/index.jsx'
import Threats from '../pages/Threats/index.jsx'
import ThreatDetail from '../pages/Threats/ThreatDetail.jsx'
import Devices from '../pages/Devices/index.jsx'
import Monitor from '../pages/Monitor/index.jsx'
import Identity from '../pages/Identity/index.jsx'
import Cloud from '../pages/Cloud/index.jsx'
import Network from '../pages/Network/index.jsx'
import Privacy from '../pages/Privacy/index.jsx'
import AISPM from '../pages/AISPM/index.jsx'
import Reports from '../pages/Reports/index.jsx'
import Settings from '../pages/Settings/index.jsx'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Overview /> },
      { path: '/threats', element: <Threats /> },
      { path: '/threats/:id', element: <ThreatDetail /> },
      { path: '/devices', element: <Devices /> },
      { path: '/monitor', element: <Monitor /> },
      { path: '/identity', element: <Identity /> },
      { path: '/cloud', element: <Cloud /> },
      { path: '/network', element: <Network /> },
      { path: '/privacy', element: <Privacy /> },
      { path: '/aispm', element: <AISPM /> },
      { path: '/clients', element: <Reports /> },
      { path: '/reports', element: <Reports /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
])
