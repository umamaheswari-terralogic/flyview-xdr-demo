import WidgetCard from '../../../components/WidgetCard.jsx'

const USERS = [
  { name: 'John Doe', email: 'john.d@acme.com', dept: 'Finance', score: 87, mfa: 'TOTP', flag: 'PIP', cls: 'cr' },
  { name: 'Robert Chen', email: 'r.chen@acme.com', dept: 'Finance', score: 91, mfa: 'NONE', flag: 'OFFBOARDING', cls: 'cr' },
  { name: 'Sarah Kim', email: 'sarah.k@acme.com', dept: 'Engineering', score: 72, mfa: 'WebAuthn', flag: 'TRAVEL', cls: 'hi' },
  { name: 'Mike Ross', email: 'mike.r@acme.com', dept: 'Sales', score: 44, mfa: 'Push', flag: '', cls: 'me' },
]

export default function HumanRiskTab() {
  return (
    <>
      <div className="kg k4" style={{ marginBottom: 18 }}>
        <div className="kc cr"><div className="kl"><span className="klab">High Risk Users</span></div><div className="kn">4</div><div className="kd">Score &gt; 70</div><div className="kf"><b>▲ +1</b> today</div></div>
        <div className="kc hi"><div className="kl"><span className="klab">MFA Gap</span></div><div className="kn">6%</div><div className="kd">Users on TOTP only</div><div className="kf">Target: 0%</div></div>
        <div className="kc ok"><div className="kl"><span className="klab">MFA Coverage</span></div><div className="kn">94%</div><div className="kd">Enrolled of 930</div><div className="kf">↑ from 91% last month</div></div>
        <div className="kc me"><div className="kl"><span className="klab">Phishing Sim</span></div><div className="kn">18%</div><div className="kd">Click rate last campaign</div><div className="kf">Target &lt; 5%</div></div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-h"><h3>High-Risk User Watchlist</h3><button className="btn p">Run simulation</button></div>
        <table>
          <thead><tr>{['User', 'Department', 'Risk Score', 'MFA', 'Flag', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {USERS.map(u => (
              <tr key={u.email}>
                <td><div style={{ fontWeight: 600 }}>{u.name}</div><div style={{ fontSize: 11, color: 'var(--txt3)' }}>{u.email}</div></td>
                <td>{u.dept}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="pb" style={{ width: 60 }}><i style={{ width: `${u.score}%`, background: u.cls === 'cr' ? 'var(--crit)' : u.cls === 'hi' ? 'var(--high)' : 'var(--med)' }} /></div>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: u.cls === 'cr' ? 'var(--crit)' : u.cls === 'hi' ? 'var(--high)' : 'var(--med)' }}>{u.score}</span>
                  </div>
                </td>
                <td>{u.mfa === 'NONE' ? <span className="b cr"><i />NONE</span> : <span className="ch">{u.mfa}</span>}</td>
                <td>{u.flag && <span className={`b ${u.cls}`}><i />{u.flag}</span>}</td>
                <td><div className="brow"><button className="btn">View</button>{u.score > 80 && <button className="btn d">Suspend</button>}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
