import { useState, useEffect } from 'react'
import StatusBadge from '../../../components/StatusBadge.jsx'
import { PrivacyService } from '../../../services/PrivacyService.js'

const ALL_PII_CATEGORIES = ['Name', 'Email', 'Phone', 'PAN', 'Aadhaar']

// Synthesizes the finding-style detail fields shown in the drawer from the asset row —
// the mock dataset only carries inventory-level fields, not per-finding investigation data.
function buildFindingDetail(asset, index) {
  const findingId = `PF-${String(100000 + index * 45 + asset.name.length * 7).slice(-6)}`
  return {
    findingId,
    severity: asset.risk,
    status: 'OPEN',
    dataStore: asset.host,
    objectPath: `${asset.host}/${asset.type.toLowerCase().replace(/\s+/g, '-')}/object-${index + 1}`,
    inventory: asset.type,
    confidence: asset.confidence,
    contextScore: Math.max(0, asset.confidence - 7),
    piiCategories: asset.piiTypes,
    createdBy: 'scanner@flyview.io',
    updatedBy: 'scanner@flyview.io',
    createdAt: asset.lastScan,
    updatedAt: asset.lastScan,
  }
}

function FindingDetailDrawer({ asset, detail, onClose, onAcknowledge, onRemediate }) {
  if (!asset || !detail) return null
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <StatusBadge status={detail.severity} cls={asset.riskCls} />
              <span className="b ne"><i />{detail.status}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--txt)' }}>{detail.findingId}</div>
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--txt3)', marginTop: 3 }}>{detail.inventory.toUpperCase().replace(/\s+/g, '_')}</div>
          </div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        <div className="drawer-body">
          <div>
            <div className="drawer-section-title">What happened</div>
            <div className="drawer-desc">PII detected in the scanned object.</div>
          </div>

          <div>
            <div className="drawer-section-title">Finding details</div>
            <div className="drawer-meta-grid">
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Finding ID</div>
                <div className="drawer-meta-value">{detail.findingId}</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Data store</div>
                <div className="drawer-meta-value">{detail.dataStore}</div>
              </div>
              <div className="drawer-meta-item" style={{ gridColumn: '1 / -1' }}>
                <div className="drawer-meta-label">Object path</div>
                <div className="drawer-meta-value">{detail.objectPath}</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Inventory</div>
                <div className="drawer-meta-value">{detail.inventory}</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Confidence</div>
                <div className="drawer-meta-value">{detail.confidence}%</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Context score</div>
                <div className="drawer-meta-value">{detail.contextScore}%</div>
              </div>
            </div>
          </div>

          <div>
            <div className="drawer-section-title">PII categories</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ALL_PII_CATEGORIES.map(cat => {
                const present = detail.piiCategories.includes(cat)
                return (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                    <span style={{ color: present ? 'var(--ok)' : 'var(--txt3)' }}>{present ? '✓' : '—'}</span>
                    <span style={{ color: present ? 'var(--txt)' : 'var(--txt3)' }}>{cat}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <div className="drawer-section-title">Detection</div>
            <div className="drawer-meta-grid">
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Stage 1 regex</div>
                <div className="drawer-meta-value">Matched</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Context score</div>
                <div className="drawer-meta-value">{detail.contextScore}%</div>
              </div>
            </div>
          </div>

          <div>
            <div className="drawer-section-title">Status</div>
            <div className="drawer-meta-grid">
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Status</div>
                <div className="drawer-meta-value">{detail.status}</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Acknowledged by</div>
                <div className="drawer-meta-value">{detail.acknowledgedBy ?? '—'}</div>
              </div>
              <div className="drawer-meta-item" style={{ gridColumn: '1 / -1' }}>
                <div className="drawer-meta-label">Remediated at</div>
                <div className="drawer-meta-value">{detail.remediatedAt ?? '—'}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="drawer-section-title">Audit</div>
            <div className="drawer-meta-grid">
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Created by</div>
                <div className="drawer-meta-value">{detail.createdBy}</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Updated by</div>
                <div className="drawer-meta-value">{detail.updatedBy}</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Created at</div>
                <div className="drawer-meta-value">{detail.createdAt}</div>
              </div>
              <div className="drawer-meta-item">
                <div className="drawer-meta-label">Updated at</div>
                <div className="drawer-meta-value">{detail.updatedAt}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="drawer-actions">
          <button className="btn" disabled title="Not available in Phase-1" style={{ opacity: 0.45, cursor: 'not-allowed' }} onClick={() => onAcknowledge(asset)}>Acknowledge</button>
          <button className="btn p" disabled title="Not available in Phase-1" style={{ opacity: 0.45, cursor: 'not-allowed' }} onClick={() => onRemediate(asset)}>Remediate</button>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  )
}

export default function DataInventory() {
  const [assets, setAssets] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => { PrivacyService.getDataInventory().then(setAssets) }, [])

  const filtered = assets.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase())
  )

  const critical = assets.filter(a => a.riskCls === 'cr').length
  const unencrypted = assets.filter(a => !a.encrypted).length

  const selectedIndex = selected ? assets.indexOf(selected) : -1
  const selectedDetail = selected ? buildFindingDetail(selected, selectedIndex) : null

  return (
    <div className="card">
      <div className="card-h">
        <h3>Data Inventory
          <span className="meta" style={{ fontWeight: 400, marginLeft: 8 }}>
            {assets.length} assets ·
            <span style={{ color: 'var(--crit)', marginLeft: 4 }}>{critical} critical risk</span>
            {unencrypted > 0 && <span style={{ color: 'var(--high)', marginLeft: 4 }}>· {unencrypted} unencrypted</span>}
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="srch" placeholder="Search assets…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <table>
        <thead>
          <tr>{['Asset name', 'Type', 'Host / endpoint', 'PII categories', 'Confidence', 'Last scan', ''].map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(a => (
            <tr key={a.name}>
              <td className="pr">{a.name}</td>
              <td><span className="ch">{a.type}</span></td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.host}</td>
              <td>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {a.piiTypes.map(p => <span key={p} className="ch">{p}</span>)}
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="pb" style={{ width: 50 }}>
                    <i style={{ width: `${a.confidence}%`, background: a.confidence >= 90 ? 'var(--crit)' : 'var(--high)' }} />
                  </div>
                  <span className="mono" style={{ fontSize: 11 }}>{a.confidence}%</span>
                </div>
              </td>
              <td className="mono" style={{ fontSize: 11, color: 'var(--txt3)' }}>{a.lastScan}</td>
              <td>
                <div className="brow">
                  <button className="btn" onClick={() => setSelected(a)}>View</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <FindingDetailDrawer
          asset={selected}
          detail={selectedDetail}
          onClose={() => setSelected(null)}
          onAcknowledge={() => setSelected(null)}
          onRemediate={() => setSelected(null)}
        />
      )}
    </div>
  )
}
