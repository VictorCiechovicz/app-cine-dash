import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { fetchMovieDetails, getPosterUrl, type TmdbVideo } from '@/api/tmdb'
import { Button } from '@/components/ui/button'
import { useWatchlistStore } from '@/stores/use-watchlist-store'
import { ListPlus, Check } from 'lucide-react'

function getTrailerUrl(video: TmdbVideo): string | null {
  if (video.site !== 'YouTube' || !video.key) return null
  return `https://www.youtube.com/embed/${video.key}?autoplay=0`
}

function pickTrailer(videos: TmdbVideo[]): TmdbVideo | null {
  const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer')
  return trailer ?? videos.find(v => v.site === 'YouTube') ?? null
}

export function MovieDetailPage() {
  const params = useParams({ strict: false })
  const id = params?.id
  const movieId = id != null ? Number(id) : NaN
  const { has, addFromDetails, remove } = useWatchlistStore()

  const {
    data: movie,
    isPending,
    isError,
    error
  } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => fetchMovieDetails(movieId),
    enabled: Number.isFinite(movieId)
  })

  if (isError) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
        <p className="text-destructive">
          {error?.message ?? 'Erro ao carregar filme.'}
        </p>
        <Button asChild variant="outline">
          <Link to="/home">Voltar à lista</Link>
        </Button>
      </div>
    )
  }

  if (isPending || !movie) {
    return (
      <div className="flex min-h-svh flex-col p-4">
        <div className="aspect-[2/3] w-full max-w-sm animate-pulse rounded-lg bg-muted" />
        <div className="mt-4 h-8 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-full animate-pulse rounded bg-muted" />
      </div>
    )
  }

  const cast = movie.credits?.cast ?? []
  const trailer = movie.videos?.results
    ? pickTrailer(movie.videos.results)
    : null
  const trailerUrl = trailer ? getTrailerUrl(trailer) : null
  const posterUrl = getPosterUrl(movie.poster_path, 'w500')

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/home">← Voltar</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/watchlist">Minha Lista</Link>
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 md:grid-cols-[300px_1fr]">
            <div className="aspect-[2/3] w-full max-w-[300px] overflow-hidden rounded-lg border border-border bg-muted">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
                  Sem imagem
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {movie.title}
                </h1>
                <Button
                  type="button"
                  variant={movie && has(movie.id) ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() =>
                    has(movie.id) ? remove(movie.id) : addFromDetails(movie)
                  }
                  className="shrink-0"
                >
                  {movie && has(movie.id) ? (
                    <>
                      <Check className="mr-1.5 size-4" />
                      Na lista
                    </>
                  ) : (
                    <>
                      <ListPlus className="mr-1.5 size-4" />
                      Adicionar à lista
                    </>
                  )}
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {movie.release_date && (
                  <span>{movie.release_date.slice(0, 4)}</span>
                )}
                {movie.runtime != null && <span>{movie.runtime} min</span>}
                <span className="flex items-center gap-1">
                  <span className="text-foreground font-medium">
                    {movie.vote_average.toFixed(1)}
                  </span>
                  ★
                </span>
                {movie.genres?.length > 0 && (
                  <span>{movie.genres.map(g => g.name).join(', ')}</span>
                )}
              </div>

              {movie.overview && (
                <section>
                  <h2 className="mb-2 text-lg font-semibold">Sinopse</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {movie.overview}
                  </p>
                </section>
              )}

              {trailerUrl && (
                <section>
                  <h2 className="mb-2 text-lg font-semibold">Trailer</h2>
                  <div className="aspect-video w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-muted">
                    <iframe
                      src={trailerUrl}
                      title={trailer?.name ?? 'Trailer'}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </section>
              )}

              {cast.length > 0 && (
                <section>
                  <h2 className="mb-2 text-lg font-semibold">Elenco</h2>
                  <ul className="flex flex-wrap gap-2">
                    {cast.slice(0, 15).map(member => (
                      <li
                        key={`${member.id}-${member.character}`}
                        className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-foreground">
                          {member.name}
                        </span>
                        {member.character && (
                          <span className="text-muted-foreground">
                            {' '}
                            · {member.character}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {cast.length > 15 && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      + {cast.length - 15} no elenco
                    </p>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
