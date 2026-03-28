// AeroViz — Top-down F1 car image with animated flow lines, pressure, and config effects
// Car image: /f1-car-top.png (nose points RIGHT)
// ViewBox: 0 0 600 300 — car fills most of the view

import { useMemo } from 'react'
import { useAppStore } from '../../store/useAppStore.js'

// Streamlines flowing right-to-left (air flows from nose toward rear)
const FLOW_LINES = [
  // Far field — top (green, slow)
  { d: 'M 600,15  C 480,14  300,12  -10,8',    delay: 0.0, color: '#22c55e', dur: 3.2 },
  { d: 'M 600,42  C 480,40  300,38  -10,34',   delay: 0.2, color: '#22c55e', dur: 3.2 },
  // Wing level — top (cyan/blue)
  { d: 'M 595,65  C 470,63  300,62  -10,58',   delay: 0.1, color: '#06b6d4', dur: 2.6 },
  { d: 'M 590,85  C 460,83  300,82  -10,79',   delay: 0.3, color: '#3b82f6', dur: 2.4 },
  // Floor tunnel — centre (deep blue, fastest)
  { d: 'M 580,108 C 440,107 300,107 -10,106',  delay: 0.0, color: '#1d4ed8', dur: 1.6 },
  { d: 'M 580,150 C 440,150 300,150 -10,150',  delay: 0.1, color: '#1d4ed8', dur: 1.5 },
  { d: 'M 580,192 C 440,193 300,193 -10,194',  delay: 0.2, color: '#1d4ed8', dur: 1.6 },
  // Wing level — bottom (cyan/blue)
  { d: 'M 590,215 C 460,217 300,218 -10,221',  delay: 0.3, color: '#3b82f6', dur: 2.4 },
  { d: 'M 595,235 C 470,237 300,238 -10,242',  delay: 0.1, color: '#06b6d4', dur: 2.6 },
  // Far field — bottom (green, slow)
  { d: 'M 600,258 C 480,260 300,262 -10,266',  delay: 0.2, color: '#22c55e', dur: 3.2 },
  { d: 'M 600,285 C 480,287 300,290 -10,294',  delay: 0.0, color: '#22c55e', dur: 3.2 },
  // Wake — diverging behind car (yellow/red)
  { d: 'M 42,108  C 25,96   10,78   -10,60',   delay: 0.4, color: '#f59e0b', dur: 2.0 },
  { d: 'M 42,150  C 25,150  10,150  -10,150',  delay: 0.2, color: '#ef4444', dur: 2.0 },
  { d: 'M 42,192  C 25,204  10,222  -10,240',  delay: 0.4, color: '#f59e0b', dur: 2.0 },
]

