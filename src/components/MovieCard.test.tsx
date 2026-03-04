import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MovieCard } from '@/components/MovieCard'
import { useWatchlistStore } from '@/stores/use-watchlist-store'
import type { TmdbMovie } from '@/api/tmdb'

const mockAddFromMovie = vi.fn()
const mockRemove = vi.fn()

vi.mock('@tanstack/react-router', () => {
  const React = require('react')
  return {
    Link: ({
      children,
      to,
      params
    }: {
      children: React.ReactNode
      to: string
      params?: { id: string }
    }) =>
      React.createElement(
        'a',
        { href: params ? `/movie/${params.id}` : to },
        children
      )
  }
})

vi.mock('@/api/tmdb', () => ({
  getPosterUrl: (path: string | null) => (path ? `https://image.tmdb.org${path}` : null)
}))

vi.mock('@/stores/use-watchlist-store', () => ({
  useWatchlistStore: vi.fn()
}))

const mockMovie: TmdbMovie = {
  id: 10,
  title: 'Card Movie',
  poster_path: '/card.jpg',
  release_date: '2023-12-25',
  vote_average: 7.8,
  overview: 'Overview',
  genre_ids: [28, 35]
}

describe('MovieCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useWatchlistStore).mockReturnValue({
      has: () => false,
      addFromMovie: mockAddFromMovie,
      remove: mockRemove
    })
  })

  it('renders movie title, year and rating', () => {
    render(<MovieCard movie={mockMovie} />)
    expect(screen.getByText('Card Movie')).toBeInTheDocument()
    expect(screen.getByText('2023')).toBeInTheDocument()
    expect(screen.getByText('7.8')).toBeInTheDocument()
  })

  it('renders link to movie detail page', () => {
    render(<MovieCard movie={mockMovie} />)
    const link = screen.getByRole('link', { name: /card movie/i })
    expect(link).toHaveAttribute('href', '/movie/10')
  })

  it('has add to list button when not in watchlist', () => {
    render(<MovieCard movie={mockMovie} />)
    const addButton = screen.getByRole('button', { name: /adicionar à lista/i })
    expect(addButton).toBeInTheDocument()
  })

  it('clicking add button calls addFromMovie', async () => {
    render(<MovieCard movie={mockMovie} />)
    await userEvent.click(screen.getByRole('button', { name: /adicionar à lista/i }))
    expect(mockAddFromMovie).toHaveBeenCalledWith(mockMovie)
  })

  it('clicking remove button calls remove', async () => {
    vi.mocked(useWatchlistStore).mockReturnValue({
      has: () => true,
      addFromMovie: mockAddFromMovie,
      remove: mockRemove
    })
    render(<MovieCard movie={mockMovie} />)
    await userEvent.click(screen.getByRole('button', { name: /remover da lista/i }))
    expect(mockRemove).toHaveBeenCalledWith(10)
  })
})
