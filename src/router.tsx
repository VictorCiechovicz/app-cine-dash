import { createRoute, createRouter, redirect } from '@tanstack/react-router'
import { getToken } from '@/lib/auth-storage'
import { Route as rootRoute } from './routes/__root'
import { RegisterPage } from './routes/register'
import { HomePage } from './routes/home'
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

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: HomePage,
  beforeLoad: requireAuth
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  homeRoute
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
