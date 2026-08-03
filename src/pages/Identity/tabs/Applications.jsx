import { useState, useEffect } from "react";
import { IdentityService } from "../../../services/IdentityService.js";
import plugConnectIcon from "../../../assets/plug-connect-svgrepo-com.svg";

const APPS = [
  {
    id: "google-ws",
    name: "Google Workspace",
    vendor: "Google Workspace",
    connector: "google-workspace-scim",
    adminEmail: "svc-flyview-admin@acmecorp.com",
    customerId: "C01abc23d",
    status: "ACTIVE",
    sync: "SCIM · last sync 4m ago",
    lastSync: "4m ago",
    connectedOn: "Jan 14, 2026",
    users: 420,
    groups: 6,
    lastRun: {
      type: "Full reconciliation", startedAgo: "4 minutes ago", duration: "41s",
      result: "SUCCESS", created: 3, updated: 12, deprovisioned: 1, errors: 0,
    },
    history: [
      { at: "Jan 31, 2026 09:12", type: "Full reconciliation", duration: "41s", created: 3, updated: 12, deprovisioned: 1, errors: 0, result: "SUCCESS" },
      { at: "Jan 31, 2026 08:12", type: "Incremental",         duration: "9s",  created: 0, updated: 4,  deprovisioned: 0, errors: 0, result: "SUCCESS" },
      { at: "Jan 31, 2026 07:12", type: "Incremental",         duration: "11s", created: 1, updated: 2,  deprovisioned: 0, errors: 2, result: "PARTIAL" },
      { at: "Jan 31, 2026 06:12", type: "Full reconciliation", duration: "38s", created: 0, updated: 7,  deprovisioned: 2, errors: 0, result: "SUCCESS" },
    ],
  },
];

// FlyView → target directory attribute mapping (same shape for every SCIM connector)
const ATTR_MAP = [
  { source: "email",       target: "primaryEmail",                  transform: "—",              required: true  },
  { source: "displayName", target: "name.fullName",                 transform: "—",              required: true  },
  { source: "firstName",   target: "name.givenName",                transform: "—",              required: true  },
  { source: "lastName",    target: "name.familyName",               transform: "—",              required: true  },
  { source: "department",  target: "organizations[0].department",    transform: "—",              required: false },
  { source: "title",       target: "organizations[0].title",         transform: "—",              required: false },
  { source: "status",      target: "suspended",                      transform: "active → false", required: true  },
  { source: "externalId",  target: "externalId",                     transform: "—",              required: true  },
];

const RUN_RESULT = { SUCCESS: "ok", PARTIAL: "hi", FAILED: "cr" };

const STATUS = {
  ACTIVE:          { cls: "ok", border: "var(--ok)" },
  CONNECTED:       { cls: "ok", border: "var(--ok)" },
  DISABLED:        { cls: "ne", border: "var(--border2)" },
  ERROR:           { cls: "cr", border: "var(--crit)" },
  "PENDING SETUP": { cls: "hi", border: "var(--high)" },
};

// ── Add SCIM connection modal ─────────────────────────────────────
// `idp` is the value sent to the API (lowercase); `label` is what the user picks.
const PROVIDERS = [
  { idp: "okta",   label: "Okta" },
  { idp: "google", label: "Google Workspace" },
  { idp: "entra",  label: "Microsoft Entra ID" },
];

const SESSION_TENANT = "demo"; // auto-filled from session
const SCIM_BASE_URL  = "https://scim.flyview.ai/scim/v2";

// Only the hash is stored server-side, so the plaintext exists just for this dialog.
function generateToken() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(48);
  crypto.getRandomValues(bytes);
  return "scim_inb_" + Array.from(bytes, b => chars[b % chars.length]).join("");
}

