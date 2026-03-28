import clsx from 'clsx'

const variants = {
  red:    'bg-f1red/15 text-f1red border-f1red/30',
  blue:   'bg-f1blue/15 text-f1blue border-f1blue/30',
  green:  'bg-green-500/15 text-green-400 border-green-500/30',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  gray:   'bg-gray-500/15 text-gray-400 border-gray-500/30',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
}

export default function Badge({ children, variant = 'gray', className }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded border',
      variants[variant] ?? variants.gray,
      className
    )}>
      {children}
    </span>
  )
}
