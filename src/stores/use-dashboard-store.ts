import { persist } from 'zustand/middleware'
import { create } from 'zustand'
import type { MovieFilters } from '@/api/tmdb'
import { defaultFilters } from '@/utils/movie-filters-constants'

const STORAGE_KEY = 'cinedash-dashboard'

interface DashboardState {
  filters: MovieFilters
  scrollY: number
  setFilters: (filters: MovieFilters | ((prev: MovieFilters) => MovieFilters)) => void
  resetFilters: () => void
  setScrollY: (y: number) => void
  reset: () => void
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    set => ({
      filters: defaultFilters,
      scrollY: 0,

      setFilters(updater) {
        set(state => ({
          filters: typeof updater === 'function' ? updater(state.filters) : updater
        }))
      },

      resetFilters() {
        set({ filters: defaultFilters })
      },

      setScrollY(y: number) {
        set({ scrollY: y })
      },

      reset() {
        set({ filters: defaultFilters, scrollY: 0 })
      }
    }),
    { name: STORAGE_KEY }
  )
)
