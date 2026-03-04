import { useRef, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuth } from '@/contexts/use-auth'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { discoverMovies } from '@/api/tmdb'
import { MovieCard } from '@/components/MovieCard'
import { MovieFiltersPanel } from '@/components/MovieFiltersPanel'
import { useDashboardStore } from '@/stores/use-dashboard-store'
import { toast } from 'sonner'

const DEBOUNCE_MS = 400
const SCROLL_SAVE_THROTTLE_MS = 200

export function HomePage() {
  const { filters, setFilters } = useDashboardStore()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const scrollSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  const debouncedFilters = useDebouncedValue(filters, DEBOUNCE_MS)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error
  } = useInfiniteQuery({
    queryKey: ['movies', 'discover', debouncedFilters],
    queryFn: ({ pageParam }) => discoverMovies(debouncedFilters, pageParam),
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      if (lastPage.page >= lastPage.total_pages) return undefined
      return lastPage.page + 1
    }
  })

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) fetchNextPage()
      },
      { rootMargin: '200px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    if (isError && error) {
      toast.error('Erro ao carregar filmes', {
        description: error.message
      })
    }
  }, [isError, error])

  useEffect(() => {
    const saveScroll = () => {
      useDashboardStore.getState().setScrollY(window.scrollY)
    }
    const onScroll = () => {
      if (scrollSaveTimeoutRef.current) return
      scrollSaveTimeoutRef.current = setTimeout(() => {
        saveScroll()
        scrollSaveTimeoutRef.current = null
      }, SCROLL_SAVE_THROTTLE_MS)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (scrollSaveTimeoutRef.current)
        clearTimeout(scrollSaveTimeoutRef.current)
    }
  }, [])

  const movies = data?.pages.flatMap(p => p.results) ?? []

  const hasRestoredScroll = useRef(false)
  useEffect(() => {
    if (hasRestoredScroll.current || isPending || movies.length === 0) return
    hasRestoredScroll.current = true
    const saved = useDashboardStore.getState().scrollY
    if (saved > 0) {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo(0, Math.min(saved, maxScroll))
    }
  }, [isPending, movies.length])

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3">
        <h1 className="text-xl font-semibold">CineDash</h1>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/watchlist">Minha Lista</Link>
          </Button>
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout()
              navigate({ to: '/' })
            }}
          >
            Sair
          </Button>
        </nav>
      </header>

      <main ref={mainRef} className="flex-1 p-4">
        <section className="mb-6">
          <h2 className="mb-4 text-lg font-semibold">Filmes</h2>
          <MovieFiltersPanel filters={filters} setFilters={setFilters} />

          {isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <p className="font-medium">Erro ao carregar filmes</p>
              <p className="mt-1 text-sm">{error?.message}</p>
            </div>
          )}

          {isPending && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-lg bg-muted"
                  aria-hidden
                />
              ))}
            </div>
          )}

          {!isPending && !isError && movies.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
              <div ref={sentinelRef} className="h-8 w-full" aria-hidden />
              {isFetchingNextPage && (
                <div className="flex justify-center py-6">
                  <span className="text-sm text-muted-foreground">
                    Carregando mais…
                  </span>
                </div>
              )}
            </>
          )}

          {!isPending && !isError && movies.length === 0 && (
            <p className="text-muted-foreground">
              Nenhum filme encontrado. Tente outros filtros.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
