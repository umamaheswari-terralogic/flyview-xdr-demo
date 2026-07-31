const APPS = [
  { name: "Google Workspace", status: "ACTIVE",  sync: "SCIM · last sync 4m ago",   users: 420, groups: 6 },
];

const INBOUND = [
  { name: "OKTA", status: "CONNECTED",  sync: "SCIM · last sync 4min ago" },
];

const STATUS = {
  ACTIVE:          { cls: "ok", border: "var(--ok)" },
  CONNECTED:          { cls: "ok", border: "var(--ok)" },
  ERROR:           { cls: "cr", border: "var(--crit)" },
  "PENDING SETUP": { cls: "hi", border: "var(--high)" },
};

export default function ApplicationTab() {
  const connected = APPS.filter(a => a.status !== "PENDING SETUP").length;
  return (
    <>
      <div className="card">
        <div className="card-h">
          <div>
            <h3>Applications</h3>
            <div className="meta">{connected} connected · SCIM outbound provisioning</div>
          </div>
          <button className="btn p">+ Add app integration</button>
        </div>

        <div className="card-b">
          <div className="kg k3">
            {APPS.map(app => {
              const s = STATUS[app.status];
              return (
                <div
                  key={app.name}
                  className="card"
                  style={{ borderTop: `3px solid ${s.border}`, padding: 16 }}
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
            <div className="meta">{connected} connected · SCIM inbound provisioning</div>
          </div>
          <button className="btn p">+ Add source</button>
        </div>

        <div className="card-b">
          <div className="kg k3">
            {INBOUND.map(app => {
              const s = STATUS[app.status];
              return (
                <div
                  key={app.name}
                  className="card"
                  style={{ borderTop: `3px solid ${s.border}`, padding: 16 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{app.name}</div>
                    <span className={`b ${s.cls}`}>
                      <i />
                      {app.status === "PENDING SETUP" ? "Pending setup" : app.status[0] + app.status.slice(1).toLowerCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: 11.5, color: "var(--txt3)", marginTop: 6 }}>{app.sync}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