// ── Copyable read-only field ──────────────────────────────────────
function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{display: "flex", alignItems: "center", gap: 8, border: "1px solid #e2e8f0", borderRadius: 7, background: "#ffffff", padding: "9px 10px 9px 12px"}}>
        <span className="mono" style={{flex: 1, fontSize: 12, color: "#1e293b", overflowX: "auto", whiteSpace: "nowrap"}}>{value}</span>
        <button onClick={handleCopy} title={copied ? "Copied" : "Copy"} style={{background: "none", border: "none", cursor: "pointer", color: copied ? "var(--ok)" : "#94a3b8", fontSize: 13, padding: 0, lineHeight: 1, flexShrink: 0}}>
          {copied ? "✓" : "⧉"}
        </button>
      </div>
    </div>
  );
}

// ── Wizard step indicator ─────────────────────────────────────────
function StepBadge({ current, total }) {
  return (
    <span style={{fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", color: "#64748b", textTransform: "uppercase", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 999, padding: "3px 9px", whiteSpace: "nowrap", flexShrink: 0}}>
      Step {current} of {total}
    </span>
  );
}

// ── One-time token panel (shown on create and on rotate) ──────────
// `step` is only passed from the add-connection wizard; rotate is a single step.
function TokenPanel({ heading, subtitle, providerLabel, token, onDone, step }) {
  const [ack, setAck] = useState(false);

  return (
    <>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--ok)", fontSize: 15, lineHeight: 1 }}>⊘</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{heading}</span>
          {step && <span style={{ marginLeft: "auto" }}><StepBadge current={step} total={2} /></span>}
        </div>
        <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 5 }}>{subtitle}</div>
      </div>

      {/* One-time token warning */}
      <div style={{display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 8, background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.28)"}}>
        <span style={{ color: "var(--crit)", fontSize: 12.5, lineHeight: 1.5 }}>⚠</span>
        <span style={{ fontSize: 12, color: "var(--crit)", lineHeight: 1.5 }}>
          This is the only time the full token is shown. Only the hash is stored — it cannot be retrieved later.
        </span>
      </div>

      <CopyField label={`SCIM base URL — give this to ${providerLabel}`} value={SCIM_BASE_URL} />
      <CopyField label="Bearer token — copy now" value={token} />

      {/* Acknowledgement */}
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155", cursor: "pointer" }}>
        <input type="checkbox" checked={ack} onChange={e => setAck(e.target.checked)} />
        I’ve copied the token and understand it cannot be shown again
      </label>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
        <button className="btn p" onClick={onDone} disabled={!ack} style={{ opacity: ack ? 1 : 0.45, cursor: ack ? "pointer" : "not-allowed" }}>Done</button>
      </div>
    </>
  );
}

function AddSourceModal({ onClose, onCreate }) {
  const [step,   setStep]   = useState(1); // 1 = form, 2 = connection created
  const [name,   setName]   = useState("");
  const [idp,    setIdp]    = useState("");
  const [tenant, setTenant] = useState(SESSION_TENANT);
  const [token,  setToken]  = useState("");

  const complete = !!name.trim() && !!idp && !!tenant.trim();
  const provider = PROVIDERS.find(p => p.idp === idp);

  function handleCreate() {
    if (!complete) return;
    setToken(generateToken());
    setStep(2);
  }

  // The connection only lands in the list once the token has been acknowledged.
  function handleDone() {
    onCreate({ name: name.trim(), idp, tenant: tenant.trim() });
    onClose();
  }

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 7,
    border: "1px solid #e2e8f0", background: "#ffffff",
    color: "#1e293b", fontSize: 13, outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6, display: "block" };

  return (
    <div style={{position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,.55)", display: "flex", alignItems: "center", justifyContent: "center"}} onClick={e => step === 1 && e.target === e.currentTarget && onClose()}>
      <div style={{width: 460, borderRadius: 14, background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 24px 64px rgba(0,0,0,.22)", padding: "22px 24px 20px", display: "flex", flexDirection: "column", gap: 18, maxHeight: "88vh", overflowY: "auto"}}>

        {step === 1 ? (
          <>
            {/* Header */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>Add SCIM Connection</div>
                <span style={{ marginLeft: "auto" }}><StepBadge current={1} total={2} /></span>
              </div>
              <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 3 }}>
                Creates a new inbound SCIM connection for this tenant
              </div>
            </div>

            {/* Connection name */}
            <div>
              <span style={labelStyle}>Connection name</span>
              <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Okta Production" autoFocus/>
            </div>

            {/* Identity Provider */}
            <div>
              <span style={labelStyle}>Identity Provider</span>
              <select style={{ ...inputStyle, color: idp ? "#1e293b" : "#94a3b8" }} value={idp} onChange={e => setIdp(e.target.value)}>
                <option value="">Select a provider…</option>
                {PROVIDERS.map(p => <option key={p.idp} value={p.idp}>{p.label}</option>)}
              </select>
            </div>

            {/* Tenant */}
            <div>
              <span style={labelStyle}>Tenant</span>
              <input style={inputStyle} value={tenant} onChange={e => setTenant(e.target.value)} placeholder={SESSION_TENANT}/>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 2 }}>
              <button className="btn" onClick={onClose}>Cancel</button>
              <button className="btn p" onClick={handleCreate} disabled={!complete} style={{opacity: complete ? 1 : 0.45, cursor: complete ? "pointer" : "not-allowed"}}>Create Connection</button>
            </div>
          </>
        ) : (
          <TokenPanel heading="Connection created" subtitle={`“${name.trim()}” is ready. Copy the token now — it will not be shown again.`} providerLabel={provider?.label ?? idp} token={token} onDone={handleDone} step={2}/>
        )}

      </div>
    </div>
  );
}

