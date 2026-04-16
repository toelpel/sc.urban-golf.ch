import { describe, it, expect } from 'vitest'
import { shortGameName, formatDateCH } from './format'

describe('shortGameName', () => {
  it('returns the input when shorter than the max length', () => {
    expect(shortGameName('Kurzer Name')).toBe('Kurzer Name')
  })

  it('truncates and appends ellipsis when over the default max of 24', () => {
    const long = 'Das ist ein sehr sehr langer Spielname'
    const short = shortGameName(long)
    // Implementation: slice(0, maxLength - 3) + '…' → 21 chars + '…' = 22 chars
    expect(short.length).toBe(22)
    expect(short.endsWith('…')).toBe(true)
  })

  it('honors a custom max length', () => {
    // slice(0, 10 - 3) = 'Spiel A' + '…'
    expect(shortGameName('Spiel Alpha Beta', 10)).toBe('Spiel A…')
  })

  it('returns the input when length equals max', () => {
    const name = 'x'.repeat(24)
    expect(shortGameName(name)).toBe(name)
  })
})

describe('formatDateCH', () => {
  it('renders a valid ISO date in Swiss German format', () => {
    const s = formatDateCH('2026-04-12T18:30:00Z')
    // Format includes day, month, year, and time; accept regional flexibility
    expect(s).toMatch(/12/)
    expect(s).toMatch(/2026/)
  })
})
