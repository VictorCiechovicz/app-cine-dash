import { describe, expect, it, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryWrapper } from '@/test/test-utils'
import { HomePage } from '@/routes/home'
import { useDashboardStore } from '@/stores/use-dashboard-store'
import type { MovieFilters } from '@/api/tmdb'

const mockDiscoverMovies = vi.fn()
const mockNavigate = vi.fn()
const mockLogout = vi.fn()

vi.mock('@/api/tmdb', () => ({
  discoverMovies: (...args: unknown[]) => mockDiscoverMovies(...args),
  getPosterUrl: (path: string | null) => (path ? `https://image.tmdb.org${path}` : null),
  fetchMovieGenres: () => Promise.resolve([{ id: 28, name: 'Ação' }])
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    React.createElement('a', { href: to }, children),
  useNavigate: () => mockNavigate
}))

vi.mock('@/contexts/use-auth', () => ({
  useAuth: () => ({ logout: mockLogout })
}))

vi.mock('@/hooks/use-debounced-value', () => ({
  useDebouncedValue: (value: MovieFilters) => value
}))

const mockMoviesPage = {
  page: 1,
  total_pages: 1,
  total_results: 2,
  results: [
    {
      id: 1,
      title: 'Movie One',
      poster_path: '/p1.jpg',
      release_date: '2024-01-01',
      vote_average: 8,
      overview: 'Overview 1',
      genre_ids: [28]
    },
    {
      id: 2,
      title: 'Movie Two',
      poster_path: null,
      release_date: '2023-06-15',
      vote_average: 7.5,
      overview: 'Overview 2',
      genre_ids: [12]
    }
  ]
}

function renderHome() {
  return render(
    <QueryWrapper>
      <HomePage />
    </QueryWrapper>
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDiscoverMovies.mockResolvedValue(mockMoviesPage)
    useDashboardStore.getState().reset()
  })

  it('renders header with CineDash, Minha Lista and Sair', () => {
    renderHome()
    expect(screen.getByRole('heading', { name: /cinedash/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /minha lista/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument()
  })

  it('renders Filmes section and filters', () => {
    renderHome()
    expect(screen.getByRole('heading', { name: /filmes/i })).toBeInTheDocument()
    expect(screen.getByText(/filtros/i)).toBeInTheDocument()
  })

  it('shows loading skeletons while fetching', () => {
    mockDiscoverMovies.mockImplementation(() => new Promise(() => {}))
    renderHome()
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows movie cards after successful fetch', async () => {
    renderHome()
    await waitFor(() => expect(mockDiscoverMovies).toHaveBeenCalled(), {
      timeout: 2000
    })
    await waitFor(
      () => {
        expect(screen.getByText('Movie One')).toBeInTheDocument()
        expect(screen.getByText('Movie Two')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('calls discoverMovies with debounced filters', async () => {
    renderHome()
    await waitFor(() => expect(mockDiscoverMovies).toHaveBeenCalled())
    expect(mockDiscoverMovies).toHaveBeenCalledWith(
      expect.objectContaining<MovieFilters>({
        genreId: '',
        year: '',
        minRating: ''
      }),
      1
    )
  })

  it('shows error message when fetch fails', async () => {
    mockDiscoverMovies.mockRejectedValue(new Error('API error'))
    renderHome()
    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar filmes/i)).toBeInTheDocument()
      expect(screen.getByText(/API error/)).toBeInTheDocument()
    })
  })

  it('shows empty message when no results', async () => {
    mockDiscoverMovies.mockResolvedValue({
      page: 1,
      total_pages: 1,
      total_results: 0,
      results: []
    })
    renderHome()
    await waitFor(() => {
      expect(screen.getByText(/nenhum filme encontrado/i)).toBeInTheDocument()
    })
  })

  it('logout button calls logout and navigates to /', async () => {
    const user = userEvent.setup()
    renderHome()
    await waitFor(() => expect(mockDiscoverMovies).toHaveBeenCalled())
    await user.click(screen.getByRole('button', { name: /sair/i }))
    expect(mockLogout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })
})
