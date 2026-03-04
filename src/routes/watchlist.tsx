import { useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuth } from '@/contexts/use-auth'
import { useWatchlistStore } from '@/stores/use-watchlist-store'
import { fetchMovieGenres } from '@/api/tmdb'
import { Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'

type SortKey = 'title' | 'genre' | 'rating'
type SortOrder = 'asc' | 'desc'

function genreLabel(genreIds: number[], genreMap: Map<number, string>): string {
  if (genreIds.length === 0) return '—'
  return (
    genreIds
      .map(id => genreMap.get(id))
      .filter(Boolean)
      .join(', ') || '—'
  )
}

export interface WatchlistItem {
  id: number
  title: string
  release_date: string
  vote_average: number
  genre_ids: number[]
}

export function WatchlistPage() {
  const [sortKey, setSortKey] = useState<SortKey>('title')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const navigate = useNavigate()
  const { logout } = useAuth()
  const { items, remove } = useWatchlistStore()

  const { data: genres = [] } = useQuery({
    queryKey: ['movie-genres'],
    queryFn: fetchMovieGenres
  })

  const genreMap = useMemo(
    () => new Map(genres.map(g => [g.id, g.name])),
    [genres]
  )

  const sortedItems = useMemo(() => {
    const list = [...items]
    list.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'title') {
        cmp = (a.title ?? '').localeCompare(b.title ?? '', 'pt-BR')
      } else if (sortKey === 'genre') {
        const ga = genreLabel(a.genre_ids, genreMap)
        const gb = genreLabel(b.genre_ids, genreMap)
        cmp = ga.localeCompare(gb, 'pt-BR')
      } else {
        cmp = a.vote_average - b.vote_average
      }
      return sortOrder === 'asc' ? cmp : -cmp
    })
    return list
  }, [items, sortKey, sortOrder, genreMap])

  const cycleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  function renderSortIcon(column: SortKey) {
    if (sortKey !== column)
      return <ArrowUpDown className="ml-1 size-3.5 opacity-50" />
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-1 size-3.5" />
    ) : (
      <ArrowDown className="ml-1 size-3.5" />
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="text-xl font-semibold">CineDash</h1>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/home">Filmes</Link>
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

      <main className="flex-1 p-4">
        <section>
          <h2 className="mb-4 text-lg font-semibold">Minha Lista</h2>

          {sortedItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center text-muted-foreground">
              <p className="font-medium">Nenhum filme na lista</p>
              <p className="mt-1 text-sm">
                Adicione filmes pela página de filmes ou pela página de
                detalhes.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link to="/home">Ver filmes</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 font-semibold">
                      <button
                        type="button"
                        className="flex items-center hover:text-foreground"
                        onClick={() => cycleSort('title')}
                      >
                        Título
                        {renderSortIcon('title')}
                      </button>
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      <button
                        type="button"
                        className="flex items-center hover:text-foreground"
                        onClick={() => cycleSort('genre')}
                      >
                        Gênero
                        {renderSortIcon('genre')}
                      </button>
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Data de Lançamento
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      <button
                        type="button"
                        className="flex items-center hover:text-foreground"
                        onClick={() => cycleSort('rating')}
                      >
                        Rating
                        {renderSortIcon('rating')}
                      </button>
                    </th>
                    <th className="px-4 py-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.map((item: WatchlistItem) => (
                    <tr
                      key={item.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to="/movie/$id"
                          params={{ id: String(item.id) }}
                          className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {item.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {genreLabel(item.genre_ids, genreMap)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.release_date
                          ? item.release_date.slice(0, 4)
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">
                          {item.vote_average.toFixed(1)}
                        </span>{' '}
                        ★
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            remove(item.id)
                            toast.success('Removido da lista', {
                              description: item.title
                            })
                          }}
                          aria-label={`Remover ${item.title} da lista`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
