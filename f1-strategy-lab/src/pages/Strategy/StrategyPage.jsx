import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../../store/useAppStore.js'
import { ACTIVE_CIRCUITS, CIRCUIT_MAP } from '../../data/circuits2026.js'
import { fetchWeather } from '../../api/strategy.js'
import Card from '../../components/shared/Card.jsx'
import TyreSelector, { TyreCircle, COMPOUNDS } from './TyreSelector.jsx'
import PitWindowBar from './PitWindowBar.jsx'
import LapTimeChart from './LapTimeChart.jsx'
import Badge from '../../components/shared/Badge.jsx'

const TEMPLATES = {
  '1-Stop': [
    { id: 'st1', compound: 'Medium', laps: 28 },
    { id: 'st2', compound: 'Hard',   laps: 29 },
  ],
  '2-Stop': [
    { id: 'st1', compound: 'Soft',   laps: 18 },
    { id: 'st2', compound: 'Medium', laps: 20 },
    { id: 'st3', compound: 'Hard',   laps: 19 },
  ],
  '3-Stop': [
    { id: 'st1', compound: 'Soft', laps: 14 },
    { id: 'st2', compound: 'Soft', laps: 14 },
    { id: 'st3', compound: 'Medium', laps: 15 },
    { id: 'st4', compound: 'Hard', laps: 14 },
  ],
}

