import { useState, useEffect } from 'react'
import { CloudService } from '../../../services/CloudService.js'
import { consumePendingProviderFilter } from '../../../services/cloudFilterBridge.js'

const PROVIDERS = ['All', 'GCP', 'AWS']

export default function DataRepositories() {
  const [repos, setRepos]       = useState([])
  const [provider, setProvider] = useState(() => consumePendingProviderFilter() ?? 'All')

  useEffect(() => { CloudService.getDataRepositories().then(setRepos) }, [])

  const filtered = repos.filter(r => provider === 'All' || r.cloudProvider === provider)

  return (
    <div className="card">
      <div className="card-h">
        <h3>Data Repository Inventory
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>{repos.length} repositories</span>
        </h3>
        <div className="seg">
          {PROVIDERS.map(p => <button key={p} className={provider === p ? 'on' : ''} onClick={() => setProvider(p)}>{p}</button>)}
        </div>
      </div>
      <table>
        <thead>
          <tr>{['Name', 'Type', 'Provider', 'Region', 'Resource created'].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.id}>
              <td className="mono pr">{r.name}</td>
              <td><span className="ch">{r.type}</span></td>
              <td><span style={{ fontSize: 11, fontWeight: 700, color: r.providerColor }}>{r.provider}</span></td>
              <td style={{ fontSize: 12, color: 'var(--txt3)' }}>{r.region}</td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{r.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
