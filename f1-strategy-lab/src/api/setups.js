const BASE = '/api/setups'

// ── Car Setups (saved configurations) ─────────────────────────────

export async function fetchSavedSetups() {
  const res = await fetch(`${BASE}/configs`)
  if (!res.ok) throw new Error('Failed to fetch setups')
  return res.json()
}

export async function createSetup(name, config) {
  const res = await fetch(`${BASE}/configs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, config }),
  })
  if (!res.ok) throw new Error('Failed to create setup')
  return res.json()
}

export async function updateSetup(id, name, config) {
  const res = await fetch(`${BASE}/configs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, config }),
  })
  if (!res.ok) throw new Error('Failed to update setup')
}

export async function deleteSetup(id) {
  const res = await fetch(`${BASE}/configs/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete setup')
}

// ── Strategies ────────────────────────────────────────────────────

export async function fetchStrategies() {
  const res = await fetch(`${BASE}/strategies`)
  if (!res.ok) throw new Error('Failed to fetch strategies')
  return res.json()
}

export async function createStrategy(label, stints) {
  const res = await fetch(`${BASE}/strategies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, stints }),
  })
  if (!res.ok) throw new Error('Failed to create strategy')
  return res.json()
}

export async function updateStrategy(id, label, stints) {
  const res = await fetch(`${BASE}/strategies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, stints }),
  })
  if (!res.ok) throw new Error('Failed to update strategy')
}

export async function deleteStrategy(id) {
  const res = await fetch(`${BASE}/strategies/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete strategy')
}
