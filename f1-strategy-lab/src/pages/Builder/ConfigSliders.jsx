import { useAppStore } from '../../store/useAppStore.js'

const SLIDER_SECTIONS = [
  {
    title: 'Aerodynamics',
    color: '#00d2ff',
    sliders: [
      { key: 'frontWing',       label: 'Front Wing',       min: 0, max: 100, unit: '%', hint: 'Downforce / drag trade-off' },
      { key: 'rearWing',        label: 'Rear Wing',        min: 0, max: 100, unit: '%', hint: 'Straight-line speed vs stability' },
      { key: 'floorRideHeight', label: 'Floor Ride Height',min: 0, max: 100, unit: 'mm', hint: 'Ground effect strength' },
    ],
  },
  {
    title: 'Power Unit',
    color: '#e10600',
    sliders: [
      { key: 'iceOutput',       label: 'ICE Output',       min: 0, max: 100, unit: '%', hint: 'Internal combustion engine mapping' },
      { key: 'ersRate',         label: 'ERS Deploy Rate',  min: 0, max: 100, unit: '%', hint: 'Electrical energy deployment rate' },
      { key: 'batteryCapacity', label: 'Battery SOC',      min: 0, max: 100, unit: '%', hint: 'State of charge strategy' },
    ],
  },
  {
    title: 'Chassis',
    color: '#39b54a',
    sliders: [
      { key: 'frontSuspension', label: 'Front Suspension', min: 0, max: 100, unit: '%', hint: 'Stiffness (0=soft, 100=stiff)' },
      { key: 'weightDist',      label: 'Weight Distribution', min: 40, max: 60, unit: '%F', hint: 'Front axle weight share' },
    ],
  },
]

function SliderRow({ sliderDef, value, onChange }) {
  const pct = ((value - sliderDef.min) / (sliderDef.max - sliderDef.min)) * 100

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-xs font-semibold text-gray-900 dark:text-white">{sliderDef.label}</span>
          <span className="text-[10px] text-gray-500 ml-2">{sliderDef.hint}</span>
        </div>
        <span className="text-xs font-mono text-gray-900 dark:text-white tabular-nums w-14 text-right">
          {value}<span className="text-gray-500 ml-0.5">{sliderDef.unit}</span>
        </span>
      </div>
      <div className="relative h-1.5 rounded-full bg-gray-300 dark:bg-darkBorder">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: 'currentColor' }}
        />
        <input
          type="range"
          min={sliderDef.min}
          max={sliderDef.max}
          value={value}
          onChange={e => onChange(sliderDef.key, Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg pointer-events-none transition-all"
          style={{ left: `calc(${pct}% - 6px)`, background: 'currentColor' }}
        />
      </div>
    </div>
  )
}

export default function ConfigSliders() {
  const { carConfig, setCarConfigValue, resetCarConfig } = useAppStore()

  return (
    <div className="space-y-5">
      {SLIDER_SECTIONS.map(section => (
        <div key={section.title} style={{ color: section.color }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ background: section.color }} />
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: section.color }}>
              {section.title}
            </h3>
          </div>
          <div className="pl-4 border-l border-darkBorder" style={{ borderColor: section.color + '33' }}>
            {section.sliders.map(sl => (
              <SliderRow
                key={sl.key}
                sliderDef={sl}
                value={carConfig[sl.key] ?? 50}
                onChange={setCarConfigValue}
              />
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={resetCarConfig}
        className="w-full mt-2 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white border border-dashed border-gray-200 dark:border-darkBorder hover:border-gray-500 rounded-lg py-1.5 transition-colors"
      >
        Reset to Defaults
      </button>
    </div>
  )
}