export default function AeroViz({ showFlow = true, showPressure = true, showLabels = true }) {
  const { carConfig } = useAppStore()
  const isDark = useAppStore(s => s.isDark)
  const {
    frontWing = 50, rearWing = 50, floorRideHeight = 50,
    iceOutput = 50, ersRate = 50, batteryCapacity = 50,
    frontSuspension = 50, weightDist = 50,
  } = carConfig

  // ── Derived visual parameters ──────────────────────────────
  const floorAnimDur = useMemo(() => {
    // Lower ride height = faster floor flow (more ground effect)
    return 2.5 - (50 - floorRideHeight) / 50 * 1.2  // 1.3–2.5s
  }, [floorRideHeight])

  const frontWingScale = 0.5 + (frontWing / 100) * 1.2
  const rearWingScale  = 0.5 + (rearWing  / 100) * 1.2

  // Power unit → exhaust heat intensity
  const exhaustIntensity = (iceOutput / 100) * 0.8 + 0.1
  const exhaustSize = 8 + (iceOutput / 100) * 18

  // ERS → energy glow
  const ersGlow = (ersRate / 100) * 0.7 + 0.1
  const ersColor = ersRate > 70 ? '#00ff88' : ersRate > 40 ? '#00d2ff' : '#3b82f6'

  // Battery → sidepod heat
  const batteryHeat = (batteryCapacity / 100) * 0.5

  // Suspension stiffness → ride height visual (subtle car body offset)
  const suspOffset = (frontSuspension - 50) * 0.03

  // Weight distribution → front/rear balance indicator
  const weightBias = (weightDist - 50) / 10 // -1 to +1

  return (
    <svg
      viewBox="0 0 600 300"
      className="w-full h-auto"
      style={{ maxHeight: 360, background: 'transparent' }}
    >
      <defs>
        <radialGradient id="hiPressure" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ff4444" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ff4444" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="loPressure" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#0ea5e9" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="turbulence" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#f59e0b" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="exhaustHeat" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#ff6b00" stopOpacity={exhaustIntensity} />
          <stop offset="100%" stopColor="#ff6b00" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ersEnergy" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={ersColor} stopOpacity={ersGlow} />
          <stop offset="100%" stopColor={ersColor} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="batteryGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#a78bfa" stopOpacity={batteryHeat} />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── 1. FLOW LINES (behind everything) ──────────────── */}
      {showFlow && FLOW_LINES.map((line, i) => {
        const isFloor = line.color === '#1d4ed8'
        const dur = isFloor ? floorAnimDur : line.dur
        return (
          <path
            key={i}
            className="flow-line"
            d={line.d}
            stroke={line.color}
            strokeWidth={isFloor ? 1.8 : 1.2}
            fill="none"
            opacity={isFloor ? 0.7 : 0.5}
            style={{
              animationDuration: `${dur}s`,
              animationDelay: `${line.delay}s`,
            }}
          />
        )
      })}

      {/* ── 2. AERO PRESSURE BLOBS ─────────────────────────── */}
      {showPressure && (
        <>
          {/* High pressure: nose stagnation */}
          <ellipse className="pressure-blob" cx="530" cy="150"
            rx={22 * frontWingScale} ry={14 * frontWingScale} fill="url(#hiPressure)" />
          {/* High pressure: front wing edges */}
          <ellipse className="pressure-blob" cx="498" cy="82"
            rx={18 * frontWingScale} ry={8} fill="url(#hiPressure)" style={{ animationDelay: '0.4s' }} />
          <ellipse className="pressure-blob" cx="498" cy="218"
            rx={18 * frontWingScale} ry={8} fill="url(#hiPressure)" style={{ animationDelay: '0.6s' }} />
          {/* Low pressure: front wing suction */}
          <ellipse className="pressure-blob" cx="470" cy="100"
            rx={24} ry={7} fill="url(#loPressure)" style={{ animationDelay: '0.2s' }} />
          <ellipse className="pressure-blob" cx="470" cy="200"
            rx={24} ry={7} fill="url(#loPressure)" style={{ animationDelay: '0.8s' }} />
          {/* Low pressure: floor tunnel (Venturi) */}
          <ellipse className="pressure-blob" cx="280" cy="150"
            rx={120} ry={18} fill="url(#loPressure)" style={{ animationDelay: '0.1s' }} />
          {/* High pressure: rear wing */}
          <ellipse className="pressure-blob" cx="90" cy="150"
            rx={18 * rearWingScale} ry={26 * rearWingScale} fill="url(#hiPressure)" style={{ animationDelay: '0.3s' }} />
          {/* Turbulent wake */}
          <ellipse className="pressure-blob" cx="30" cy="150"
            rx={32} ry={26} fill="url(#turbulence)" style={{ animationDelay: '0.5s' }} />

          {/* ── POWER UNIT: Exhaust heat plume ── */}
          <ellipse className="pressure-blob" cx="55" cy="130"
            rx={exhaustSize} ry={exhaustSize * 0.6} fill="url(#exhaustHeat)" style={{ animationDelay: '0.1s' }} />
          <ellipse className="pressure-blob" cx="55" cy="170"
            rx={exhaustSize} ry={exhaustSize * 0.6} fill="url(#exhaustHeat)" style={{ animationDelay: '0.3s' }} />

          {/* ── ERS: Energy glow around PU area ── */}
          <ellipse className="pressure-blob" cx="220" cy="150"
            rx={30 + ersRate * 0.3} ry={18 + ersRate * 0.15} fill="url(#ersEnergy)" style={{ animationDelay: '0.2s' }} />

          {/* ── Battery: Sidepod thermal glow ── */}
          <ellipse className="pressure-blob" cx="300" cy="95"
            rx={25 + batteryCapacity * 0.15} ry={12} fill="url(#batteryGlow)" style={{ animationDelay: '0.4s' }} />
          <ellipse className="pressure-blob" cx="300" cy="205"
            rx={25 + batteryCapacity * 0.15} ry={12} fill="url(#batteryGlow)" style={{ animationDelay: '0.6s' }} />
        </>
      )}

      {/* ── 3. CAR IMAGE (flipped so nose points right, blended to remove light bg) ── */}
      <g transform="translate(600, 0) scale(-1, 1)">
        <image
          href="/f1-car-top.png"
          x="20"
          y="15"
          width="560"
          height="270"
          preserveAspectRatio="xMidYMid meet"
          style={{ mixBlendMode: isDark ? 'screen' : 'multiply' }}
        />
      </g>

      {/* ── 4. WEIGHT DISTRIBUTION INDICATOR ───────────────── */}
      {showLabels && (
        <>
          {/* Front bias dot */}
          <circle cx={300 + weightBias * 80} cy="272" r="3" fill="#f5c518" opacity="0.8" />
          <line x1="240" y1="272" x2="360" y2="272" stroke="#333" strokeWidth="1" />
          <text x="240" y="282" fontSize="5" fill="#666" textAnchor="middle">R</text>
          <text x="360" y="282" fontSize="5" fill="#666" textAnchor="middle">F</text>
          <text x="300" y="292" fontSize="6" fill="#9ca3af" textAnchor="middle" fontFamily="monospace">
            Weight: {weightDist}% F
          </text>
        </>
      )}

      {/* ── 5. LABELS ──────────────────────────────────────── */}
      {showLabels && (
        <g className="pointer-events-none" fontSize="7.5" fontFamily="monospace" fill="#9ca3af">
          <text x="500" y="22" textAnchor="middle">Front Wing ({frontWing}%)</text>
          <text x="95"  y="22" textAnchor="middle">Rear Wing ({rearWing}%)</text>
          <text x="300" y="22" textAnchor="middle">Cockpit</text>
          <text x="220" y="22" textAnchor="middle" fill={ersColor}>ERS ({ersRate}%)</text>
          <text x="55"  y="120" textAnchor="middle" fill="#ff6b00" fontSize="6">
            Exhaust ({iceOutput}%)
          </text>
          <text x="300" y="82"  textAnchor="middle" fill="#a78bfa" fontSize="6">
            Battery ({batteryCapacity}%)
          </text>
          {/* Suspension stiffness indicator */}
          <text x="550" y="292" textAnchor="end" fontSize="6" fill="#666">
            Susp: {frontSuspension}% · Ride Ht: {floorRideHeight}mm
          </text>
        </g>
      )}
    </svg>
  )
}
