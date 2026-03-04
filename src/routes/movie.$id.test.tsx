import { describe, expect, it, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryWrapper } from '@/test/test-utils'
import { MovieDetailPage } from '@/routes/movie.$id'

const mockFetchMovieDetails = vi.fn()
const mockHas = vi.fn()
const mockAddFromDetails = vi.fn()
const mockRemove = vi.fn()

vi.mock('@/api/tmdb', () => ({
  fetchMovieDetails: (id: number) => mockFetchMovieDetails(id),
  getPosterUrl: (path: string | null) => (path ? `https://image.tmdb.org${path}` : null)
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    React.createElement('a', { href: to }, children),
  useParams: () => ({ id: '42' })
}))

vi.mock('@/stores/use-watchlist-store', () => ({
  useWatchlistStore: () => ({
    has: mockHas,
    addFromDetails: mockAddFromDetails,
    remove: mockRemove
  })
}))

const mockMovieDetails = {
  id: 42,
  title: 'Detail Movie',
  poster_path: '/poster.jpg',
  release_date: '2024-05-10',
  vote_average: 8.2,
  overview: 'A great movie synopsis.',
  genre_ids: [28],
  runtime: 125,
  genres: [{ id: 28, name: 'Ação' }],
  credits: {
    cast: [
      { id: 1, name: 'Actor One', character: 'Hero', profile_path: null },
      { id: 2, name: 'Actor Two', character: 'Villain', profile_path: null }
    ]
  },
  videos: {
    results: [
      { key: 'abc', site: 'YouTube', type: 'Trailer', name: 'Trailer 1' }
    ]
  }
}

function renderMovieDetail() {
  return render(
    <QueryWrapper>
      <MovieDetailPage />
    </QueryWrapper>
  )
}

describe('MovieDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHas.mockReturnValue(false)
    mockFetchMovieDetails.mockResolvedValue(mockMovieDetails)
  })

  it('shows loading state initially', () => {
    mockFetchMovieDetails.mockImplementation(() => new Promise(() => {}))
    renderMovieDetail()
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows error state and Voltar link when fetch fails', async () => {
    mockFetchMovieDetails.mockRejectedValue(new Error('Network error'))
    renderMovieDetail()
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
    const backLink = screen.getByRole('link', { name: /voltar à lista/i })
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/home')
  })

  it('renders movie title, sinopse, cast and rating when loaded', async () => {
    renderMovieDetail()
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Detail Movie' })).toBeInTheDocument()
    })
    expect(screen.getByText(/a great movie synopsis\./i)).toBeInTheDocument()
    expect(screen.getByText(/sinopse/i)).toBeInTheDocument()
    expect(screen.getByText('Actor One')).toBeInTheDocument()
    expect(screen.getByText(/hero/i)).toBeInTheDocument()
    expect(screen.getByText('Actor Two')).toBeInTheDocument()
    expect(screen.getByText(/villain/i)).toBeInTheDocument()
    expect(screen.getByText('8.2')).toBeInTheDocument()
    expect(screen.getByText(/125 min/)).toBeInTheDocument()
    expect(screen.getByText(/ação/i)).toBeInTheDocument()
  })

  it('calls fetchMovieDetails with id from params', async () => {
    renderMovieDetail()
    await waitFor(() => expect(mockFetchMovieDetails).toHaveBeenCalledWith(42))
  })

  it('shows Adicionar à lista button when movie not in watchlist', async () => {
    mockHas.mockReturnValue(false)
    renderMovieDetail()
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Detail Movie' })).toBeInTheDocument())
    const addButton = screen.getByRole('button', { name: /adicionar à lista/i })
    expect(addButton).toBeInTheDocument()
    await userEvent.click(addButton)
    expect(mockAddFromDetails).toHaveBeenCalledWith(mockMovieDetails)
  })

  it('shows Na lista button and calls remove when in watchlist', async () => {
    mockHas.mockReturnValue(true)
    renderMovieDetail()
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Detail Movie' })).toBeInTheDocument())
    const inListButton = screen.getByRole('button', { name: /na lista/i })
    expect(inListButton).toBeInTheDocument()
    await userEvent.click(inListButton)
    expect(mockRemove).toHaveBeenCalledWith(42)
  })
})
