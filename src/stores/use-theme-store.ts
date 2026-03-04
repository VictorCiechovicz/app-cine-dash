import { persist } from 'zustand/middleware'
import { create } from 'zustand'

export type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const THEME_STORAGE_KEY = 'cinedash-theme'

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      theme: 'light',

      setTheme(theme: Theme) {
        set({ theme })
      },

      toggleTheme() {
        set(state => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        }))
      }
    }),
    { name: THEME_STORAGE_KEY }
  )
)
