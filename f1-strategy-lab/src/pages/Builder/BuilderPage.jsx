import { useState, lazy, Suspense } from 'react'
import { useAppStore } from '../../store/useAppStore.js'
import { ACTIVE_CIRCUITS, CIRCUIT_MAP } from '../../data/circuits2026.js'
import Card from '../../components/shared/Card.jsx'
import AeroViz from './AeroViz.jsx'
import ConfigSliders from './ConfigSliders.jsx'
import SimResults from './SimResults.jsx'
import Spinner from '../../components/shared/Spinner.jsx'

// Lazy-load the 3D component (heavy Three.js bundle)
const AeroViz3D = lazy(() => import('./AeroViz3D.jsx'))

const LAYER_OPTIONS = [
  { id: 'flow',     label: 'Flow Lines' },
  { id: 'pressure', label: 'Pressure' },
  { id: 'labels',   label: 'Labels' },
]

export default function BuilderPage() {
  const { selectedCircuitId, setSelectedCircuitId, carConfig, savedConfigs, saveCurrentConfig, loadSavedConfig, deleteSavedConfig } = useAppStore()
  const circuit = CIRCUIT_MAP[selectedCircuitId] ?? ACTIVE_CIRCUITS[0]

  const [activeLayers, setActiveLayers] = useState({ flow: true, pressure: true, labels: true })
  const [vizMode, setVizMode] = useState('2d') // '2d' | '3d'
  const [saveLabel, setSaveLabel] = useState('')
  const [showSaveInput, setShowSaveInput] = useState(false)

  const toggleLayer = id => setActiveLayers(prev => ({ ...prev, [id]: !prev[id] }))

  const handleSave = () => {
    if (!saveLabel.trim()) return
    saveCurrentConfig(saveLabel.trim())
    setSaveLabel('')
    setShowSaveInput(false)
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Car Builder & Simulation</h1>
          <p className="text-sm text-gray-400 mt-1">
            Tune aerodynamics, power unit, and chassis — simulate lap time impact
          </p>
        </div>
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

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* Left: Config sliders */}
        <div className="xl:col-span-1">
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">Configuration</h2>
            <ConfigSliders />
          </Card>

          {/* Saved configs */}
          <Card className="p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-300">Saved Setups</h2>
              <button
                onClick={() => setShowSaveInput(v => !v)}
                className="text-xs text-f1blue hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                + Save Current
              </button>
            </div>

            {showSaveInput && (
              <div className="flex gap-1.5 mb-3">
                <input
                  type="text"
                  value={saveLabel}
                  onChange={e => setSaveLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  placeholder="Setup name…"
                  className="flex-1 bg-white dark:bg-darkBg border border-gray-200 dark:border-darkBorder text-gray-900 dark:text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-f1blue"
                />
                <button
                  onClick={handleSave}
                  className="text-xs px-2 py-1 bg-f1blue/20 text-f1blue rounded hover:bg-f1blue/30 transition-colors"
                >
                  Save
                </button>
              </div>
            )}

            {savedConfigs.length === 0 ? (
              <p className="text-xs text-gray-600">No saved setups yet.</p>
            ) : (
              <div className="space-y-1.5">
                {savedConfigs.map(cfg => (
                  <div key={cfg.id} className="flex items-center gap-2 bg-gray-100 dark:bg-darkBg/60 rounded-lg px-2.5 py-1.5">
                    <span className="flex-1 text-xs text-gray-900 dark:text-white truncate">{cfg.name}</span>
                    <button
                      onClick={() => loadSavedConfig(cfg.id)}
                      className="text-[10px] text-f1blue hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteSavedConfig(cfg.id)}
                      className="text-[10px] text-gray-600 hover:text-f1red transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Center: AeroViz */}
        <div className="xl:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-300">Aerodynamic Visualisation</h2>
              <div className="flex items-center gap-2">
                {/* 2D / 3D toggle */}
                <div className="flex rounded-md overflow-hidden border border-gray-200 dark:border-darkBorder">
                  <button
                    onClick={() => setVizMode('2d')}
                    className={`text-[10px] px-2 py-0.5 font-semibold transition-colors ${
                      vizMode === '2d'
                        ? 'bg-f1blue text-white'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    2D
                  </button>
                  <button
                    onClick={() => setVizMode('3d')}
                    className={`text-[10px] px-2 py-0.5 font-semibold transition-colors flex items-center gap-1 ${
                      vizMode === '3d'
                        ? 'bg-f1red text-white'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    3D
                    <span className="text-[8px] bg-f1red/80 text-white px-1 rounded-sm font-bold leading-tight">BETA</span>
                  </button>
                </div>
                {/* Layer toggles */}
                <div className="flex gap-1.5">
                  {LAYER_OPTIONS.map(layer => (
                    <button
                      key={layer.id}
                      onClick={() => toggleLayer(layer.id)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        activeLayers[layer.id]
                          ? 'border-f1blue/50 text-f1blue bg-f1blue/10'
                          : 'border-gray-200 dark:border-darkBorder text-gray-600'
                      }`}
                    >
                      {layer.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {vizMode === '2d' ? (
              <AeroViz
                showFlow={activeLayers.flow}
                showPressure={activeLayers.pressure}
                showLabels={activeLayers.labels}
              />
            ) : (
              <Suspense fallback={
                <div className="flex items-center justify-center" style={{ height: 420 }}>
                  <div className="text-center">
                    <Spinner size="lg" />
                    <p className="text-xs text-gray-500 mt-2">Loading 3D engine…</p>
                  </div>
                </div>
              }>
                <AeroViz3D activeLayers={activeLayers} />
              </Suspense>
            )}
          </Card>

          {/* Car config summary chips */}
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Active Configuration</h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { label: 'Front Wing',   val: carConfig.frontWing,      unit: '%',   color: '#00d2ff' },
                { label: 'Rear Wing',    val: carConfig.rearWing,       unit: '%',   color: '#00d2ff' },
                { label: 'Ride Height',  val: carConfig.floorRideHeight,unit: 'mm',  color: '#39b54a' },
                { label: 'ICE',          val: carConfig.iceOutput,      unit: '%',   color: '#e10600' },
                { label: 'ERS',          val: carConfig.ersRate,        unit: '%',   color: '#f5c518' },
              ].map(item => (
                <div key={item.label} className="bg-gray-100 dark:bg-darkBg/60 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-gray-500">{item.label}</div>
                  <div className="text-lg font-black mt-0.5" style={{ color: item.color }}>
                    {item.val}
                  </div>
                  <div className="text-[10px] text-gray-600">{item.unit}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Sim results */}
        <div className="xl:col-span-1">
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">
              Simulation — {circuit.flag} {circuit.name}
            </h2>
            <SimResults circuitId={selectedCircuitId} />
          </Card>
        </div>

      </div>
    </div>
  )
}
