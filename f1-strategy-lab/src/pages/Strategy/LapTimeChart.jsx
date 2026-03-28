import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend
} from 'recharts'
import { useAppStore } from '../../store/useAppStore.js'
import { CIRCUIT_BASE_TIMES, TYRE_DEG } from '../../data/baseLapTimes.js'
import { COMPOUNDS } from './TyreSelector.jsx'

const PIT_PENALTY = 22.5

function formatLapTime(seconds) {
  if (!seconds || seconds > 200) return '–'
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toFixed(3).padStart(6, '0')
  return `${m}:${s}`
}

function getStintForLap(lap, stints) {
  let cursor = 1
  for (const stint of stints) {
    const end = cursor + stint.laps - 1
    if (lap >= cursor && lap <= end) return { stint, startLap: cursor }
    cursor = end + 1
  }
  return { stint: stints[stints.length - 1], startLap: cursor }
}

function isPitLap(lap, stints) {
  let cursor = 1
  for (const stint of stints) {
    cursor += stint.laps
    if (lap === cursor - 1) return true  // last lap of stint = pit lap (adds penalty to next)
  }
  return false
}

function buildChartData(strategy1, strategy2, circuitId) {
  const base = CIRCUIT_BASE_TIMES[circuitId] ?? 85
  const totalLaps = strategy1.stints.reduce((s, st) => s + st.laps, 0)
  const data = []

  for (let lap = 1; lap <= totalLaps; lap++) {
    const row = { lap }

    for (const [key, strategy] of [['strategy1', strategy1], ['strategy2', strategy2]]) {
      const { stint, startLap } = getStintForLap(lap, strategy.stints)
      const age = lap - startLap
      const deg = (TYRE_DEG[stint.compound] ?? 0.055) * age
      const pit = isPitLap(lap, strategy.stints) ? PIT_PENALTY : 0
      row[key] = parseFloat((base + deg + pit).toFixed(3))
    }

    data.push(row)
  }
  return data
}

function getPitLaps(stints) {
  const laps = []
  let cursor = 1
  for (const stint of stints.slice(0, -1)) {
    cursor += stint.laps
    laps.push(cursor - 1)
  }
  return laps
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-lg p-3 text-xs">
      <p className="text-gray-400 mb-1">Lap {label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.name}: {formatLapTime(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function LapTimeChart({ strategy1, strategy2, circuitId = 'bahrain' }) {
  const isDark = useAppStore(s => s.isDark)

  const data = buildChartData(strategy1, strategy2, circuitId)

  // Exclude pit laps from Y domain calculation
  const nonPitTimes = data.flatMap(d => [d.strategy1, d.strategy2]).filter(v => v < 150)
  const yMin = Math.floor(Math.min(...nonPitTimes)) - 1
  const yMax = Math.ceil(Math.max(...nonPitTimes)) + 2

  const gridColor  = isDark ? '#2a2a2e' : '#e5e7eb'
  const labelColor = isDark ? '#9ca3af' : '#374151'

  const pitLaps1 = getPitLaps(strategy1.stints)
  const pitLaps2 = getPitLaps(strategy2.stints)

  // Determine compound for each lap (for colouring the line segments — simplified: use overall strat color)
  const s1Color = '#e10600'
  const s2Color = '#00d2ff'

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 52 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="lap"
          tick={{ fill: labelColor, fontSize: 11 }}
          label={{ value: 'Lap', position: 'insideBottom', offset: -2, fill: labelColor, fontSize: 11 }}
        />
        <YAxis
          domain={[yMin, yMax]}
          tickFormatter={formatLapTime}
          tick={{ fill: labelColor, fontSize: 10, fontFamily: 'monospace' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ color: value === 'strategy1' ? s1Color : s2Color, fontSize: 12 }}>
              {value === 'strategy1' ? strategy1.label : strategy2.label}
            </span>
          )}
        />
        {/* Pit stop reference lines */}
        {pitLaps1.map(lap => (
          <ReferenceLine key={`p1-${lap}`} x={lap} stroke={s1Color} strokeDasharray="4 4" strokeOpacity={0.6} />
        ))}
        {pitLaps2.map(lap => (
          <ReferenceLine key={`p2-${lap}`} x={lap} stroke={s2Color} strokeDasharray="4 4" strokeOpacity={0.6} />
        ))}
        <Line
          type="monotone"
          dataKey="strategy1"
          stroke={s1Color}
          strokeWidth={2}
          dot={false}
          name="strategy1"
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="strategy2"
          stroke={s2Color}
          strokeWidth={2}
          dot={false}
          name="strategy2"
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
