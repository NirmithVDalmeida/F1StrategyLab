import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import { useAppStore } from './store/useAppStore.js'
import CalendarPage  from './pages/Calendar/CalendarPage.jsx'
import StrategyPage  from './pages/Strategy/StrategyPage.jsx'
import CornersPage   from './pages/Corners/CornersPage.jsx'
import ComparePage   from './pages/Compare/ComparePage.jsx'
import BuilderPage   from './pages/Builder/BuilderPage.jsx'

function Layout() {
  const fetchSavedConfigs = useAppStore(s => s.fetchSavedConfigs)
  const fetchStrategies   = useAppStore(s => s.fetchStrategies)

  // Hydrate from MongoDB on first mount (falls back to localStorage silently)
  useEffect(() => {
    fetchSavedConfigs()
    fetchStrategies()
  }, [fetchSavedConfigs, fetchStrategies])

  return (
    <div className="min-h-screen bg-lightBg dark:bg-darkBg text-gray-900 dark:text-gray-100">
      <Nav />
      <main className="pt-14">
        <Outlet />
      </main>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,        element: <CalendarPage /> },
      { path: 'strategy',  element: <StrategyPage /> },
      { path: 'corners',   element: <CornersPage /> },
      { path: 'compare',   element: <ComparePage /> },
      { path: 'builder',   element: <BuilderPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
