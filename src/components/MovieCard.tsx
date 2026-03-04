import { Link } from '@tanstack/react-router'
import { getPosterUrl, type TmdbMovie } from '@/api/tmdb'
import { useWatchlistStore } from '@/stores/use-watchlist-store'
import { Button } from '@/components/ui/button'
import { ListPlus, Check } from 'lucide-react'
import { toast } from 'sonner'

export function MovieCard({ movie }: { movie: TmdbMovie }) {
  const posterUrl = getPosterUrl(movie.poster_path, 'w500')
  const { has, addFromMovie, remove } = useWatchlistStore()
  const inList = has(movie.id)

  const handleListClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inList) {
      remove(movie.id)
      toast.success('Removido da lista', {
        description: movie.title
      })
    } else {
      addFromMovie(movie)
      toast.success('Adicionado à lista', {
        description: movie.title
      })
    }
  }

  return (
    <Link
      to="/movie/$id"
      params={{ id: String(movie.id) }}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
      data-testid="movie-card"
    >
      <div className="relative aspect-[2/3] w-full bg-muted">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute right-2 top-2 z-10 size-8 rounded-full shadow-md"
          onClick={handleListClick}
          aria-label={inList ? 'Remover da lista' : 'Adicionar à lista'}
          title={inList ? 'Remover da lista' : 'Adicionar à lista'}
        >
          {inList ? (
            <Check className="size-4 text-primary" />
          ) : (
            <ListPlus className="size-4" />
          )}
        </Button>
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
    </Link>
  )
}
