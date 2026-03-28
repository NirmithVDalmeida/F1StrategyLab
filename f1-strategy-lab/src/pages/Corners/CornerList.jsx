import { scaleLinear } from 'd3-scale'
import { interpolateRdYlGn } from 'd3-scale-chromatic'
import Badge from '../../components/shared/Badge.jsx'
import clsx from 'clsx'

const speedScale = scaleLinear().domain([50, 300]).range([0, 1]).clamp(true)

export default function CornerList({ corners, hoveredCorner, onCornerHover, mode }) {
  return (
    <div className="space-y-1 overflow-y-auto max-h-[400px] pr-1">
      {corners.map(corner => {
        const isHov = hoveredCorner === corner.number
        const val   = speedScale(corner.minSpeed)
        const color = interpolateRdYlGn(val)

        return (
          <div
            key={corner.number}
            onMouseEnter={() => onCornerHover?.(corner.number)}
            onMouseLeave={() => onCornerHover?.(null)}
            className={clsx(
              'flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors text-xs',
              isHov ? 'bg-gray-100 dark:bg-white/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'
            )}
          >
            {/* Corner number badge */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0"
              style={{ backgroundColor: color, color: val > 0.55 ? '#1a1a1a' : '#fff' }}
            >
              {corner.number}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-gray-900 dark:text-white">{corner.name}</span>
                <Badge variant={
                  corner.type === 'High Speed' ? 'blue' :
                  corner.type === 'Braking' ? 'red' :
                  corner.type === 'Chicane' ? 'orange' : 'gray'
                }>
                  {corner.type}
                </Badge>
              </div>
              <div className="flex gap-3 mt-1 text-gray-400">
                <span>Min: <span className="text-gray-900 dark:text-white font-mono">{corner.minSpeed}km/h</span></span>
                <span>Brake: <span className="text-gray-900 dark:text-white font-mono">{corner.brakingDistance}m</span></span>
                <span>G: <span className="text-gray-900 dark:text-white font-mono">{corner.gForce}G</span></span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
