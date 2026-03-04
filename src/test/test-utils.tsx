import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactElement, ReactNode } from 'react'

/**
 * Creates a fresh QueryClient for tests (no cache sharing between tests).
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      }
    }
  })
}

interface WrapperProps {
  children: ReactNode
  client?: QueryClient
}

/**
 * Wraps children with QueryClientProvider for RTL tests that use TanStack Query.
 */
export function QueryWrapper({ children, client }: WrapperProps): ReactElement {
  const queryClient = client ?? createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
