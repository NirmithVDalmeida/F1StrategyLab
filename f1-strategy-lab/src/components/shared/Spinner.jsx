import clsx from 'clsx'

export default function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={clsx('inline-block animate-spin rounded-full border-2 border-t-transparent border-f1red', sizes[size], className)} />
  )
}
