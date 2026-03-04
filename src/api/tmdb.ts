const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export interface TmdbMovie {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  vote_average: number
  overview: string
  genre_ids?: number[]
}

export interface TmdbPaginatedResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface TmdbGenre {
  id: number
  name: string
}

export interface MovieFilters {
  genreId: string
  year: string
  minRating: string
}

export interface TmdbCastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
}

export interface TmdbVideo {
  key: string
  site: string
  type: string
  name: string
}

export interface TmdbMovieDetails extends TmdbMovie {
  overview: string
  runtime: number | null
  genres: TmdbGenre[]
}

export interface TmdbMovieDetailsResponse extends TmdbMovieDetails {
  credits?: { cast: TmdbCastMember[] }
  videos?: { results: TmdbVideo[] }
}

const API_KEY = import.meta.env.VITE_TMDB_API_KEY

export function getPosterUrl(
  path: string | null,
  size: 'w200' | 'w300' | 'w500' = 'w500'
): string | null {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export async function fetchMovieGenres(): Promise<TmdbGenre[]> {
  const res = await fetch(
    `${TMDB_BASE}/genre/movie/list?api_key=${API_KEY}&language=pt-BR`
  )
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
  const data = await res.json()
  return data.genres ?? []
}

function buildDiscoverParams(filters: MovieFilters, page: number): string {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: 'pt-BR',
    page: String(page)
  })
  if (filters.genreId) params.set('with_genres', filters.genreId)
  if (filters.year) params.set('primary_release_year', filters.year)
  if (filters.minRating) params.set('vote_average.gte', filters.minRating)
  return params.toString()
}

export async function discoverMovies(
  filters: MovieFilters,
  page: number
): Promise<TmdbPaginatedResponse<TmdbMovie>> {
  const query = buildDiscoverParams(filters, page)
  const res = await fetch(`${TMDB_BASE}/discover/movie?${query}`)
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
  return res.json()
}

export async function fetchMovieDetails(
  movieId: number
): Promise<TmdbMovieDetailsResponse> {
  const res = await fetch(
    `${TMDB_BASE}/movie/${movieId}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits,videos`
  )
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
  return res.json()
}
