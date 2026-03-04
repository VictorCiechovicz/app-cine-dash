import { persist } from 'zustand/middleware'
import { create } from 'zustand'
import type { WatchlistItem } from '@/routes/watchlist'
import type { TmdbMovie, TmdbMovieDetails } from '@/api/tmdb'

function movieToItem(movie: TmdbMovie): WatchlistItem {
  return {
    id: movie.id,
    title: movie.title,
    release_date: movie.release_date ?? '',
    vote_average: movie.vote_average,
    genre_ids: movie.genre_ids ?? []
  }
}

function detailsToItem(movie: TmdbMovieDetails): WatchlistItem {
  return {
    id: movie.id,
    title: movie.title,
    release_date: movie.release_date ?? '',
    vote_average: movie.vote_average,
    genre_ids: movie.genres?.map(g => g.id) ?? []
  }
}

interface WatchlistState {
  items: WatchlistItem[]
  addFromMovie: (movie: TmdbMovie) => void
  addFromDetails: (movie: TmdbMovieDetails) => void
  remove: (movieId: number) => void
  has: (movieId: number) => boolean
  reset: () => void
}

const WATCHLIST_STORAGE_KEY = 'cinedash-watchlist'

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addFromMovie(movie: TmdbMovie) {
        if (get().has(movie.id)) return
        set(state => ({
          items: [...state.items, movieToItem(movie)]
        }))
      },

      addFromDetails(movie: TmdbMovieDetails) {
        if (get().has(movie.id)) return
        set(state => ({
          items: [...state.items, detailsToItem(movie)]
        }))
      },

      remove(movieId: number) {
        set(state => ({
          items: state.items.filter(item => item.id !== movieId)
        }))
      },

      has(movieId: number) {
        return get().items.some(item => item.id === movieId)
      },

      reset() {
        set({ items: [] })
      }
    }),
    { name: WATCHLIST_STORAGE_KEY }
  )
)
