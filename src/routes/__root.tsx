import { Outlet, createRootRoute } from '@tanstack/react-router'

function RootLayout() {
  return (
    <main className="min-h-svh">
      <Outlet />
    </main>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