// ── Rotate token modal ────────────────────────────────────────────
function RotateTokenModal({ connection, onClose, onRotated }) {
  const [token] = useState(generateToken);
  const provider = PROVIDERS.find(p => p.idp === connection.idp);

  function handleDone() {
    onRotated(connection.id);
    onClose();
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: 460, borderRadius: 14,
        background: "#ffffff", border: "1px solid #e2e8f0",
        boxShadow: "0 24px 64px rgba(0,0,0,.22)",
        padding: "22px 24px 20px",
        display: "flex", flexDirection: "column", gap: 18,
        maxHeight: "88vh", overflowY: "auto",
      }}>
        <TokenPanel
          heading="Token rotated"
          subtitle={`“${connection.name}” has a new token. The previous token is now invalid.`}
          providerLabel={provider?.label ?? connection.idp}
          token={token}
          onDone={handleDone}
        />
      </div>
    </div>
  );
}

// ── Outbound app integration modal ────────────────────────────────
// Mirrors the read-only "Connection settings" panel, minus the Rotate action:
// on create the secret is entered, not rotated.
const VENDORS = ["Google Workspace", "Microsoft Entra ID", "Okta", "Salesforce", "Slack"];

const APP_STATUSES = [
  { value: "ACTIVE",   label: "Active",   dot: "var(--ok)" },
  { value: "DISABLED", label: "Disabled", dot: null },
  { value: "ERROR",    label: "Error",    dot: null },
];

