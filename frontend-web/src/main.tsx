import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './index.css'
import { LoginPage } from './pages/LoginPage'
import { MaestrosPage } from './pages/MaestrosPage'
import { RolPage } from './pages/RolPage'
import { ProtectedRoute } from './components/ProtectedRoute'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
})

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/maestros',
    element: (
      <ProtectedRoute>
        <MaestrosPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/rol',
    element: (
      <ProtectedRoute>
        <RolPage />
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <Navigate to="/maestros" replace /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
