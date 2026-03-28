import { format, parseISO, isPast } from 'date-fns'
import { useAppStore } from '../../store/useAppStore.js'
import clsx from 'clsx'

export default function TrackCard({ circuit, apiRace }) {
  const { calendarExpandedId, setCalendarExpandedId } = useAppStore()
  const isExpanded = calendarExpandedId === circuit.id
  const isCancelled = circuit.cancelled === true

  const raceDate = parseISO(circuit.date)
  const isComplete = !isCancelled && isPast(raceDate)
  const formattedDate = format(raceDate, 'dd MMM yyyy')

  return (
    <div
      onClick={() => setCalendarExpandedId(circuit.id)}
      className={clsx(
        'relative flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200',
        'bg-lightCard dark:bg-darkCard hover:bg-gray-50 dark:hover:bg-darkCard/80',
        isCancelled
          ? 'border-red-300 dark:border-red-900/60 hover:border-red-700/60'
          : isExpanded
            ? 'border-f1red shadow-lg shadow-f1red/10'
            : 'border-gray-200 dark:border-darkBorder hover:border-f1blue/40',
        isCancelled && 'opacity-60 hover:opacity-80'
      )}
    >
      {/* Giant X overlay for cancelled races */}
      {isCancelled && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full opacity-20">
            <line x1="15" y1="15" x2="85" y2="85" stroke="#e10600" strokeWidth="6" strokeLinecap="round" />
            <line x1="85" y1="15" x2="15" y2="85" stroke="#e10600" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Round badge */}
      <div className="flex items-center justify-between relative z-20">
        {isCancelled ? (
          <span className="text-xs font-bold text-red-500/80 uppercase tracking-widest">
            Cancelled
          </span>
        ) : (
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Round {circuit.round}
          </span>
        )}
        {isCancelled && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-800/50 font-semibold">
            ✕ Cancelled
          </span>
        )}
        {!isCancelled && isComplete && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/40 text-green-400 border border-green-800/50 font-semibold">
            ✓ Done
          </span>
        )}
        {!isCancelled && !isComplete && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-f1blue/10 text-f1blue border border-f1blue/20 font-semibold">
            Upcoming
          </span>
        )}
      </div>

      {/* Circuit layout image */}
      <div className="flex justify-center py-1 relative z-20">
        {circuit.trackImageUrl ? (
          <img
            src={circuit.trackImageUrl}
            alt={circuit.circuit}
            className={clsx('w-28 h-28 object-contain', isCancelled && 'grayscale')}
            loading="lazy"
          />
        ) : (
          <svg
            viewBox="0 0 200 200"
            className="w-28 h-28 opacity-80"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={circuit.svgPath} stroke={isCancelled ? '#666' : '#e10600'} strokeWidth="4" fill="none" />
          </svg>
        )}
      </div>

      {/* Flag + Name */}
      <div className="text-center relative z-20">
        <div className="text-2xl mb-1">{circuit.flag}</div>
        <div className={clsx(
          'text-sm font-bold leading-tight',
          isCancelled ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'
        )}>
          {circuit.name.replace(' Grand Prix', '')}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">GP</div>
      </div>

      {/* Location + Date */}
      <div className="text-center mt-auto relative z-20">
        <div className="text-xs text-gray-400">{circuit.location}</div>
        <div className={clsx(
          'text-xs mt-0.5',
          isCancelled ? 'text-red-500/60 line-through' : 'text-gray-500'
        )}>
          {formattedDate}
        </div>
      </div>

      {/* Expand indicator */}
      <div className={clsx(
        'absolute bottom-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-colors z-20',
        isExpanded ? 'bg-f1red' : 'bg-gray-300 dark:bg-darkBorder'
      )}>
        <svg className={clsx('w-3 h-3 text-gray-700 dark:text-white transition-transform', isExpanded && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