function SettingsRow({ label, last, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 20, padding: "13px 0",
      borderBottom: last ? "none" : "1px solid #eef2f6",
    }}>
      <span style={{ width: 168, flexShrink: 0, fontSize: 12.5, color: "#334155" }}>{label}</span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function AddAppIntegrationModal({ onClose, onCreate }) {
  const [name,       setName]       = useState("");
  const [vendor,     setVendor]     = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [secret,     setSecret]     = useState("");
  const [status,     setStatus]     = useState("ACTIVE");

  const complete = !!name.trim() && !!vendor && !!adminEmail.trim() && !!secret.trim();

  const inputStyle = {
    width: "100%", padding: "8px 12px", borderRadius: 6,
    border: "1px solid #e2e8f0", background: "#f8fafc",
    color: "#1e293b", fontSize: 12.5, outline: "none",
    boxSizing: "border-box",
  };

  function handleSubmit() {
    if (!complete) return;
    onCreate({
      name: name.trim(),
      vendor,
      adminEmail: adminEmail.trim(),
      customerId: customerId.trim(),
      status,
    });
    onClose();
  }

  return (
    <div
      style={{position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,.55)", display: "flex", alignItems: "center", justifyContent: "center"}}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{width: 600, borderRadius: 14, background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 24px 64px rgba(0,0,0,.22)", padding: "20px 24px 18px", maxHeight: "88vh", overflowY: "auto"}}>

        {/* Header */}
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Connection settings</div>
        <div style={{ fontSize: 12, color: "var(--orangeD, #b45309)", marginTop: 4 }}>
          Domain-wide delegation credentials used to call the Admin SDK Directory API
        </div>

        {/* Fields */}
        <div style={{ marginTop: 16 }}>
          <SettingsRow label="Display name">
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Google Workspace" autoFocus />
          </SettingsRow>

          <SettingsRow label="Vendor">
            <select style={{ ...inputStyle, color: vendor ? "#1e293b" : "#94a3b8" }} value={vendor} onChange={e => setVendor(e.target.value)}>
              <option value="">Select a vendor…</option>
              {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </SettingsRow>

          <SettingsRow label="Admin impersonation email">
            <input style={inputStyle} value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="svc-flyview-admin@acmecorp.com" />
          </SettingsRow>

          <SettingsRow label="Workspace customer ID">
            <input style={inputStyle} value={customerId} onChange={e => setCustomerId(e.target.value)} placeholder="Value" />
          </SettingsRow>

          <SettingsRow label="Service account secret">
            <input type="password" className="mono" style={inputStyle} value={secret} onChange={e => setSecret(e.target.value)} placeholder="Secret Field" />
          </SettingsRow>

          <SettingsRow label="Status" last>
            <div style={{ display: "flex", gap: 8 }}>
              {APP_STATUSES.map(s => {
                const on = status === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => setStatus(s.value)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "5px 14px", borderRadius: 999, cursor: "pointer",
                      fontSize: 12, fontFamily: "inherit",
                      border: `1px solid ${on ? "rgba(16,185,129,.35)" : "#e2e8f0"}`,
                      background: on ? "rgba(16,185,129,.10)" : "#ffffff",
                      color: on ? "var(--ok)" : "#64748b",
                      fontWeight: on ? 600 : 500,
                    }}
                  >
                    {on && <span style={{ fontSize: 9, lineHeight: 1 }}>●</span>}
                    {s.label}
                  </button>
                );
              })}
            </div>
          </SettingsRow>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn p" onClick={handleSubmit} disabled={!complete} style={{ opacity: complete ? 1 : 0.45, cursor: complete ? "pointer" : "not-allowed" }}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Outbound app detail view ──────────────────────────────────────
const DETAIL_TABS = ["Overview"];

function StatCard({ label, children }) {
  return (
    <div className="card" style={{ padding: "14px 18px 16px" }}>
      <div className="sc-lbl">{label}</div>
      {children}
    </div>
  );
}

function DetailRow({ label, children, last }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14, padding: "10px 0",
      borderBottom: last ? "none" : "1px solid var(--border)",
    }}>
      <span style={{ flex: 1, fontSize: 12.5, color: "var(--txt2)" }}>{label}</span>
      <span style={{ fontSize: 12.5, color: "var(--txt)", fontWeight: 600, textAlign: "right", wordBreak: "break-all" }}>{children}</span>
    </div>
  );
}

