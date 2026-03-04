import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'

function TestComponent({ delayMs }: { delayMs: number }) {
  const [value, setValue] = useState('')
  const debounced = useDebouncedValue(value, delayMs)
  return (
    <div>
      <input
        aria-label="input"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <span data-testid="debounced">{debounced}</span>
    </div>
  )
}

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    render(<TestComponent delayMs={500} />)
    expect(screen.getByTestId('debounced')).toHaveTextContent('')
  })

  it('updates debounced value after delay', async () => {
    render(<TestComponent delayMs={400} />)
    const input = screen.getByLabelText('input')
    fireEvent.change(input, { target: { value: 'a' } })
    expect(screen.getByTestId('debounced')).toHaveTextContent('')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })
    expect(screen.getByTestId('debounced')).toHaveTextContent('a')
  })

  it('waits for delay before applying last value when typing quickly', async () => {
    render(<TestComponent delayMs={300} />)
    const input = screen.getByLabelText('input')
    fireEvent.change(input, { target: { value: 'a' } })
    fireEvent.change(input, { target: { value: 'ab' } })
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(screen.getByTestId('debounced')).toHaveTextContent('')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(screen.getByTestId('debounced')).toHaveTextContent('abc')
  })

  it('cancels previous timer when value changes before delay', async () => {
    render(<TestComponent delayMs={500} />)
    const input = screen.getByLabelText('input')
    fireEvent.change(input, { target: { value: 'a' } })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200)
    })
    fireEvent.change(input, { target: { value: 'ab' } })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200)
    })
    expect(screen.getByTestId('debounced')).toHaveTextContent('')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(screen.getByTestId('debounced')).toHaveTextContent('ab')
  })
})
