import { Outlet, createRootRoute } from '@tanstack/react-router'
import { ThemeSync } from '@/components/ThemeToggle'

function RootLayout() {
  return (
    <main className="min-h-svh">
      <ThemeSync />
      <Outlet />
    </main>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
