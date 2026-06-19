// Calls the C# backend which proxies Jolpica/Ergast

export async function fetchRaceCalendar(season = 2026) {
  const res = await fetch(`/api/calendar/races/${season}`)
  if (!res.ok) throw new Error(`Calendar fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchCircuits(season = 2026) {
  const res = await fetch(`/api/calendar/circuits/${season}`)
  if (!res.ok) throw new Error(`Circuits fetch failed: ${res.status}`)
  return res.json()
}

// Winning driver of every completed round this season (single backend call)
export async function fetchSeasonWinners(season = 2026) {
  const res = await fetch(`/api/calendar/races/${season}/winners`)
  if (!res.ok) throw new Error(`Winners fetch failed: ${res.status}`)
  return res.json()
}

// A driver's all-time record at one circuit
export async function fetchDriverCircuitHistory(circuitId, driverId) {
  const res = await fetch(`/api/calendar/circuits/${circuitId}/drivers/${driverId}/history`)
  if (!res.ok) throw new Error(`Circuit history fetch failed: ${res.status}`)
  return res.json()
}
