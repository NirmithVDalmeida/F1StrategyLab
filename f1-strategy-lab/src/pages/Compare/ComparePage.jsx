import { useAppStore } from '../../store/useAppStore.js'
import { TEAMS_2026, TEAM_MAP, TEAM_SPECS } from '../../data/circuits2026.js'
import Card from '../../components/shared/Card.jsx'
import SpecTable from './SpecTable.jsx'
import RadarChart from './RadarChart.jsx'

export default function ComparePage() {
  const { compareTeams, setCompareTeam } = useAppStore()
  const [id1, id2] = compareTeams

  const team1 = TEAM_MAP[id1] ?? TEAMS_2026[0]
  const team2 = TEAM_MAP[id2] ?? TEAMS_2026[1]
  const specs1 = TEAM_SPECS[id1]
  const specs2 = TEAM_SPECS[id2]

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Car Comparison</h1>
        <p className="text-sm text-gray-400 mt-1">Compare team specs, performance metrics, and radar profiles</p>
      </div>

      {/* Team selectors */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[{ id: id1, slot: 0, team: team1 }, { id: id2, slot: 1, team: team2 }].map(({ id, slot, team }) => (
          <Card key={slot} className="p-4">
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
              Car {slot + 1}
            </label>
            <select
              value={id}
              onChange={e => setCompareTeam(slot, e.target.value)}
              className="w-full bg-white dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm
                         focus:outline-none focus:border-f1blue"
            >
              {TEAMS_2026.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {/* Team color swatch + drivers */}
            <div className="mt-3 flex items-center gap-2">
              <div className="w-3 h-8 rounded-sm" style={{ backgroundColor: team.color }} />
              <div>
                {team.drivers.map((d, i) => (
                  <div key={i} className="text-xs text-gray-300">{d}</div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar chart */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Performance Profile</h2>
          <RadarChart specs1={specs1} specs2={specs2} team1={team1} team2={team2} />
        </Card>

        {/* Spec table */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Specification Comparison</h2>
          <SpecTable
            team1={team1} specs1={specs1}
            team2={team2} specs2={specs2}
          />
          <p className="text-xs text-gray-600 mt-4">
            * Ratings are estimated based on 2025 performance data and known 2026 developments.
            Green = stronger value.
          </p>
        </Card>
      </div>

      {/* All teams overview */}
      <Card className="mt-6 p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">All Teams — Quick Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {TEAMS_2026.map(team => {
            const specs = TEAM_SPECS[team.id]
            const overall = specs
              ? Math.round((specs.topSpeed + specs.downforce + specs.racePace + specs.reliability + specs.qualPace) / 5)
              : 0
            const isSelected = team.id === id1 || team.id === id2
            return (
              <button
                key={team.id}
                onClick={() => setCompareTeam(team.id === id1 ? 0 : 1, team.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected ? 'border-opacity-100' : 'border-gray-200 dark:border-darkBorder hover:border-gray-600'
                }`}
                style={isSelected ? { borderColor: team.color } : {}}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                  <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{team.name}</span>
                </div>
                <div className="text-2xl font-black" style={{ color: team.color }}>{overall}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Overall rating</div>
              </button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
