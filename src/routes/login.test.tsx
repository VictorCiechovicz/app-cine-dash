import { describe, expect, it, vi } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from '@/routes/login'

const mockNavigate = vi.fn()
const mockLogin = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to
  }: {
    children: React.ReactNode
    to: string
  }) => React.createElement('a', { href: to }, children),
  useNavigate: () => mockNavigate
}))

vi.mock('@/contexts/use-auth', () => ({
  useAuth: () => ({ login: mockLogin })
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders CineDash title and login form', () => {
    render(<LoginPage />)
    expect(screen.getByRole('heading', { name: /cinedash/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/seu@email.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('does not call login when email is invalid', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    const emailInput = screen.getByPlaceholderText(/seu@email.com/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/)
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    await user.clear(emailInput)
    await user.type(emailInput, 'notanemail')
    await user.clear(passwordInput)
    await user.type(passwordInput, '1234567')
    await user.click(submitButton)
    // Zod validation or native email validation should prevent login
    await waitFor(() => expect(mockLogin).not.toHaveBeenCalled(), {
      timeout: 1500
    })
  })

  it('shows validation error when password has 6 or fewer characters', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByPlaceholderText(/seu@email.com/i), 'test@test.com')
    await user.type(screen.getByPlaceholderText(/••••••••/), '123456')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    expect(screen.getByText(/mais de 6 caracteres/i)).toBeInTheDocument()
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('calls login and navigate when form is valid', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByPlaceholderText(/seu@email.com/i), 'user@example.com')
    await user.type(screen.getByPlaceholderText(/••••••••/), 'password123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    expect(mockLogin).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/home' })
  })

  it('has link to register page', () => {
    render(<LoginPage />)
    const link = screen.getByRole('link', { name: /criar conta/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/register')
  })
})
