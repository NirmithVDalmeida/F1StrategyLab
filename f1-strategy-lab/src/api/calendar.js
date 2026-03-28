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
