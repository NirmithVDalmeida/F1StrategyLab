import clsx from 'clsx'

export default function Card({ children, className, onClick, hover = false }) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-lightCard dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-xl',
        hover && 'cursor-pointer hover:border-f1blue/50 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
