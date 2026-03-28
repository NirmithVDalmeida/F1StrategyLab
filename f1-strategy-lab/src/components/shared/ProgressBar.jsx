import clsx from 'clsx'

export default function ProgressBar({ value, max = 100, color = '#e10600', className, showLabel = false }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={clsx('relative h-2 bg-gray-800 rounded-full overflow-hidden', className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
      {showLabel && (
        <span className="absolute right-0 -top-5 text-xs text-gray-400">{Math.round(pct)}%</span>
      )}
    </div>
  )
}
