import clsx from 'clsx'

export const COMPOUNDS = {
  Soft:         { color: '#e10600', label: 'S', bg: '#e10600' },
  Medium:       { color: '#f5c518', label: 'M', bg: '#f5c518' },
  Hard:         { color: '#e8e8e8', label: 'H', bg: '#e8e8e8' },
  Intermediate: { color: '#39b54a', label: 'I', bg: '#39b54a' },
  Wet:          { color: '#0067ff', label: 'W', bg: '#0067ff' },
}

export function TyreCircle({ compound, size = 'md', selected, onClick }) {
  const c = COMPOUNDS[compound] ?? COMPOUNDS.Medium
  const sizes = {
    sm: 'w-7 h-7 text-xs border-2',
    md: 'w-10 h-10 text-sm border-2',
    lg: 'w-14 h-14 text-base border-[3px]',
  }
  return (
    <button
      onClick={onClick}
      className={clsx(
        'rounded-full flex items-center justify-center font-black transition-all',
        sizes[size],
        selected ? 'ring-2 ring-gray-900 dark:ring-white ring-offset-1 ring-offset-gray-100 dark:ring-offset-darkBg scale-110' : 'opacity-80 hover:opacity-100 hover:scale-105'
      )}
      style={{ backgroundColor: c.bg, borderColor: 'rgba(0,0,0,0.3)', color: compound === 'Hard' ? '#1a1a1a' : 'white' }}
      title={compound}
    >
      {c.label}
    </button>
  )
}

export default function TyreSelector({ selected, onChange }) {
  return (
    <div className="flex items-center gap-3">
      {Object.keys(COMPOUNDS).map(compound => (
        <div key={compound} className="flex flex-col items-center gap-1">
          <TyreCircle
            compound={compound}
            size="md"
            selected={selected?.includes(compound)}
            onClick={() => {
              if (!onChange) return
              if (selected?.includes(compound)) {
                onChange(selected.filter(c => c !== compound))
              } else {
                onChange([...(selected ?? []), compound])
              }
            }}
          />
          <span className="text-[10px] text-gray-500">{compound}</span>
        </div>
      ))}
    </div>
  )
}
