import { Outlet, createRootRoute } from '@tanstack/react-router'
import { ThemeSync } from '@/components/ThemeToggle'
import { Toaster } from '@/components/ui/sonner'

function RootLayout() {
  return (
    <main className="min-h-svh">
      <ThemeSync />
      <Outlet />
      <Toaster />
    </main>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
