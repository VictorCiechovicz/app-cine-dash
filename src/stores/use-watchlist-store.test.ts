import { describe, expect, it, beforeEach } from 'vitest'
import { useWatchlistStore } from '@/stores/use-watchlist-store'
import type { TmdbMovie, TmdbMovieDetails } from '@/api/tmdb'

const mockMovie: TmdbMovie = {
  id: 1,
  title: 'Test Movie',
  poster_path: '/path.jpg',
  release_date: '2024-01-15',
  vote_average: 8.5,
  overview: 'Overview',
  genre_ids: [28, 12]
}

const mockMovieDetails: TmdbMovieDetails = {
  ...mockMovie,
  runtime: 120,
  genres: [{ id: 28, name: 'Ação' }, { id: 12, name: 'Aventura' }]
}

const mockMovie2: TmdbMovie = {
  id: 2,
  title: 'Another Movie',
  poster_path: null,
  release_date: '2023-06-01',
  vote_average: 7,
  overview: '',
  genre_ids: []
}

describe('useWatchlistStore', () => {
  beforeEach(() => {
    useWatchlistStore.getState().reset()
  })

  it('starts with empty items', () => {
    const { items } = useWatchlistStore.getState()
    expect(items).toEqual([])
  })

  it('adds movie from TmdbMovie and has() returns true', () => {
    const { addFromMovie, has } = useWatchlistStore.getState()
    addFromMovie(mockMovie)
    expect(has(1)).toBe(true)
    const { items } = useWatchlistStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('Test Movie')
    expect(items[0].vote_average).toBe(8.5)
    expect(items[0].genre_ids).toEqual([28, 12])
  })

  it('adds movie from TmdbMovieDetails', () => {
    const { addFromDetails, has } = useWatchlistStore.getState()
    addFromDetails(mockMovieDetails)
    expect(has(1)).toBe(true)
    const { items } = useWatchlistStore.getState()
    expect(items[0].genre_ids).toEqual([28, 12])
  })

  it('does not add duplicate when adding same movie twice', () => {
    const { addFromMovie } = useWatchlistStore.getState()
    addFromMovie(mockMovie)
    addFromMovie(mockMovie)
    expect(useWatchlistStore.getState().items).toHaveLength(1)
  })

  it('removes movie by id', () => {
    const { addFromMovie, remove, has } = useWatchlistStore.getState()
    addFromMovie(mockMovie)
    addFromMovie(mockMovie2)
    expect(useWatchlistStore.getState().items).toHaveLength(2)
    remove(1)
    expect(has(1)).toBe(false)
    expect(has(2)).toBe(true)
    expect(useWatchlistStore.getState().items).toHaveLength(1)
  })

  it('has() returns false for id not in list', () => {
    const { addFromMovie, has } = useWatchlistStore.getState()
    addFromMovie(mockMovie)
    expect(has(99)).toBe(false)
    expect(has(1)).toBe(true)
  })
})
