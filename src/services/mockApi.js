// Simulates network latency for realistic demo feel
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms))

export async function fetchJson(path) {
  await delay(Math.random() * 300 + 200)
  const mod = await import(`../mock-data/${path}.json`)
  return mod.default
}

export async function get(resource, id) {
  const data = await fetchJson(resource)
  if (id !== undefined) {
    if (Array.isArray(data)) return data.find(item => item.id === id) ?? null
    return data[id] ?? null
  }
  return data
}
