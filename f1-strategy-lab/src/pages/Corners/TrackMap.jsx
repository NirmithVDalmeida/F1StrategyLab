import { scaleLinear } from 'd3-scale'
import { interpolateRdYlGn } from 'd3-scale-chromatic'
import { useAppStore } from '../../store/useAppStore.js'

const speedScale = scaleLinear().domain([50, 300]).range([0, 1]).clamp(true)
const gScale     = scaleLinear().domain([2.0, 6.0]).range([0, 1]).clamp(true)
const brakScale  = scaleLinear().domain([5, 155]).range([1, 0]).clamp(true) // longer braking = "hotter"

function cornerMetricValue(corner, mode) {
  switch (mode) {
    case 'speed':   return speedScale(corner.minSpeed)
    case 'gforce':  return gScale(corner.gForce)
    case 'braking': return brakScale(corner.brakingDistance)
    case 'traction': return speedScale(corner.minSpeed) * 0.7 + (1 - brakScale(corner.brakingDistance)) * 0.3
    default:        return 0.5
  }
}

export default function TrackMap({ circuit, onCornerHover, hoveredCorner }) {
  const cornerOverlayMode = useAppStore(s => s.cornerOverlayMode)
  const isDark = useAppStore(s => s.isDark)

  // If we have a real track image, show it with a corner legend strip below
  if (circuit.trackImageUrl) {
    return (
      <div className="flex flex-col items-center gap-4">
        {/* Track layout image */}
        <div className="relative w-full flex justify-center" style={{ maxHeight: 340 }}>
          <img
            src={circuit.trackImageUrl}
            alt={circuit.circuit}
            className="h-full max-h-[340px] object-contain"
            style={{ opacity: 0.9 }}
            loading="lazy"
          />
        </div>
        {/* Corner chips strip — hoverable, synced with corner list */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {circuit.corners.map(corner => {
            const val   = cornerMetricValue(corner, cornerOverlayMode)
            const color = interpolateRdYlGn(val)
            const isHov = hoveredCorner === corner.number
            return (
              <button
                key={corner.number}
                onMouseEnter={() => onCornerHover?.(corner.number)}
                onMouseLeave={() => onCornerHover?.(null)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all"
                style={{
                  background: isHov ? color : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  color: isHov ? (val > 0.55 ? '#1a1a1a' : '#fff') : isDark ? '#ccc' : '#555',
                  border: `1px solid ${isHov ? color : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  transform: isHov ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ background: color, color: val > 0.55 ? '#1a1a1a' : '#fff' }}
                >
                  {corner.number}
                </span>
                <span className="font-medium">{corner.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Fallback: old SVG path with corner markers
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full"
      style={{ maxHeight: 380 }}
    >
      <path d={circuit.svgPath} stroke={isDark ? '#333' : '#d1d5db'} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={circuit.svgPath} stroke={isDark ? '#555' : '#9ca3af'} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={circuit.svgPath} stroke={isDark ? '#888' : '#6b7280'} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" opacity="0.4" />
      {circuit.corners.map(corner => {
        const val    = cornerMetricValue(corner, cornerOverlayMode)
        const color  = interpolateRdYlGn(val)
        const isHov  = hoveredCorner === corner.number
        return (
          <g
            key={corner.number}
            onMouseEnter={() => onCornerHover?.(corner.number)}
            onMouseLeave={() => onCornerHover?.(null)}
            style={{ cursor: 'pointer' }}
          >
            {isHov && (
              <circle cx={corner.svgX} cy={corner.svgY} r="12" fill={color} opacity="0.25" />
            )}
            <circle
              cx={corner.svgX}
              cy={corner.svgY}
              r={isHov ? 7.5 : 6}
              fill={color}
              stroke={isHov ? (isDark ? 'white' : '#1f2937') : 'rgba(0,0,0,0.5)'}
              strokeWidth={isHov ? 1.5 : 1}
            />
            <text
              x={corner.svgX}
              y={corner.svgY + 3.5}
              textAnchor="middle"
              fill={isHov ? (isDark ? '#fff' : '#1f2937') : isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'}
              fontSize={isHov ? 5.5 : 5}
              fontWeight="bold"
            >
              {corner.number}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
