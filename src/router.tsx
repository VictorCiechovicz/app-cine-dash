import { createRoute, createRouter, redirect } from '@tanstack/react-router'
import { getToken } from '@/lib/auth-storage'
import { Route as rootRoute } from './routes/__root'
import { BuscaPage } from './routes/busca'
import { CriarContaPage } from './routes/criar-conta'
import { EstantePage } from './routes/estante'
import { LoginPage } from './routes/login'

function requireAuth() {
  if (!getToken()) {
    throw redirect({ to: '/' })
  }
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage
})

const criarContaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/criar-conta',
  component: CriarContaPage
})

const buscaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/busca',
  component: BuscaPage,
  beforeLoad: requireAuth
})

const estanteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/estante',
  component: EstantePage,
  beforeLoad: requireAuth
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  criarContaRoute,
  buscaRoute,
  estanteRoute
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
