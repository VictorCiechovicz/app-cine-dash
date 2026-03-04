import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle, ThemeSync } from '@/components/ThemeToggle'
import { useThemeStore } from '@/stores/use-theme-store'

describe('ThemeSync', () => {
  it('applies dark class to document when theme is dark', () => {
    useThemeStore.getState().setTheme('dark')
    render(<ThemeSync />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes dark class when theme is light', () => {
    useThemeStore.getState().setTheme('light')
    render(<ThemeSync />)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

describe('ThemeToggle', () => {
  beforeEach(() => {
    useThemeStore.getState().setTheme('light')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders with aria-label for light theme', () => {
    render(<ThemeToggle />)
    expect(
      screen.getByRole('button', { name: /usar tema escuro/i })
    ).toBeInTheDocument()
  })

  it('shows "Usar tema claro" when theme is dark', () => {
    useThemeStore.getState().setTheme('dark')
    render(<ThemeToggle />)
    expect(
      screen.getByRole('button', { name: /usar tema claro/i })
    ).toBeInTheDocument()
  })

  it('toggles theme on click', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /usar tema escuro/i })
    await user.click(button)
    expect(useThemeStore.getState().theme).toBe('dark')
    await user.click(screen.getByRole('button', { name: /usar tema claro/i }))
    expect(useThemeStore.getState().theme).toBe('light')
  })
})
