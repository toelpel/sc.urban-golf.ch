import { describe, it, expect } from 'vitest'
import { isValidId, isValidEmail, validateScore, validatePlayer, validateGame, validateFeedback } from '../validate.js'

describe('isValidId', () => {
  it('accepts valid nanoid', () => {
    expect(isValidId('abcdefghij1234567890')).toBe(true)
    expect(isValidId('abc_def-ghi12')).toBe(true)
  })
  it('rejects too short', () => {
    expect(isValidId('short')).toBe(false)
  })
  it('rejects too long', () => {
    expect(isValidId('a'.repeat(31))).toBe(false)
  })
  it('rejects special chars', () => {
    expect(isValidId('abc!@#$%^&*()12')).toBe(false)
  })
  it('rejects non-string', () => {
    expect(isValidId(12345)).toBe(false)
    expect(isValidId(null)).toBe(false)
  })
})

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('name+tag@domain.co')).toBe(true)
    expect(isValidEmail('a@b.ch')).toBe(true)
  })
  it('rejects missing @', () => {
    expect(isValidEmail('userexample.com')).toBe(false)
  })
  it('rejects missing domain', () => {
    expect(isValidEmail('user@')).toBe(false)
  })
  it('rejects missing TLD', () => {
    expect(isValidEmail('user@domain')).toBe(false)
  })
  it('rejects spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false)
    expect(isValidEmail('user@ example.com')).toBe(false)
  })
  it('rejects email > 100 chars', () => {
    expect(isValidEmail('a'.repeat(90) + '@example.com')).toBe(false)
  })
  it('rejects non-string', () => {
    expect(isValidEmail(123)).toBe(false)
    expect(isValidEmail(null)).toBe(false)
  })
})

describe('validateScore', () => {
  const validId = 'abcdefghij1234567890'

  it('returns null for valid score', () => {
    expect(validateScore({ game_id: validId, player_id: validId, hole: 1, strokes: 3 })).toBeNull()
  })
  it('rejects hole < 1', () => {
    const errors = validateScore({ game_id: validId, player_id: validId, hole: 0, strokes: 3 })
    expect(errors).toContain('hole must be integer 1-18')
  })
  it('rejects hole > 18', () => {
    const errors = validateScore({ game_id: validId, player_id: validId, hole: 19, strokes: 3 })
    expect(errors).toContain('hole must be integer 1-18')
  })
  it('rejects strokes < -3', () => {
    const errors = validateScore({ game_id: validId, player_id: validId, hole: 1, strokes: -4 })
    expect(errors).toContain('strokes must be integer -3 to 20')
  })
  it('rejects strokes > 20', () => {
    const errors = validateScore({ game_id: validId, player_id: validId, hole: 1, strokes: 21 })
    expect(errors).toContain('strokes must be integer -3 to 20')
  })
  it('accepts boundary values', () => {
    expect(validateScore({ game_id: validId, player_id: validId, hole: 18, strokes: -3 })).toBeNull()
    expect(validateScore({ game_id: validId, player_id: validId, hole: 1, strokes: 20 })).toBeNull()
  })
  it('rejects missing fields', () => {
    const errors = validateScore({})
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('validatePlayer', () => {
  const validId = 'abcdefghij1234567890'

  it('returns null for valid player', () => {
    expect(validatePlayer({ id: validId, name: 'Alice' })).toBeNull()
  })
  it('rejects blank name', () => {
    const errors = validatePlayer({ id: validId, name: '   ' })
    expect(errors).toContain('Player name cannot be blank')
  })
  it('rejects name > 100 chars', () => {
    const errors = validatePlayer({ id: validId, name: 'a'.repeat(101) })
    expect(errors).toContain('Player name must be at most 100 characters')
  })
  it('rejects invalid id', () => {
    const errors = validatePlayer({ id: 'short', name: 'Alice' })
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('validateGame', () => {
  const validId = 'abcdefghij1234567890'

  it('returns null for valid game', () => {
    expect(validateGame({ id: validId, name: 'My Game', players: ['p1'] })).toBeNull()
  })
  it('rejects empty players', () => {
    const errors = validateGame({ id: validId, name: 'Game', players: [] })
    expect(errors).toContain('At least one player required')
  })
  it('rejects blank name', () => {
    const errors = validateGame({ id: validId, name: '', players: ['p1'] })
    expect(errors).toContain('Game name required')
  })
  it('rejects name > 100 chars', () => {
    const errors = validateGame({ id: validId, name: 'a'.repeat(101), players: ['p1'] })
    expect(errors).toContain('Game name must be at most 100 characters')
  })
})

describe('validateFeedback', () => {
  it('returns null for valid feedback', () => {
    expect(validateFeedback({ rating: 5, message: 'Great!' })).toBeNull()
  })
  it('returns null with valid optional email', () => {
    expect(validateFeedback({ rating: 4, message: 'Nice', email: 'user@example.com' })).toBeNull()
  })
  it('ignores empty email string', () => {
    expect(validateFeedback({ rating: 4, message: 'Nice', email: '' })).toBeNull()
  })
  it('ignores null/undefined email', () => {
    expect(validateFeedback({ rating: 4, message: 'Nice', email: null })).toBeNull()
    expect(validateFeedback({ rating: 4, message: 'Nice', email: undefined })).toBeNull()
  })
  it('rejects invalid email format', () => {
    const errors = validateFeedback({ rating: 3, message: 'ok', email: 'not-an-email' })
    expect(errors).toContain('Invalid email format')
  })
  it('rejects email without TLD', () => {
    const errors = validateFeedback({ rating: 3, message: 'ok', email: 'user@domain' })
    expect(errors).toContain('Invalid email format')
  })
  it('rejects rating < 1', () => {
    const errors = validateFeedback({ rating: 0, message: 'ok' })
    expect(errors).toContain('Rating must be 1-5')
  })
  it('rejects rating > 5', () => {
    const errors = validateFeedback({ rating: 6, message: 'ok' })
    expect(errors).toContain('Rating must be 1-5')
  })
  it('rejects empty message', () => {
    const errors = validateFeedback({ rating: 3, message: '' })
    expect(errors).toContain('Message required')
  })
  it('rejects message > 2000 chars', () => {
    const errors = validateFeedback({ rating: 3, message: 'a'.repeat(2001) })
    expect(errors).toContain('Message must be at most 2000 characters')
  })
  it('rejects name > 100 chars', () => {
    const errors = validateFeedback({ rating: 3, message: 'ok', name: 'a'.repeat(101) })
    expect(errors).toContain('Name must be at most 100 characters')
  })
})
