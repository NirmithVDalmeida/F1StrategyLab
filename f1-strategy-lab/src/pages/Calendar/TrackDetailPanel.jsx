import { format, parseISO, isPast, isFuture } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import Badge from '../../components/shared/Badge.jsx'
import { scaleLinear } from 'd3-scale'
import { fetchDriverCircuitHistory } from '../../api/calendar.js'

// Constructor accent colours
const TEAM_COLOR = {
  mercedes: '#27F4D2', ferrari: '#E8002D', red_bull: '#3671C6', mclaren: '#FF8000',
  aston_martin: '#229971', alpine: '#0093CC', williams: '#64C4FF', rb: '#6692FF',
  sauber: '#52E252', haas: '#B6BABD',
}

const speedColor = scaleLinear()
  .domain([50, 175, 300])
  .range(['#e10600', '#f5c518', '#00d2ff'])
  .clamp(true)

const sessionStatus = (dateStr) => {
  if (!dateStr) return 'upcoming'
  try {
    const d = parseISO(dateStr)
    return isPast(d) ? 'complete' : 'upcoming'
  } catch { return 'upcoming' }
}

export default function TrackDetailPanel({ circuit, apiRace, winner }) {
  const { stats, schedule, corners, svgPath } = circuit
  const isCancelled = circuit.cancelled === true

  // Cancelled race detail panel
  if (isCancelled) {
    return (
      <div className="mt-2 rounded-xl border border-red-900/50 bg-lightCard dark:bg-darkCard p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Greyed-out circuit image with X */}
          <div className="relative flex-shrink-0 w-52 h-52 bg-gray-100 dark:bg-darkBg/40 rounded-lg p-3 flex items-center justify-center">
            {circuit.trackImageUrl ? (
              <img
                src={circuit.trackImageUrl}
                alt={circuit.circuit}
                className="w-full h-full object-contain grayscale opacity-30"
                loading="lazy"
              />
            ) : (
              <svg viewBox="0 0 200 200" className="w-full h-full opacity-20">
                <path d={svgPath} stroke="#666" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            )}
            {/* Giant red X */}
            <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
              <line x1="30" y1="30" x2="170" y2="170" stroke="#e10600" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
              <line x1="170" y1="30" x2="30" y2="170" stroke="#e10600" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
            </svg>
          </div>

          {/* Cancellation info */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="text-4xl mb-2">{circuit.flag}</div>
              <h2 className="text-2xl font-bold text-gray-400 line-through">{circuit.name}</h2>
              <p className="text-gray-500 mt-1">{circuit.circuit} — {circuit.location}</p>
            </div>

            <div className="inline-flex items-center gap-3 px-5 py-3 bg-red-950/40 border border-red-900/50 rounded-xl">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <div className="text-red-400 font-bold text-sm">Race Cancelled</div>
                <div className="text-red-400/70 text-xs">{circuit.cancellationReason}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-darkBorder">
              <StatRow label="Circuit length" value={`${circuit.length} km`} />
              <StatRow label="Turns" value={circuit.turns} />
              <StatRow label="Top speed" value={`${stats.topSpeed} km/h`} />
              <StatRow label="Lap Record" value={stats.lapRecord} />
            </div>

            <p className="text-xs text-gray-600 italic mt-2">
              This race was originally scheduled for {format(parseISO(circuit.date), 'dd MMMM yyyy')} but will not take place this season. No replacement race has been announced.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-2 rounded-xl border border-f1red/30 bg-lightCard dark:bg-darkCard p-6 space-y-6">
      <div className="flex flex-wrap gap-6">

        {/* Left: Circuit map */}
        <div className="flex-shrink-0">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Circuit Map
          </h3>
          <div className="w-52 h-52 bg-gray-100 dark:bg-darkBg/40 rounded-lg p-3 flex items-center justify-center">
            {circuit.trackImageUrl ? (
              <img
                src={circuit.trackImageUrl}
                alt={circuit.circuit}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <path d={svgPath} stroke="#e10600" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            )}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span className="w-3 h-1 rounded" style={{ background: '#e10600' }} />Slow
            <span className="w-3 h-1 rounded" style={{ background: '#f5c518' }} />Med
            <span className="w-3 h-1 rounded" style={{ background: '#00d2ff' }} />Fast
          </div>
        </div>

        {/* Middle: Track stats */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Track Stats
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <StatRow label="Circuit length"  value={`${circuit.length} km`} />
            <StatRow label="Race laps"       value={circuit.laps} />
            <StatRow label="Race distance"   value={`${(circuit.length * circuit.laps).toFixed(1)} km`} />
            <StatRow label="Turns"           value={circuit.turns} />
            <StatRow label="DRS zones"       value={circuit.drsZones} />
            <StatRow label="Top speed"       value={`${stats.topSpeed} km/h`} />
            <StatRow label="Avg speed"       value={`${stats.avgSpeed} km/h`} />
            <StatRow label="Downforce"       value={stats.downforceLevel} />
            <StatRow label="Tyre wear"       value={stats.tyreWear} />
            <StatRow label="Overtaking"      value={stats.overtakingDifficulty} />
          </div>
          <div className="mt-3 p-3 bg-gray-100 dark:bg-darkBg/60 rounded-lg border border-gray-200 dark:border-darkBorder">
            <div className="text-xs text-gray-500">Lap Record</div>
            <div className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{stats.lapRecord}</div>
            <div className="text-xs text-gray-400">{stats.lapRecordHolder} · {stats.lapRecordYear}</div>
          </div>
        </div>

        {/* Right: Weekend schedule */}
        <div className="flex-shrink-0 w-52">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Weekend Schedule
          </h3>
          <div className="space-y-2">
            {schedule.map((s, i) => {
              const status = sessionStatus(circuit.date)
              return (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'complete' ? 'bg-green-400' : 'bg-gray-600'}`} />
                    <span className="text-gray-300 font-medium">{s.session}</span>
                  </div>
                  <div className="text-gray-500 text-right">
                    <div>{s.day}</div>
                    <div>{s.time}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Race winner + winner's history at this circuit */}
      {winner && <WinnerSection winner={winner} circuitId={circuit.jolpicaId} />}

      {/* Corner breakdown */}
      {corners.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Key Corners
          </h3>
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr className="text-gray-500 border-b border-gray-200 dark:border-darkBorder">
                  <th className="text-left pb-2 pr-4">#</th>
                  <th className="text-left pb-2 pr-4">Name</th>
                  <th className="text-left pb-2 pr-4">Type</th>
                  <th className="text-right pb-2 pr-4">Min Speed</th>
                  <th className="text-right pb-2 pr-4">Braking</th>
                  <th className="text-right pb-2">G-Force</th>
                </tr>
              </thead>
              <tbody>
                {corners.map(c => (
                  <tr key={c.number} className="border-b border-gray-200 dark:border-darkBorder/50 hover:bg-gray-100 dark:hover:bg-white/5">
                    <td className="py-1.5 pr-4 font-mono text-gray-400">{c.number}</td>
                    <td className="py-1.5 pr-4 text-gray-900 dark:text-white">{c.name}</td>
                    <td className="py-1.5 pr-4">
                      <Badge variant={
                        c.type === 'High Speed' ? 'blue' :
                        c.type === 'Braking' ? 'red' :
                        c.type === 'Chicane' ? 'orange' : 'gray'
                      }>{c.type}</Badge>
                    </td>
                    <td className="py-1.5 pr-4 text-right font-mono" style={{ color: speedColor(c.minSpeed) }}>
                      {c.minSpeed} km/h
                    </td>
                    <td className="py-1.5 pr-4 text-right text-gray-400 font-mono">{c.brakingDistance}m</td>
                    <td className="py-1.5 text-right text-gray-400 font-mono">{c.gForce}G</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <div>
      <div className="text-gray-500 text-xs">{label}</div>
      <div className="text-gray-900 dark:text-white font-semibold">{value}</div>
    </div>
  )
}

function WinnerSection({ winner, circuitId }) {
  const teamColor = TEAM_COLOR[winner.constructorId] || '#888'

  const { data: history } = useQuery({
    queryKey: ['circuitHistory', circuitId, winner.driverId],
    queryFn: () => fetchDriverCircuitHistory(circuitId, winner.driverId),
    enabled: !!circuitId && !!winner.driverId,
  })

  return (
    <div className="pt-4 border-t border-gray-200 dark:border-darkBorder">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
        Race Winner
      </h3>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        {/* Winner identity */}
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-12 rounded-sm flex-shrink-0" style={{ background: teamColor }} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {winner.givenName} {winner.familyName}
              </span>
              {winner.driverCode && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-200 dark:bg-darkBg text-gray-500">
                  {winner.driverCode}
                </span>
              )}
            </div>
            <div className="text-sm mt-0.5 font-semibold" style={{ color: teamColor }}>
              {winner.constructorName}
            </div>
          </div>
        </div>

        {/* Race detail */}
        <div className="flex gap-6 text-sm">
          {winner.grid != null && <StatRow label="Started" value={`P${winner.grid}`} />}
          {winner.time && <StatRow label="Race time" value={winner.time} />}
          {winner.fastestLap && <StatRow label="Fastest lap" value={winner.fastestLap} />}
          {winner.points != null && <StatRow label="Points" value={winner.points} />}
        </div>
      </div>

      {/* Winner's all-time record at this circuit */}
      <div className="mt-4">
        <div className="text-xs text-gray-500 mb-2">
          {winner.familyName}&apos;s record at this circuit
        </div>
        {history ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <HistoryStat label="Starts"      value={history.starts} />
            <HistoryStat label="Wins"        value={history.wins}    accent="#f5c518" />
            <HistoryStat label="Podiums"     value={history.podiums} accent="#cd7f32" />
            <HistoryStat label="Best finish" value={history.bestFinish != null ? `P${history.bestFinish}` : '—'} />
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">Loading career record…</div>
        )}
      </div>
    </div>
  )
}

function HistoryStat({ label, value, accent }) {
  return (
    <div className="rounded-lg bg-gray-100 dark:bg-darkBg/60 border border-gray-200 dark:border-darkBorder px-3 py-2">
      <div className="text-gray-500 text-xs">{label}</div>
      <div className="text-xl font-bold mt-0.5" style={{ color: accent || undefined }}>
        {value}
      </div>
    </div>
  )
}
