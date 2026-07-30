// Lightweight in-memory bridge so the Accounts detail popup can hand a
// provider filter to another Cloud tab when the user clicks a discovery link.
// Not persisted — a fresh page load starts unfiltered.
let pendingProvider = null

export function setPendingProviderFilter(provider) {
  pendingProvider = provider
}

export function consumePendingProviderFilter() {
  const p = pendingProvider
  pendingProvider = null
  return p
}
