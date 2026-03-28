import ProgressBar from '../../components/shared/ProgressBar.jsx'
import clsx from 'clsx'

const SPEC_ROWS = [
  { key: 'topSpeed',    label: 'Top Speed',     unit: '%' },
  { key: 'downforce',   label: 'Downforce',     unit: '%' },
  { key: 'tyreLife',    label: 'Tyre Life',     unit: '%' },
  { key: 'racePace',    label: 'Race Pace',     unit: '%' },
  { key: 'reliability', label: 'Reliability',   unit: '%' },
  { key: 'qualPace',    label: 'Qualifying Pace',unit: '%' },
]

export default function SpecTable({ team1, specs1, team2, specs2 }) {
  if (!specs1 || !specs2) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Metric</th>
            <th className="py-2 text-right pr-3 w-16">
              <span className="text-xs font-bold" style={{ color: team1.color }}>{team1.name}</span>
            </th>
            <th className="py-2 w-40" />
            <th className="py-2 text-left pl-3 w-16">
              <span className="text-xs font-bold" style={{ color: team2.color }}>{team2.name}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {SPEC_ROWS.map(({ key, label }) => {
            const v1 = specs1[key] ?? 0
            const v2 = specs2[key] ?? 0
            const winner = v1 > v2 ? 1 : v2 > v1 ? 2 : 0
            return (
              <tr key={key} className="border-t border-gray-200 dark:border-darkBorder">
                <td className="py-2.5 text-gray-400 text-xs font-medium">{label}</td>
                {/* Team 1 */}
                <td className="py-2.5 text-right pr-3">
                  <span className={clsx('text-sm font-bold', winner === 1 ? 'text-green-400' : 'text-gray-300')}>
                    {v1}
                  </span>
                </td>
                {/* Dual bar */}
                <td className="py-2.5">
                  <div className="flex items-center gap-1">
                    {/* Left bar (team1, right-aligned) */}
                    <div className="flex-1 flex justify-end">
                      <div className="w-full max-w-[80px] flex justify-end">
                        <div
                          className="h-2 rounded-l-full"
                          style={{ width: `${v1}%`, backgroundColor: team1.color, opacity: 0.8 }}
                        />
                      </div>
                    </div>
                    <div className="w-px h-3 bg-gray-200 dark:bg-darkBorder" />
                    {/* Right bar (team2) */}
                    <div className="flex-1">
                      <div className="w-full max-w-[80px]">
                        <div
                          className="h-2 rounded-r-full"
                          style={{ width: `${v2}%`, backgroundColor: team2.color, opacity: 0.8 }}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                {/* Team 2 */}
                <td className="py-2.5 pl-3">
                  <span className={clsx('text-sm font-bold', winner === 2 ? 'text-green-400' : 'text-gray-300')}>
                    {v2}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
