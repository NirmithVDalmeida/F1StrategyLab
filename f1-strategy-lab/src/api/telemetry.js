// Calls the C# backend for telemetry (OpenF1 data)

export async function fetchCarData(sessionKey, driverNumber) {
  const res = await fetch(`/api/telemetry/car?sessionKey=${sessionKey}&driverNumber=${driverNumber}`)
  if (!res.ok) throw new Error(`Car data fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchPositions(sessionKey, driverNumber) {
  const res = await fetch(`/api/telemetry/position?sessionKey=${sessionKey}&driverNumber=${driverNumber}`)
  if (!res.ok) throw new Error(`Position fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchLaps(sessionKey, driverNumber) {
  const params = new URLSearchParams({ sessionKey })
  if (driverNumber != null) params.set('driverNumber', driverNumber)
  const res = await fetch(`/api/telemetry/laps?${params}`)
  if (!res.ok) throw new Error(`Laps fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchComparisonStandings(season = 2025) {
  const res = await fetch(`/api/comparison/standings/${season}`)
  if (!res.ok) throw new Error(`Standings fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchRaceResults(season, round) {
  const res = await fetch(`/api/comparison/results?season=${season}&round=${round}`)
  if (!res.ok) throw new Error(`Results fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchComparisonTelemetry(sessionKey, drivers) {
  const params = new URLSearchParams({ sessionKey, drivers: drivers.join(',') })
  const res = await fetch(`/api/comparison/telemetry?${params}`)
  if (!res.ok) throw new Error(`Comparison telemetry fetch failed: ${res.status}`)
  return res.json()
}
