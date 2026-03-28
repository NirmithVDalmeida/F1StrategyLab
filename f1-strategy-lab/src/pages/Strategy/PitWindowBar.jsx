// Visual pit window analysis bar
// Shows: Too Early | Undercut | Optimal | Overcut | Too Late

export default function PitWindowBar({ totalLaps = 57, pitLap, pitWindow = 5 }) {
  const optimal = pitLap ?? Math.round(totalLaps * 0.45)
  const undercut = Math.max(1, optimal - pitWindow)
  const overcut  = Math.min(totalLaps - 1, optimal + pitWindow)

  const zones = [
    { label: 'Too Early', start: 1,       end: undercut - 1, color: '#374151', textColor: '#6b7280' },
    { label: 'Undercut',  start: undercut, end: optimal - 1,  color: '#1d4ed8', textColor: '#93c5fd' },
    { label: 'Optimal',   start: optimal,  end: optimal,      color: '#e10600', textColor: '#fca5a5' },
    { label: 'Overcut',   start: optimal + 1, end: overcut,   color: '#7c3aed', textColor: '#c4b5fd' },
    { label: 'Too Late',  start: overcut + 1, end: totalLaps, color: '#374151', textColor: '#6b7280' },
  ].filter(z => z.start <= z.end)

  return (
    <div>
      {/* Bar */}
      <div className="flex h-8 rounded-lg overflow-hidden">
        {zones.map(zone => {
          const width = ((zone.end - zone.start + 1) / totalLaps) * 100
          return (
            <div
              key={zone.label}
              className="flex items-center justify-center text-[10px] font-semibold transition-all"
              style={{
                width: `${width}%`,
                backgroundColor: zone.color,
                color: zone.textColor,
                minWidth: zone.label === 'Optimal' ? '28px' : undefined,
              }}
            >
              {width > 8 ? zone.label : zone.label === 'Optimal' ? '⚑' : ''}
            </div>
          )
        })}
      </div>

      {/* Lap numbers axis */}
      <div className="flex justify-between mt-1 px-0.5">
        <span className="text-[10px] text-gray-500">Lap 1</span>
        <span className="text-[10px] text-gray-500">Lap {Math.round(totalLaps / 2)}</span>
        <span className="text-[10px] text-gray-500">Lap {totalLaps}</span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2">
        {zones.map(z => (
          <div key={z.label} className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: z.color }} />
            <span className="text-gray-400">{z.label}</span>
            <span className="text-gray-600 font-mono">L{z.start}–{z.end}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
