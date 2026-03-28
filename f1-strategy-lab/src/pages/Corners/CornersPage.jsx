import { useAppStore } from '../../store/useAppStore.js'
import { ACTIVE_CIRCUITS, CIRCUIT_MAP } from '../../data/circuits2026.js'
import Card from '../../components/shared/Card.jsx'
import TrackMap from './TrackMap.jsx'
import CornerList from './CornerList.jsx'
import Chip from '../../components/shared/Chip.jsx'
import Badge from '../../components/shared/Badge.jsx'

const OVERLAY_MODES = [
  { id: 'speed',    label: 'Min Speed',    color: '#00d2ff' },
  { id: 'braking',  label: 'Braking Zone', color: '#e10600' },
  { id: 'traction', label: 'Traction',     color: '#39b54a' },
  { id: 'gforce',   label: 'G-Force',      color: '#f5c518' },
]

export default function CornersPage() {
  const {
    selectedCircuitId, setSelectedCircuitId,
    hoveredCorner, setHoveredCorner,
    cornerOverlayMode, setCornerOverlayMode,
  } = useAppStore()

  const circuit = CIRCUIT_MAP[selectedCircuitId] ?? ACTIVE_CIRCUITS[0]

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Corner Performance</h1>
          <p className="text-sm text-gray-400 mt-1">
            Track map with speed, braking, and G-force overlays
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

      {/* Overlay mode chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {OVERLAY_MODES.map(m => (
          <Chip
            key={m.id}
            active={cornerOverlayMode === m.id}
            color={m.color}
            onClick={() => setCornerOverlayMode(m.id)}
          >
            {m.label}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Track map */}
        <div className="lg:col-span-2">
          <Card className="p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-300">
                {circuit.flag} {circuit.circuit}
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex gap-1 items-center">
                  <span className="w-3 h-1 rounded" style={{ background: '#e10600' }} />Slow
                  <span className="w-3 h-1 rounded ml-1" style={{ background: '#f5c518' }} />Med
                  <span className="w-3 h-1 rounded ml-1" style={{ background: '#00c17a' }} />Fast
                </div>
              </div>
            </div>
            <TrackMap
              circuit={circuit}
              hoveredCorner={hoveredCorner}
              onCornerHover={setHoveredCorner}
            />
          </Card>
        </div>

        {/* Corner list + hovered detail */}
        <div className="space-y-4">
          {/* Hovered corner detail */}
          {hoveredCorner != null && (() => {
            const corner = circuit.corners.find(c => c.number === hoveredCorner)
            if (!corner) return null
            return (
              <Card className="p-4 border-f1blue/30">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Turn {corner.number}</h3>
                  <span className="text-gray-400 text-sm">{corner.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-50 dark:bg-darkBg/60 rounded-lg p-3 text-center">
                    <div className="text-gray-400">Min Speed</div>
                    <div className="text-2xl font-black text-f1blue mt-1">{corner.minSpeed}</div>
                    <div className="text-gray-500">km/h</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-darkBg/60 rounded-lg p-3 text-center">
                    <div className="text-gray-400">Braking</div>
                    <div className="text-2xl font-black text-f1red mt-1">{corner.brakingDistance}</div>
                    <div className="text-gray-500">meters</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-darkBg/60 rounded-lg p-3 text-center">
                    <div className="text-gray-400">G-Force</div>
                    <div className="text-2xl font-black text-yellow-400 mt-1">{corner.gForce}</div>
                    <div className="text-gray-500">G</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-darkBg/60 rounded-lg p-3 text-center">
                    <div className="text-gray-400">Type</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white mt-2">{corner.type}</div>
                  </div>
                </div>
              </Card>
            )
          })()}

          {/* Corner list */}
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-3">
              All Corners ({circuit.corners.length})
            </h2>
            {circuit.corners.length > 0 ? (
              <CornerList
                corners={circuit.corners}
                hoveredCorner={hoveredCorner}
                onCornerHover={setHoveredCorner}
                mode={cornerOverlayMode}
              />
            ) : (
              <p className="text-sm text-gray-500">
                Detailed corner data not available for this circuit yet.
              </p>
            )}
          </Card>

          {/* Telemetry notice */}
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-2">Live Telemetry</h2>
            <p className="text-xs text-gray-500">
              Real-time driver telemetry from OpenF1 becomes available after each race weekend.
              Data for the 2026 season will appear here once the season begins.
            </p>
            <div className="mt-3 flex gap-2">
              <Badge variant="gray">OpenF1 API</Badge>
              <Badge variant="blue">2026 Season</Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
