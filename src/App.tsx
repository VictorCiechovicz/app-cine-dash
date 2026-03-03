import { QueryProvider } from './providers'
import { AuthProvider } from './contexts/auth'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'

export function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryProvider>
  )
}