function AppDetail({ app, onBack }) {
  const [tab, setTab] = useState("Overview");
  const s = STATUS[app.status];
  const run = app.lastRun;
  const history = app.history ?? [];

  const statusNote = {
    ACTIVE:   "Provisioning healthy",
    DISABLED: "Provisioning paused",
    ERROR:    "Provisioning failing",
  }[app.status] ?? "";

  return (
    <div>
      <div className="detail-back" onClick={onBack}>← Back to Applications</div>

      {/* Header */}
      <div className="detail-header">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, flexShrink: 0,
            border: "1px solid var(--border)", background: "var(--white)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, fontWeight: 700, color: "var(--txt2)",
          }}>
            {app.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, color: "var(--txt)" }}>{app.name}</h2>
            <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 4 }}>
              SCIM · OIDC connector &nbsp;·&nbsp; Directory sync &nbsp;·&nbsp; Connected {app.connectedOn ?? "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="kg k3">
        <StatCard label="Status">
          <span className={`b ${s.cls}`} style={{ fontSize: 11, padding: "4px 9px" }}><i />
            {app.status[0] + app.status.slice(1).toLowerCase()}
          </span>
          <div className="sc-desc" style={{ marginTop: 8 }}>{statusNote}</div>
        </StatCard>

        <StatCard label="Users provisioned">
          <div className="sc-val">{app.users}</div>
          <div className="sc-desc">via SCIM</div>
        </StatCard>

        <StatCard label="Last sync">
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--txt)" }}>{app.lastSync ?? "Never"}</div>
          <div className="sc-desc" style={{ color: run ? "var(--ok)" : "var(--txt3)" }}>
            {run ? "Completed successfully" : "No sync has run yet"}
          </div>
        </StatCard>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 24, borderBottom: "1px solid var(--border)", marginBottom: 18 }}>
        {DETAIL_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
              padding: "0 0 9px", marginBottom: -1, fontSize: 13,
              fontWeight: tab === t ? 700 : 500,
              color: tab === t ? "var(--txt)" : "var(--txt3)",
              borderBottom: `2px solid ${tab === t ? "var(--orange)" : "transparent"}`,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="g2">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="card-h">
                <div>
                  <h3>Last sync result</h3>
                  <div className="meta">
                    {run ? `${run.type} · started ${run.startedAgo} · completed in ${run.duration}` : "This integration has not synced yet"}
                  </div>
                </div>
                {run && <span className={`b ${RUN_RESULT[run.result]}`}><i />{run.result[0] + run.result.slice(1).toLowerCase()}</span>}
              </div>
              {run ? (
                <table>
                  <thead><tr>{["Created", "Updated", "Deprovisioned", "Errors"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    <tr style={{ cursor: "default" }}>
                      <td className="mo" style={{ color: run.created ? "var(--ok)" : "var(--txt2)" }}>{run.created ? `+${run.created}` : 0}</td>
                      <td className="mo">{run.updated}</td>
                      <td className="mo">{run.deprovisioned}</td>
                      <td className="mo" style={{ color: run.errors ? "var(--crit)" : "var(--txt2)" }}>{run.errors}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="card-b" style={{ fontSize: 12.5, color: "var(--txt3)" }}>
                  The first reconciliation runs within 15 minutes of connecting.
                </div>
              )}
            </div>

            {/* <div className="card">
              <div className="card-h">
                <div>
                  <h3>{app.vendor ?? app.name} credentials</h3>
                  <div className="meta">Domain-wide delegation credentials used to call the Admin SDK Directory API</div>
                </div>
              </div>
              <div className="card-b" style={{ paddingTop: 4, paddingBottom: 6 }}>
                <DetailRow label="Admin impersonation email">{app.adminEmail ?? "—"}</DetailRow>
                <DetailRow label="Workspace customer ID"><span className="mono">{app.customerId || "—"}</span></DetailRow>
                <DetailRow label="Service account secret" last>
                  <span className="mono" style={{ color: "var(--txt3)", fontWeight: 400 }}>••••••••••••</span>
                </DetailRow>
              </div>
            </div> */}
          </div>

          <div>
            {/* <div className="card">
              <div className="card-h"><h3>Connection</h3></div>
              <div className="card-b" style={{ paddingTop: 4, paddingBottom: 6 }}>
                <DetailRow label="Connector"><span className="mono">{app.connector ?? "—"}</span></DetailRow>
                <DetailRow label="Vendor">{app.vendor ?? "—"}</DetailRow>
                <DetailRow label="Provisioning">SCIM outbound</DetailRow>
                <DetailRow label="Groups synced">{app.groups}</DetailRow>
                <DetailRow label="Connected on" last>{app.connectedOn ?? "—"}</DetailRow>
              </div>
            </div> */}
          </div>
        </div>
      )}

      {/* {tab === "Attribute mapping" && (
        <div className="card">
          <div className="card-h">
            <div>
              <h3>Attribute mapping</h3>
              <div className="meta">{ATTR_MAP.length} attributes · FlyView → {app.vendor ?? app.name}</div>
            </div>
          </div>
          <table>
            <thead><tr>{["FlyView attribute", "Target attribute", "Transform", "Required"].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {ATTR_MAP.map(m => (
                <tr key={m.source} style={{ cursor: "default" }}>
                  <td className="mo pr">{m.source}</td>
                  <td className="mo">{m.target}</td>
                  <td>{m.transform}</td>
                  <td>{m.required ? <span className="ch">Required</span> : <span style={{ color: "var(--txt3)" }}>Optional</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Sync history" && (
        <div className="card">
          <div className="card-h">
            <div>
              <h3>Sync history</h3>
              <div className="meta">{history.length ? `Last ${history.length} runs` : "No runs recorded"}</div>
            </div>
          </div>
          {history.length ? (
            <table>
              <thead><tr>{["Run", "Type", "Duration", "Created", "Updated", "Deprovisioned", "Errors", "Result"].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.at} style={{ cursor: "default" }}>
                    <td className="mo">{h.at}</td>
                    <td>{h.type}</td>
                    <td className="mo">{h.duration}</td>
                    <td className="mo">{h.created}</td>
                    <td className="mo">{h.updated}</td>
                    <td className="mo">{h.deprovisioned}</td>
                    <td className="mo" style={{ color: h.errors ? "var(--crit)" : "var(--txt2)" }}>{h.errors}</td>
                    <td><span className={`b ${RUN_RESULT[h.result]}`}><i />{h.result[0] + h.result.slice(1).toLowerCase()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="card-b" style={{ fontSize: 12.5, color: "var(--txt3)" }}>
              No sync has run for this integration yet.
            </div>
          )}
        </div>
      )} */}
    </div>
  );
}

