// Baseline lap times in seconds (approx current lap records / expected 2026 pace)
// Used as starting point for the simulation formula on Page 5

export const CIRCUIT_BASE_TIMES = {
  bahrain:       95.766,   // 1:35.766 — Verstappen 2021
  'saudi-arabia':  87.466, // 1:27.466 — Leclerc 2022
  australia:    79.179,   // 1:19.179 — Leclerc 2022
  japan:        90.983,   // 1:30.983 — Leclerc 2019
  china:        91.417,   // 1:31.417 — Michael Schumacher 2004
  miami:        89.820,   // 1:29.820 — Verstappen 2023
  monaco:       71.909,   // 1:11.909 — Leclerc 2021
  canada:       72.291,   // 1:12.291 — Bottas 2019
  spain:        79.051,   // 1:19.051 — Rosberg 2016
  madrid:       92.000,   // ~1:32.000 — New circuit estimate
  austria:      64.984,   // 1:04.984 — Leclerc 2020
  britain:      85.731,   // 1:25.731 — Hamilton 2020
  hungary:      76.627,   // 1:16.627 — Hamilton 2020
  belgium:      103.701,  // 1:43.701 — Bottas 2018 (full Spa)
  netherlands:  72.097,   // 1:12.097 — Verstappen 2021
  italy:        79.888,   // 1:19.888 — Barrichello 2004
  azerbaijan:   102.394,  // 1:42.394 — Leclerc 2019
  singapore:    88.061,   // 1:28.061 — Lewis Hamilton 2023 (approx)
  usa:          94.763,   // 1:34.763 — Verstappen 2023 (COTA)
  mexico:       79.626,   // 1:19.626 — Bottas 2021
  brazil:       69.997,   // 1:09.997 — Valtteri Bottas 2018
  'las-vegas':   91.319,  // 1:31.319 — Leclerc 2023
  qatar:        82.826,   // 1:22.826 — Verstappen 2023
  'abu-dhabi':   83.234,  // 1:23.234 — Hamilton 2021
}

// Sector split ratios (percentage of total lap time)
// Used to derive sector times from simulated total
export const SECTOR_SPLITS = {
  bahrain:        [0.33, 0.36, 0.31],
  'saudi-arabia': [0.34, 0.33, 0.33],
  australia:      [0.32, 0.35, 0.33],
  japan:          [0.36, 0.30, 0.34],
  china:          [0.33, 0.34, 0.33],
  miami:          [0.34, 0.33, 0.33],
  monaco:         [0.36, 0.33, 0.31],
  spain:          [0.34, 0.32, 0.34],
  britain:        [0.32, 0.35, 0.33],
  italy:          [0.35, 0.31, 0.34],
  'abu-dhabi':    [0.34, 0.33, 0.33],
}

export function getSectorSplits(circuitId) {
  return SECTOR_SPLITS[circuitId] ?? [0.33, 0.34, 0.33]
}

// Tyre degradation (seconds per lap of additional time)
export const TYRE_DEG = {
  Soft:         0.085,
  Medium:       0.055,
  Hard:         0.032,
  Intermediate: 0.040,
  Wet:          0.028,
}
