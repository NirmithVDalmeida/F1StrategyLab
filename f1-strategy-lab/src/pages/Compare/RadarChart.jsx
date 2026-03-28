import {
  RadarChart as RechartsRadar,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useAppStore } from '../../store/useAppStore.js'

export default function RadarChart({ specs1, specs2, team1, team2 }) {
  const isDark = useAppStore(s => s.isDark)

  if (!specs1 || !specs2) return null

  const data = [
    { axis: 'Top Speed',  car1: specs1.topSpeed,    car2: specs2.topSpeed    },
    { axis: 'Downforce',  car1: specs1.downforce,   car2: specs2.downforce   },
    { axis: 'Tyre Life',  car1: specs1.tyreLife,    car2: specs2.tyreLife    },
    { axis: 'Race Pace',  car1: specs1.racePace,    car2: specs2.racePace    },
    { axis: 'Reliability',car1: specs1.reliability, car2: specs2.reliability },
    { axis: 'Qual Pace',  car1: specs1.qualPace,    car2: specs2.qualPace    },
  ]

  const gridColor   = isDark ? '#2a2a2e' : '#e5e7eb'
  const labelColor  = isDark ? '#9ca3af' : '#374151'

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RechartsRadar data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: labelColor, fontSize: 11, fontWeight: 500 }}
        />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name={team1.name}
          dataKey="car1"
          stroke={team1.color}
          fill={team1.color}
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Radar
          name={team2.name}
          dataKey="car2"
          stroke={team2.color}
          fill={team2.color}
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value, entry) => (
            <span style={{ color: entry.color, fontSize: 12 }}>{value}</span>
          )}
        />
      </RechartsRadar>
    </ResponsiveContainer>
  )
}
