import clsx from 'clsx'

export default function Chip({ children, active, color, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-3 py-1 text-xs font-semibold rounded-full border transition-all',
        active
          ? 'text-white border-transparent'
          : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-300 dark:border-darkBorder hover:border-gray-500 hover:text-gray-800 dark:hover:text-gray-200',
        className
      )}
      style={active && color ? { backgroundColor: color, borderColor: color } : {}}
    >
      {children}
    </button>
  )
}
