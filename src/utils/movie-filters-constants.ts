import type { MovieFilters } from '@/api/tmdb'

export const defaultFilters: MovieFilters = {
  genreId: '',
  year: '',
  minRating: ''
}

const currentYear = new Date().getFullYear()
export const YEARS = Array.from(
  { length: currentYear - 1969 },
  (_, i) => currentYear - i
)

export const RATING_OPTIONS = [
  { value: '', label: 'Qualquer' },
  ...Array.from({ length: 11 }, (_, i) => ({
    value: String(i),
    label: `${i}+`
  }))
]
