import { NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.jsx'

const TABS = [
  { to: '/',         label: 'Calendar',  icon: '🗓' },
  { to: '/strategy', label: 'Strategy',  icon: '⚡' },
  { to: '/corners',  label: 'Corners',   icon: '📐' },
  { to: '/compare',  label: 'Compare',   icon: '⚖️' },
  { to: '/builder',  label: 'Builder',   icon: '🔧' },
]

export default function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-14 bg-lightCard dark:bg-darkCard border-b border-gray-200 dark:border-darkBorder
                    flex items-center justify-between px-4 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 rounded-sm bg-f1red flex items-center justify-center">
          <span className="text-white text-xs font-black tracking-tight">F1</span>
        </div>
        <span className="text-gray-900 dark:text-white font-bold text-sm tracking-wider uppercase hidden sm:block">
          Strategy Lab
        </span>
        <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-f1red/20 text-f1red
                         rounded border border-f1red/30 hidden md:inline-block">
          2026
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {TABS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
               transition-colors whitespace-nowrap
               ${isActive
                 ? 'bg-f1red text-white'
                 : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/5'
               }`
            }
          >
            <span className="hidden sm:inline">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        <ThemeToggle />
      </div>
    </nav>
  )
}
