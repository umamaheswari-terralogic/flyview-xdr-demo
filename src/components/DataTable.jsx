export default function DataTable({ headers, children, onRowClick }) {
  return (
    <div className="card mb-18" style={{ marginBottom: 18 }}>
      <table>
        <thead>
          <tr>
            {headers.map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
