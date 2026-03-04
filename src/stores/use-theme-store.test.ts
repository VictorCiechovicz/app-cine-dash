import { beforeEach, describe, expect, it } from 'vitest'
import { useThemeStore } from '@/stores/use-theme-store'

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.getState().setTheme('light')
  })

  it('starts with light theme', () => {
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('setTheme updates theme', () => {
    useThemeStore.getState().setTheme('dark')
    expect(useThemeStore.getState().theme).toBe('dark')
    useThemeStore.getState().setTheme('light')
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('toggleTheme switches between light and dark', () => {
    expect(useThemeStore.getState().theme).toBe('light')
    useThemeStore.getState().toggleTheme()
    expect(useThemeStore.getState().theme).toBe('dark')
    useThemeStore.getState().toggleTheme()
    expect(useThemeStore.getState().theme).toBe('light')
  })
})
