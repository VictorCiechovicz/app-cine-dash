const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export interface TmdbMovie {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  vote_average: number
  overview: string
}

export interface TmdbPaginatedResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

export function getPosterUrl(
  path: string | null,
  size: 'w200' | 'w300' | 'w500' = 'w500'
): string | null {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export async function fetchTrendingMovies(
  page: number
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  const res = await fetch(
    `${TMDB_BASE}/trending/movie/day?api_key=${API_KEY}&language=pt-BR&page=${page}`
  )
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
  return res.json()
}

export async function fetchPopularMovies(
  page: number
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  const res = await fetch(
    `${TMDB_BASE}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=${page}`
  )
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
  return res.json()
}
