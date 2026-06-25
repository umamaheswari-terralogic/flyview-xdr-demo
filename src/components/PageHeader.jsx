export default function PageHeader({ title, subtitle }) {
  return (
    <div className="tb-title">
      <h1 dangerouslySetInnerHTML={{ __html: title }} />
      <p>{subtitle}</p>
    </div>
  )
}
