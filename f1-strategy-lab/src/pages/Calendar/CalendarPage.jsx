import { useQuery } from '@tanstack/react-query'
import { fetchRaceCalendar } from '../../api/calendar.js'
import { CIRCUITS_2026 } from '../../data/circuits2026.js'
import { useAppStore } from '../../store/useAppStore.js'
import TrackCard from './TrackCard.jsx'
import TrackDetailPanel from './TrackDetailPanel.jsx'
import Spinner from '../../components/shared/Spinner.jsx'

export default function CalendarPage() {
  const calendarExpandedId = useAppStore(s => s.calendarExpandedId)

  const { data: apiRaces, isLoading } = useQuery({
    queryKey: ['calendar', 2026],
    queryFn: () => fetchRaceCalendar(2026),
  })

  // Build a map from circuitId → api race data
  const apiRaceMap = {}
  if (apiRaces) {
    for (const race of apiRaces) {
      apiRaceMap[race.circuitId] = race
    }
  }

  const expandedCircuit = CIRCUITS_2026.find(c => c.id === calendarExpandedId)
  const activeRaces = CIRCUITS_2026.filter(c => !c.cancelled)
  const cancelledRaces = CIRCUITS_2026.filter(c => c.cancelled)

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">2026 Race Calendar</h1>
          <p className="text-sm text-gray-400 mt-1">
            {activeRaces.length} rounds{cancelledRaces.length > 0 && (
              <span className="text-red-500/70"> · {cancelledRaces.length} cancelled</span>
            )} · Click a card to expand track details
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Spinner size="sm" /> Loading live data…
          </div>
        )}
      </div>

      {/* Expanded detail panel */}
      {expandedCircuit && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{expandedCircuit.flag}</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{expandedCircuit.name}</h2>
            <span className="text-sm text-gray-400">· {expandedCircuit.circuit}</span>
          </div>
          <TrackDetailPanel
            circuit={expandedCircuit}
            apiRace={apiRaceMap[expandedCircuit.jolpicaId]}
          />
        </div>
      )}

      {/* Calendar grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {CIRCUITS_2026.map(circuit => (
          <TrackCard
            key={circuit.id}
            circuit={circuit}
            apiRace={apiRaceMap[circuit.jolpicaId]}
          />
        ))}
      </div>
    </div>
  )
}
