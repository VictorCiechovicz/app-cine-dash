import { getPosterUrl, type TmdbMovie } from '@/api/tmdb'

export function MovieCard({ movie }: { movie: TmdbMovie }) {
  const posterUrl = getPosterUrl(movie.poster_path, 'w500')

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
      data-testid="movie-card"
    >
      <div className="aspect-[2/3] w-full bg-muted">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
            Sem imagem
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3
          className="font-medium leading-tight line-clamp-2"
          title={movie.title}
        >
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {movie.release_date ? movie.release_date.slice(0, 4) : '—'}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-foreground font-medium">
              {movie.vote_average.toFixed(1)}
            </span>
            ★
          </span>
        </div>
      </div>
    </article>
  )
}
