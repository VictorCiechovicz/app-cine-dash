import { describe, expect, it, vi } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterPage } from '@/routes/register'

const mockNavigate = vi.fn()
const mockLogin = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    React.createElement('a', { href: to }, children),
  useNavigate: () => mockNavigate
}))

vi.mock('@/contexts/use-auth', () => ({
  useAuth: () => ({ login: mockLogin })
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders CineDash title and register form', () => {
    render(<RegisterPage />)
    expect(
      screen.getByRole('heading', { name: /cinedash/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/crie sua conta/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/seu@email.com/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /criar/i })).toBeInTheDocument()
  })

  it('shows validation error when password has 6 or fewer characters', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.type(
      screen.getByPlaceholderText(/seu@email.com/i),
      'test@test.com'
    )
    await user.type(screen.getByLabelText(/^senha$/i), '123456')
    await user.type(screen.getByLabelText(/confirmar senha/i), '123456')
    await user.click(screen.getByRole('button', { name: /criar/i }))
    expect(screen.getByText(/mais de 6 caracteres/i)).toBeInTheDocument()
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.type(
      screen.getByPlaceholderText(/seu@email.com/i),
      'test@test.com'
    )
    await user.type(screen.getByLabelText(/^senha$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'different456')
    await user.click(screen.getByRole('button', { name: /criar/i }))
    expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument()
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('does not call login when email is invalid', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.type(screen.getByPlaceholderText(/seu@email.com/i), 'notanemail')
    await user.type(screen.getByLabelText(/^senha$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'password123')
    await user.click(screen.getByRole('button', { name: /criar/i }))
    await waitFor(() => expect(mockLogin).not.toHaveBeenCalled(), {
      timeout: 1500
    })
  })

  it('calls login and navigate when form is valid', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.type(
      screen.getByPlaceholderText(/seu@email.com/i),
      'user@example.com'
    )
    await user.type(screen.getByLabelText(/^senha$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'password123')
    await user.click(screen.getByRole('button', { name: /criar/i }))
    expect(mockLogin).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/home' })
  })

  it('has link to login page', () => {
    render(<RegisterPage />)
    const link = screen.getByRole('link', { name: /entrar/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })
})
