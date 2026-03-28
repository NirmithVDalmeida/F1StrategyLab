import { useAppStore } from '../../store/useAppStore.js'
import { CIRCUIT_BASE_TIMES, getSectorSplits } from '../../data/baseLapTimes.js'
import ProgressBar from '../../components/shared/ProgressBar.jsx'
import Badge from '../../components/shared/Badge.jsx'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toFixed(3).padStart(6, '0')
  return `${m}:${s}`
}

function computeSim(carConfig, circuitId) {
  const base = CIRCUIT_BASE_TIMES[circuitId] ?? 90
  const { frontWing, rearWing, floorRideHeight, iceOutput, ersRate, batteryCapacity, frontSuspension, weightDist } = carConfig

  const aeroGain    = (frontWing - 50) * 0.008 + (rearWing - 50) * 0.006
  const floorGain   = (50 - floorRideHeight) * 0.012
  const powerGain   = (iceOutput - 50) * 0.010
  const ersGain     = (ersRate - 50) * 0.007
  const battGain    = (batteryCapacity - 50) * 0.003
  const susGain     = Math.abs(frontSuspension - 50) * 0.002  // 50 is optimal; deviation hurts
  const weightGain  = Math.abs(weightDist - 50) * 0.004

  const simTime = base - aeroGain - floorGain - powerGain - ersGain - battGain + susGain + weightGain
  const delta   = simTime - base

  return { base, simTime, delta, aeroGain, floorGain, powerGain, ersGain }
}

// Regulation compliance checks — extreme slider values = edge/fail
function regulationStatus(carConfig) {
  const { frontWing, rearWing, floorRideHeight } = carConfig
  const checks = [
    {
      label: 'Front Wing Angle',
      pass: frontWing <= 85,
      edge: frontWing > 70 && frontWing <= 85,
    },
    {
      label: 'Rear Wing Height',
      pass: rearWing <= 90,
      edge: rearWing > 75 && rearWing <= 90,
    },
    {
      label: 'Ride Height Minimum',
      pass: floorRideHeight >= 15,
      edge: floorRideHeight >= 15 && floorRideHeight < 25,
    },
  ]
  return checks
}

// Score 0–100: how close to theoretical max performance
function overallScore(carConfig) {
  const { frontWing, rearWing, floorRideHeight, iceOutput, ersRate } = carConfig
  const scores = [
    (frontWing) / 100,
    (rearWing) / 100,
    (100 - floorRideHeight) / 100,
    (iceOutput) / 100,
    (ersRate) / 100,
  ]
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100)
}

const PERF_METERS = [
  { label: 'Downforce',    key: d => Math.round((d.frontWing * 0.5 + d.rearWing * 0.5)),   color: '#00d2ff' },
  { label: 'Top Speed',    key: d => Math.round(100 - (d.frontWing * 0.3 + d.rearWing * 0.4)),  color: '#f5c518' },
  { label: 'Power',        key: d => Math.round((d.iceOutput * 0.6 + d.ersRate * 0.4)),    color: '#e10600' },
  { label: 'Mechanical G', key: d => Math.round(100 - Math.abs(d.frontSuspension - 50) * 1.5), color: '#39b54a' },
  { label: 'Efficiency',   key: d => Math.round((d.batteryCapacity * 0.5 + (100 - d.floorRideHeight) * 0.5)), color: '#a78bfa' },
]

export default function SimResults({ circuitId }) {
  const { carConfig } = useAppStore()
  const { base, simTime, delta, aeroGain, floorGain, powerGain, ersGain } = computeSim(carConfig, circuitId)
  const regulations = regulationStatus(carConfig)
  const score = overallScore(carConfig)

  const [r1, r2, r3] = getSectorSplits(circuitId)
  const s1 = simTime * r1
  const s2 = simTime * r2
  const s3 = simTime * r3

  return (
    <div className="space-y-4">

      {/* Lap time */}
      <div className="bg-gray-100 dark:bg-darkBg/60 rounded-xl p-4 text-center">
        <div className="text-xs text-gray-500 mb-1">Simulated Lap Time</div>
        <div className="text-4xl font-black text-gray-900 dark:text-white font-mono tracking-tight">
          {formatTime(simTime)}
        </div>
        <div className={`text-sm font-mono mt-1 ${delta <= 0 ? 'text-green-400' : 'text-f1red'}`}>
          {delta <= 0 ? '' : '+'}{delta.toFixed(3)}s vs baseline
        </div>
      </div>

      {/* Sector splits */}
      <div className="grid grid-cols-3 gap-2">
        {[['S1', s1], ['S2', s2], ['S3', s3]].map(([label, t]) => (
          <div key={label} className="bg-gray-100 dark:bg-darkBg/60 rounded-lg p-2.5 text-center">
            <div className="text-[10px] text-gray-500">{label}</div>
            <div className="text-sm font-mono font-bold text-gray-900 dark:text-white mt-0.5">{t.toFixed(3)}s</div>
          </div>
        ))}
      </div>

      {/* Gain breakdown */}
      <div>
        <div className="text-xs font-semibold text-gray-400 mb-2">Gain Breakdown</div>
        <div className="space-y-1.5 text-xs">
          {[
            { label: 'Aero Package',  val: aeroGain,  color: '#00d2ff' },
            { label: 'Floor / Ground Effect', val: floorGain, color: '#39b54a' },
            { label: 'ICE Output',    val: powerGain, color: '#e10600' },
            { label: 'ERS Deploy',    val: ersGain,   color: '#f5c518' },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-gray-400">{label}</span>
              </div>
              <span className={`font-mono ${val >= 0 ? 'text-green-400' : 'text-f1red'}`}>
                {val >= 0 ? '-' : '+'}{Math.abs(val).toFixed(3)}s
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance meters */}
      <div>
        <div className="text-xs font-semibold text-gray-400 mb-2">Performance Profile</div>
        <div className="space-y-2">
          {PERF_METERS.map(m => {
            const val = Math.min(100, Math.max(0, m.key(carConfig)))
            return (
              <div key={m.label}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-400">{m.label}</span>
                  <span className="text-gray-900 dark:text-white font-mono">{val}</span>
                </div>
                <ProgressBar value={val} max={100} color={m.color} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Overall score */}
      <div className="bg-gray-100 dark:bg-darkBg/60 rounded-xl p-3 flex items-center gap-3">
        <div className="text-center flex-shrink-0">
          <div className="text-3xl font-black text-gray-900 dark:text-white">{score}</div>
          <div className="text-[10px] text-gray-500">/ 100</div>
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Overall Rating</div>
          <ProgressBar
            value={score}
            max={100}
            color={score >= 75 ? '#39b54a' : score >= 50 ? '#f5c518' : '#e10600'}
          />
        </div>
      </div>

      {/* Regulation checks */}
      <div>
        <div className="text-xs font-semibold text-gray-400 mb-2">FIA Regulation Check</div>
        <div className="space-y-1.5">
          {regulations.map(reg => (
            <div key={reg.label} className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{reg.label}</span>
              <Badge variant={!reg.pass ? 'red' : reg.edge ? 'yellow' : 'green'}>
                {!reg.pass ? 'Fail' : reg.edge ? 'Edge' : 'Pass'}
              </Badge>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
