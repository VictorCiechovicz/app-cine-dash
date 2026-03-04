import { useRef, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/use-auth'
import { fetchTrendingMovies } from '@/api/tmdb'
import { MovieCard } from '@/components/home/MovieCard'

export function HomePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error
  } = useInfiniteQuery({
    queryKey: ['movies', 'trending'],
    queryFn: ({ pageParam }) => fetchTrendingMovies(pageParam),
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

  const movies = data?.pages.flatMap(p => p.results) ?? []

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="text-xl font-semibold">CineDash</h1>
        <nav className="flex items-center gap-2">
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

      <main className="flex-1 p-4">
        <section className="mb-6">
          <h2 className="mb-4 text-lg font-semibold">Em alta (Trending)</h2>

          {isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <p className="font-medium">Erro ao carregar filmes</p>
              <p className="text-sm mt-1">{error?.message}</p>
              <p className="text-sm mt-2 text-muted-foreground">
                Configure{' '}
                <code className="rounded bg-muted px-1">VITE_TMDB_API_KEY</code>{' '}
                no arquivo <code className="rounded bg-muted px-1">.env</code>.
                Obtenha uma chave em{' '}
                <a
                  href="https://www.themoviedb.org/settings/api"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  themoviedb.org
                </a>
                .
              </p>
            </div>
          )}

          {isPending && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] animate-pulse rounded-lg bg-muted"
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
            <p className="text-muted-foreground">Nenhum filme encontrado.</p>
          )}
        </section>
      </main>
    </div>
  )
}
