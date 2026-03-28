import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

// Apply saved theme before React hydrates (prevents flash)
const savedTheme = localStorage.getItem('f1-theme') ?? 'dark'
document.documentElement.classList.toggle('dark', savedTheme === 'dark')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:           5 * 60 * 1000,  // 5 minutes
      gcTime:             10 * 60 * 1000,  // 10 minutes
      retry:               2,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
