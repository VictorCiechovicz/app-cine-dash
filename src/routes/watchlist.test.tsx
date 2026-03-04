import { describe, expect, it, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryWrapper } from '@/test/test-utils'
import { WatchlistPage } from '@/routes/watchlist'
import { useWatchlistStore } from '@/stores/use-watchlist-store'
import type { TmdbMovie } from '@/api/tmdb'

const mockNavigate = vi.fn()
const mockLogout = vi.fn()

vi.mock('@/api/tmdb', () => ({
  fetchMovieGenres: () =>
    Promise.resolve([
      { id: 28, name: 'Ação' },
      { id: 12, name: 'Aventura' }
    ])
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, params }: { children: React.ReactNode; to: string; params?: { id: string } }) =>
    React.createElement('a', { href: params ? `${to.replace('$id', params.id)}` : to }, children),
  useNavigate: () => mockNavigate
}))

vi.mock('@/contexts/use-auth', () => ({
  useAuth: () => ({ logout: mockLogout })
}))

const mockMovie: TmdbMovie = {
  id: 100,
  title: 'Watchlist Movie',
  poster_path: '/x.jpg',
  release_date: '2024-03-01',
  vote_average: 9,
  overview: 'O',
  genre_ids: [28, 12]
}

function renderWatchlist() {
  return render(
    <QueryWrapper>
      <WatchlistPage />
    </QueryWrapper>
  )
}

describe('WatchlistPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useWatchlistStore.getState().reset()
  })

  it('renders header and Minha Lista title', async () => {
    renderWatchlist()
    expect(screen.getByRole('heading', { name: /cinedash/i })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /minha lista/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Filmes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument()
  })

  it('shows empty state when no items', async () => {
    renderWatchlist()
    await screen.findByRole('heading', { name: /minha lista/i })
    expect(screen.getByText(/nenhum filme na lista/i)).toBeInTheDocument()
    expect(screen.getByText(/adicione filmes pela página de filmes/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver filmes/i })).toBeInTheDocument()
  })

  it('shows table with columns when items exist', async () => {
    useWatchlistStore.getState().addFromMovie(mockMovie)
    renderWatchlist()
    await screen.findByText('Watchlist Movie')
    await screen.findByText('9.0', {}, { timeout: 3000 })
    expect(screen.getByRole('columnheader', { name: /título/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /gênero/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /data de lançamento/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /rating/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /ações/i })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: /watchlist movie/i })).toBeInTheDocument()
    expect(screen.getByText('9.0')).toBeInTheDocument()
  })

  it('remove button removes item from list', async () => {
    useWatchlistStore.getState().addFromMovie(mockMovie)
    renderWatchlist()
    await screen.findByText('Watchlist Movie')
    const removeButton = screen.getByRole('button', {
      name: /remover watchlist movie da lista/i
    })
    await userEvent.click(removeButton)
    expect(screen.queryByText('Watchlist Movie')).not.toBeInTheDocument()
    expect(screen.getByText(/nenhum filme na lista/i)).toBeInTheDocument()
  })

  it('sorting by title changes order', async () => {
    const m1: TmdbMovie = { ...mockMovie, id: 1, title: 'Alpha' }
    const m2: TmdbMovie = { ...mockMovie, id: 2, title: 'Beta' }
    useWatchlistStore.getState().addFromMovie(m2)
    useWatchlistStore.getState().addFromMovie(m1)
    renderWatchlist()
    await screen.findByText('Alpha')
    let rows = screen.getAllByRole('row').slice(1)
    expect(rows[0].textContent).toContain('Alpha')
    expect(rows[1].textContent).toContain('Beta')
    const titleHeader = screen.getByRole('button', { name: /título/i })
    await userEvent.click(titleHeader)
    await waitFor(() => {
      rows = screen.getAllByRole('row').slice(1)
      expect(rows[0].textContent).toContain('Beta')
      expect(rows[1].textContent).toContain('Alpha')
    })
  })
})
