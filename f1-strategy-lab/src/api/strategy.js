// Calls the C# backend for strategy-related data

export async function fetchPitStops(season, round) {
  const res = await fetch(`/api/strategy/pitstops?season=${season}&round=${round}`)
  if (!res.ok) throw new Error(`Pit stops fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchStints(sessionKey, driverNumber) {
  const params = new URLSearchParams({ sessionKey })
  if (driverNumber != null) params.set('driverNumber', driverNumber)
  const res = await fetch(`/api/strategy/stints?${params}`)
  if (!res.ok) throw new Error(`Stints fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchWeather(latitude, longitude, raceDate) {
  const params = new URLSearchParams({ latitude, longitude, raceDate })
  const res = await fetch(`/api/strategy/weather?${params}`)
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`)
  return res.json()
}
