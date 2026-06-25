import { Icons } from '../shared/icons.jsx'

export default function SearchBar({ placeholder = 'Search alerts, devices, users…' }) {
  return (
    <div className="srch">
      {Icons.search}
      <span>{placeholder}</span>
      <kbd>⌘K</kbd>
    </div>
  )
}