export default function StrategyPage() {
  const { selectedCircuitId, setSelectedCircuitId, strategies, updateStint, addStint, removeStint } = useAppStore()
  const circuit = CIRCUIT_MAP[selectedCircuitId] ?? ACTIVE_CIRCUITS[0]

  // Active strategies for comparison (indices 0 and 1)
  const [s1Idx, setS1Idx] = useState(0)
  const [s2Idx, setS2Idx] = useState(Math.min(1, strategies.length - 1))

  const strategy1 = strategies[s1Idx] ?? strategies[0]
  const strategy2 = strategies[s2Idx] ?? strategies[0]

  // Weather query
  const { data: weather } = useQuery({
    queryKey: ['weather', circuit.latitude, circuit.longitude, circuit.date],
    queryFn: () => fetchWeather(circuit.latitude, circuit.longitude, circuit.date),
    enabled: !!circuit.latitude,
  })

  const applyTemplate = (strategyIdx, templateName) => {
    const stints = TEMPLATES[templateName]
    // Replace by adding a new strategy with template stints
    const { strategies: strats, addStrategy, updateStint: update } = useAppStore.getState()
    // Simple approach: overwrite the strategy stints directly via store
    const strat = strats[strategyIdx]
    if (!strat) return
    // Remove all existing stints and add new ones via store
    useAppStore.setState(state => ({
      strategies: state.strategies.map((s, i) =>
        i !== strategyIdx ? s : {
          ...s,
          label: templateName,
          stints: stints.map(st => ({ ...st, id: `st${Date.now()}${Math.random()}` }))
        }
      )
    }))
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Race Strategy Builder</h1>
          <p className="text-sm text-gray-400 mt-1">Design and compare race strategies with lap time projections</p>
        </div>
        {/* Circuit selector */}
        <select
          value={selectedCircuitId}
          onChange={e => setSelectedCircuitId(e.target.value)}
          className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder text-gray-900 dark:text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-f1blue"
        >
          {ACTIVE_CIRCUITS.map(c => (
            <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left column: Strategy editors */}
        <div className="xl:col-span-1 space-y-4">
          {strategies.slice(0, 2).map((strategy, idx) => (
            <Card key={strategy.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-f1red' : 'bg-f1blue'}`} />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{strategy.label}</h3>
                </div>
                {/* Template picker */}
                <div className="flex gap-1">
                  {Object.keys(TEMPLATES).map(t => (
                    <button
                      key={t}
                      onClick={() => applyTemplate(idx, t)}
                      className="text-[10px] px-2 py-0.5 rounded border border-gray-200 dark:border-darkBorder text-gray-400 hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stint rows */}
              <div className="space-y-2">
                {strategy.stints.map((stint, si) => (
                  <div key={stint.id} className="flex items-center gap-2 bg-gray-50 dark:bg-darkBg/50 rounded-lg p-2">
                    <span className="text-xs text-gray-500 w-5">S{si + 1}</span>
                    {/* Tyre */}
                    <TyreCircle
                      compound={stint.compound}
                      size="sm"
                      selected
                    />
                    {/* Compound selector */}
                    <select
                      value={stint.compound}
                      onChange={e => updateStint(strategy.id, stint.id, { compound: e.target.value })}
                      className="flex-1 bg-transparent text-gray-900 dark:text-white text-xs border border-gray-200 dark:border-darkBorder rounded px-1 py-0.5 focus:outline-none focus:border-f1blue"
                    >
                      {Object.keys(COMPOUNDS).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {/* Laps */}
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1} max={80}
                        value={stint.laps}
                        onChange={e => updateStint(strategy.id, stint.id, { laps: parseInt(e.target.value) || 1 })}
                        className="w-10 bg-transparent text-gray-900 dark:text-white text-xs border border-gray-200 dark:border-darkBorder rounded px-1 py-0.5 text-center focus:outline-none focus:border-f1blue"
                      />
                      <span className="text-[10px] text-gray-500">laps</span>
                    </div>
                    {/* Remove */}
                    {strategy.stints.length > 1 && (
                      <button
                        onClick={() => removeStint(strategy.id, stint.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                      >✕</button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add stint */}
              <button
                onClick={() => addStint(strategy.id)}
                className="mt-2 w-full text-xs text-gray-500 hover:text-f1blue border border-dashed border-gray-200 dark:border-darkBorder hover:border-f1blue/50 rounded-lg py-1.5 transition-colors"
              >
                + Add Stint
              </button>

              {/* Total laps */}
              <div className="mt-2 text-xs text-gray-500">
                Total: <span className="text-gray-900 dark:text-white font-semibold">
                  {strategy.stints.reduce((s, st) => s + (st.laps || 0), 0)} laps
                </span>
                {' '}· {strategy.stints.length - 1} pit stop{strategy.stints.length - 1 !== 1 ? 's' : ''}
              </div>
            </Card>
          ))}
        </div>

        {/* Right column: Charts */}
        <div className="xl:col-span-2 space-y-6">

          {/* Lap Time Chart */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-1">Lap Time Projection</h2>
            <p className="text-xs text-gray-500 mb-4">
              Dashed lines = pit stops · Circuit: {circuit.name}
            </p>
            <LapTimeChart
              strategy1={strategy1}
              strategy2={strategy2}
              circuitId={selectedCircuitId}
            />
          </Card>

          {/* Pit Window */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Pit Window Analysis</h2>
            <PitWindowBar
              totalLaps={circuit.laps}
              pitLap={strategy1.stints[0]?.laps}
            />
          </Card>

          {/* Weather panel */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">
              Race Day Forecast — {circuit.location}
            </h2>
            {weather ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <WeatherCard
                  icon={weather.condition === 'Rain' ? '🌧' : weather.condition === 'Possible Rain' ? '⛅' : '☀️'}
                  label="Condition"
                  value={weather.condition}
                  badge={weather.condition === 'Rain' ? 'red' : weather.condition === 'Possible Rain' ? 'yellow' : 'green'}
                />
                <WeatherCard
                  icon="💧"
                  label="Rain Probability"
                  value={weather.rainProbabilityMax != null ? `${weather.rainProbabilityMax}%` : 'N/A'}
                />
                <WeatherCard
                  icon="🌡"
                  label="Max Temp"
                  value={weather.temperatureMax != null ? `${weather.temperatureMax}°C` : 'N/A'}
                />
                <WeatherCard
                  icon="💨"
                  label="Wind Speed"
                  value={weather.windSpeedMax != null ? `${weather.windSpeedMax} km/h` : 'N/A'}
                />
              </div>
            ) : (
              <div className="text-sm text-gray-500">Loading weather data…</div>
            )}

            {/* Safety Car probability */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-darkBorder grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500">Safety Car %</div>
                <div className="text-xl font-bold text-yellow-400 mt-1">
                  {scProbability(circuit)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">VSC %</div>
                <div className="text-xl font-bold text-yellow-600 mt-1">
                  {Math.round(scProbability(circuit) * 0.6)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Red Flag %</div>
                <div className="text-xl font-bold text-f1red mt-1">
                  {rfProbability(circuit)}%
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function WeatherCard({ icon, label, value, badge }) {
  return (
    <div className="text-center">
      <div className="text-2xl">{icon}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
      <div className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{value}</div>
    </div>
  )
}

// SC probability heuristics based on circuit characteristics
function scProbability(circuit) {
  const base = {
    monaco: 82, singapore: 72, 'saudi-arabia': 65, azerbaijan: 62, 'las-vegas': 55,
    brazil: 52, usa: 48, australia: 45, austria: 38, bahrain: 30,
  }
  return base[circuit.id] ?? 42
}

function rfProbability(circuit) {
  const base = { monaco: 22, singapore: 18, azerbaijan: 15, 'las-vegas': 12 }
  return base[circuit.id] ?? 8
}
