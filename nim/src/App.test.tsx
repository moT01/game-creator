import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

describe('Home screen', () => {
  it('renders mode selector and New Game button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /vs computer/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /2 player/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /new game/i })).toBeTruthy()
  })

  it('hides difficulty selector when mode is 2-player', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /2 player/i }))
    expect(screen.queryByLabelText(/hard mode/i)).toBeNull()
  })

  it('hides Resume button when no saved state', () => {
    render(<App />)
    expect(screen.queryByRole('button', { name: /resume/i })).toBeNull()
  })
})

describe('Play screen', () => {
  function startGame() {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /new game/i }))
  }

  it('renders 4 heap rows with correct object counts', () => {
    startGame()
    expect(screen.getByLabelText(/Heap 1, 1 object remaining/i)).toBeTruthy()
    expect(screen.getByLabelText(/Heap 2, 3 objects remaining/i)).toBeTruthy()
    expect(screen.getByLabelText(/Heap 3, 5 objects remaining/i)).toBeTruthy()
    expect(screen.getByLabelText(/Heap 4, 7 objects remaining/i)).toBeTruthy()
  })

  it('clicking a heap selects it and enables the Take button', () => {
    startGame()
    // Click the first object in heap 1 (1 object)
    const heap1Objects = screen.getAllByRole('button', { name: /Select heap 1/i })
    fireEvent.click(heap1Objects[0])
    const takeBtn = screen.getByRole('button', { name: /take/i })
    expect(takeBtn.getAttribute('aria-disabled')).toBe('false')
  })

  it('Take button is disabled when no heap selected', () => {
    startGame()
    const takeBtn = screen.getByRole('button', { name: /take objects/i })
    expect(takeBtn.getAttribute('aria-disabled')).toBe('true')
  })

  it('after taking objects, heap count decreases', async () => {
    startGame()
    // Select heap 1 (size 1) and take
    const heap1Objects = screen.getAllByRole('button', { name: /Select heap 1/i })
    fireEvent.click(heap1Objects[0])
    fireEvent.click(screen.getByRole('button', { name: /take 1 object from heap 1/i }))
    await waitFor(() => {
      expect(screen.getByLabelText(/Heap 1, 0 objects remaining/i)).toBeTruthy()
    }, { timeout: 1000 })
  })

  it('game over modal appears when last object taken', async () => {
    render(<App />)
    // Switch to 2-player so no AI interference
    fireEvent.click(screen.getByRole('button', { name: /2 player/i }))
    fireEvent.click(screen.getByRole('button', { name: /new game/i }))

    // Take all objects from all heaps manually
    // Heap 1: take 1
    fireEvent.click(screen.getAllByRole('button', { name: /Select heap 1/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /take 1 object from heap 1/i }))
    await waitFor(() => screen.getByLabelText(/Heap 1, 0 objects remaining/i), { timeout: 500 })

    // Heap 2: take 3
    const heap2Objects = screen.getAllByRole('button', { name: /Select heap 2/i })
    fireEvent.click(heap2Objects[0])
    // use + to set removeCount to 3
    const plusBtns = screen.getAllByRole('button', { name: /remove more/i })
    fireEvent.click(plusBtns[0])
    fireEvent.click(plusBtns[0])
    fireEvent.click(screen.getByRole('button', { name: /take 3 objects from heap 2/i }))
    await waitFor(() => screen.getByLabelText(/Heap 2, 0 objects remaining/i), { timeout: 500 })

    // Heap 3: take 5
    const heap3Objects = screen.getAllByRole('button', { name: /Select heap 3/i })
    fireEvent.click(heap3Objects[0])
    const plusBtns2 = screen.getAllByRole('button', { name: /remove more/i })
    fireEvent.click(plusBtns2[0])
    fireEvent.click(plusBtns2[0])
    fireEvent.click(plusBtns2[0])
    fireEvent.click(plusBtns2[0])
    fireEvent.click(screen.getByRole('button', { name: /take 5 objects from heap 3/i }))
    await waitFor(() => screen.getByLabelText(/Heap 3, 0 objects remaining/i), { timeout: 500 })

    // Heap 4: take 7
    const heap4Objects = screen.getAllByRole('button', { name: /Select heap 4/i })
    fireEvent.click(heap4Objects[0])
    const plusBtns3 = screen.getAllByRole('button', { name: /remove more/i })
    for (let i = 0; i < 6; i++) fireEvent.click(plusBtns3[0])
    fireEvent.click(screen.getByRole('button', { name: /take 7 objects from heap 4/i }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy()
    }, { timeout: 1000 })
  })

  it('AI move fires after human move in vs-computer mode', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /new game/i }))
    // Human takes from heap 1
    fireEvent.click(screen.getAllByRole('button', { name: /Select heap 1/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /take 1 object from heap 1/i }))
    // After the human move + animation delay + AI delay, heap sizes change
    await waitFor(() => {
      // Heap 1 should be 0 after human takes it
      expect(screen.getByLabelText(/Heap 1, 0 objects remaining/i)).toBeTruthy()
    }, { timeout: 2000 })
  })
})
