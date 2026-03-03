import { createRootRoute } from '@tanstack/react-router'

function RootLayout() {
  return (
    <main>
      <h1>CineDash</h1>
    </main>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