// ── Inbound connection card ───────────────────────────────────────
function ConnectionCard({ conn, usersSynced, onRotate, onDisconnect }) {
  const s = STATUS[conn.status];
  const provider = PROVIDERS.find(p => p.idp === conn.idp);
  const label = (provider?.label ?? conn.idp);

  return (
    <div className="card" style={{ padding: 16, marginBottom: 12 }}>
      {/* Identity row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          border: "1px solid var(--border)", background: "var(--bg3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, color: "var(--txt2)",
        }}>
          {label.slice(0, 2)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{label.toUpperCase()}</div>
          <div style={{ fontSize: 11.5, color: "var(--txt3)", marginTop: 2 }}>
            {conn.name} · idp: {conn.idp}
          </div>
        </div>

        <span className={`b ${s.cls}`} style={{ flexShrink: 0 }}>
          <i />
          {conn.status === "PENDING SETUP" ? "Pending setup" : conn.status[0] + conn.status.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Sync row */}
      <div style={{ display: "flex", gap: 28, marginTop: 14, fontSize: 12, color: "var(--txt2)" }}>
        <span>SCIM · last sync <strong style={{ color: "var(--txt)" }}>{conn.lastSync}</strong></span>
        <span>
          Users synced: <strong style={{ color: "var(--txt)" }}>{usersSynced}</strong>{" "}
          <span style={{ color: "var(--txt3)", fontSize: 11 }}>(live count)</span>
        </span>
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)",
      }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--txt3)" }}>{SCIM_BASE_URL}</span>
        <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
          <button
            onClick={() => onRotate(conn)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--txt2)", padding: 0 }}
          >
            ⟳ Rotate token
          </button>
          <button
            onClick={() => onDisconnect(conn.id)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--crit)", padding: 0 }}
          >
            ⚡ Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationTab() {
  const [outbound, setOutbound] = useState(APPS);
  const [inbound, setInbound] = useState([]);
  const [showAddApp, setShowAddApp] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showAddSource, setShowAddSource] = useState(false);
  const [rotating, setRotating] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    IdentityService.getUsers().then(setUsers);
  }, []);

  const connected = outbound.filter(a => a.status !== "PENDING SETUP").length;
  const inboundConnected = inbound.filter(a => a.status !== "PENDING SETUP").length;

  // Live count — users this provider actually syncs into the tenant.
  function usersSyncedFor(conn) {
    return users.filter(u => (u.identityProvider ?? "").toLowerCase() === conn.idp).length;
  }

  // payload = { name, vendor, adminEmail, customerId, status }
  function handleCreateApp(payload) {
    setOutbound(prev => [
      ...prev,
      {
        id: `app-${prev.length + 1}`,
        name: payload.name,
        vendor: payload.vendor,
        connector: `${payload.vendor.toLowerCase().replace(/\s+/g, "-")}-scim`,
        adminEmail: payload.adminEmail,
        customerId: payload.customerId,
        status: payload.status,
        sync: "SCIM · not synced yet",
        lastSync: null,
        connectedOn: new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
        users: 0,
        groups: 0,
        lastRun: null,
        history: [],
      },
    ]);
  }

  // payload = { name, idp, tenant } — the request body the API would receive
  function handleCreate(payload) {
    setInbound(prev => [
      ...prev,
      {
        id: `${payload.idp}-${prev.length + 1}`,
        name: payload.name,
        idp: payload.idp,
        tenant: payload.tenant,
        status: "CONNECTED",
        lastSync: "just now",
      },
    ]);
  }

  function handleRotated(id) {
    setInbound(prev => prev.map(c => c.id === id ? { ...c, lastSync: "just now" } : c));
  }

  function handleDisconnect(id) {
    setInbound(prev => prev.filter(c => c.id !== id));
  }

  if (selectedApp) {
    // Always render the latest copy from state, not the snapshot taken on click.
    const app = outbound.find(a => a.id === selectedApp) ?? null;
    if (app) return <AppDetail app={app} onBack={() => setSelectedApp(null)} />;
  }

  return (
    <>
      <div className="card">
        <div className="card-h">
          <div>
            <h3>Applications</h3>
            <div className="meta">{connected} connected · SCIM outbound provisioning</div>
          </div>
          <button className="btn p" onClick={() => setShowAddApp(true)}>+ Add app integration</button>
        </div>

        <div className="card-b">
          <div className="kg k3">
            {outbound.map(app => {
              const s = STATUS[app.status];
              return (
                <div
                  key={app.id}
                  className="card"
                  onClick={() => setSelectedApp(app.id)}
                  style={{ borderTop: `3px solid ${s.border}`, padding: 16, cursor: "pointer" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{app.name}</div>
                    <span className={`b ${s.cls}`}>
                      <i />
                      {app.status === "PENDING SETUP" ? "Pending setup" : app.status[0] + app.status.slice(1).toLowerCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: 11.5, color: "var(--txt3)", marginTop: 6 }}>{app.sync}</div>

                  <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, color: "var(--txt2)" }}>
                    <span>👤 {app.users} users</span>
                    <span>👥 {app.groups} groups</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <div className="card-h">
          <div>
            <h3>Applications</h3>
            <div className="meta">{inboundConnected} connected · SCIM inbound provisioning</div>
          </div>
          <button className="btn p" onClick={() => setShowAddSource(true)}>+ Add source</button>
        </div>

        <div className="card-b">
          {inbound.length === 0 ? (
            <div style={{ padding: "28px 16px", textAlign: "center", color: "var(--txt3)", fontSize: 12.5 }}>
              <img src={plugConnectIcon} alt="" style={{ display: "block", width: 28, height: 28, margin: "0 auto 10px", opacity: 0.5 }} />
              <strong>No SCIM connections yet</strong><br />
              Connect Okta, Google workspace, or Microsoft Entra ID to start syncing users automatically.
            </div>
          ) : (
            <div className="kg k2">
              {inbound.map(conn => (
                <ConnectionCard
                  key={conn.id}
                  conn={conn}
                  usersSynced={usersSyncedFor(conn)}
                  onRotate={setRotating}
                  onDisconnect={handleDisconnect}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddApp && (
        <AddAppIntegrationModal
          onClose={() => setShowAddApp(false)}
          onCreate={handleCreateApp}
        />
      )}

      {showAddSource && (
        <AddSourceModal
          onClose={() => setShowAddSource(false)}
          onCreate={handleCreate}
        />
      )}

      {rotating && (
        <RotateTokenModal
          connection={rotating}
          onClose={() => setRotating(null)}
          onRotated={handleRotated}
        />
      )}
    </>
  );
}
