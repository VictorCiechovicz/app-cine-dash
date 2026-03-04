import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { MovieFilters, TmdbGenre } from '@/api/tmdb'
import { YEARS, RATING_OPTIONS } from '../../utils/movie-filters-constants'

function hasActiveFilters(filters: MovieFilters): boolean {
  return !!(filters.genreId || filters.year || filters.minRating)
}

export interface MovieFiltersPanelProps {
  filters: MovieFilters
  onFilterChange: <K extends keyof MovieFilters>(
    key: K,
    value: MovieFilters[K]
  ) => void
  onClearFilters: () => void
  genres: TmdbGenre[]
  debounceMs?: number
}

export function MovieFiltersPanel({
  filters,
  onFilterChange,
  onClearFilters,
  genres,
  debounceMs = 400
}: MovieFiltersPanelProps) {
  const active = hasActiveFilters(filters)

  return (
    <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Filtros</span>
        {active && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
          >
            Limpar
          </Button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="filter-genre">Gênero</Label>
          <select
            id="filter-genre"
            value={filters.genreId}
            onChange={e => onFilterChange('genreId', e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Todos</option>
            {genres.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-year">Ano</Label>
          <select
            id="filter-year"
            value={filters.year}
            onChange={e => onFilterChange('year', e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Qualquer</option>
            {YEARS.map(y => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-rating">Nota mínima</Label>
          <select
            id="filter-rating"
            value={filters.minRating}
            onChange={e => onFilterChange('minRating', e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {RATING_OPTIONS.map(opt => (
              <option key={opt.value || 'any'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {active && (
        <p className="mt-2 text-xs text-muted-foreground">
          Resultados atualizados com debounce de {debounceMs}ms
        </p>
      )}
    </div>
  )
}
