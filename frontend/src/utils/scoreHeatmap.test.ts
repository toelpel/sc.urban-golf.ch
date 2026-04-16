import { describe, it, expect } from 'vitest'
import { heatmapClass } from './scoreHeatmap'
import type { ScoreMap } from '@/types'

describe('heatmapClass', () => {
  const playerIds = ['p1', 'p2', 'p3', 'p4']

  function makeScores(rows: Record<string, Record<number, number>>): ScoreMap {
    return rows
  }

  it('returns empty string when score is missing or invalid', () => {
    const scores = makeScores({ p1: {} })
    expect(heatmapClass('p1', 1, scores, playerIds)).toBe('')
  })

  it('returns empty string when fewer than 2 valid scores for the hole', () => {
    const scores = makeScores({ p1: { 1: 4 } })
    expect(heatmapClass('p1', 1, scores, playerIds)).toBe('')
  })

  it('marks a score as great when clearly below the average', () => {
    // avg = 5, diff = 2 - 5 = -3 → great
    const scores = makeScores({
      p1: { 1: 2 },
      p2: { 1: 5 },
      p3: { 1: 5 },
      p4: { 1: 5 },
    })
    expect(heatmapClass('p1', 1, scores, playerIds)).toBe('scorecard-heatmap-great')
  })

  it('marks a score as good when moderately below the average', () => {
    // avg = 4, diff = 3 - 4 = -1 → good (within [-1.5, -0.5])
    const scores = makeScores({
      p1: { 1: 3 },
      p2: { 1: 4 },
      p3: { 1: 4 },
      p4: { 1: 5 },
    })
    expect(heatmapClass('p1', 1, scores, playerIds)).toBe('scorecard-heatmap-good')
  })

  it('marks a score as poor when moderately above the average', () => {
    // avg = 3, diff = 4 - 3 = +1 → poor
    const scores = makeScores({
      p1: { 1: 4 },
      p2: { 1: 3 },
      p3: { 1: 3 },
      p4: { 1: 2 },
    })
    expect(heatmapClass('p1', 1, scores, playerIds)).toBe('scorecard-heatmap-poor')
  })

  it('marks a score as bad when clearly above the average', () => {
    // avg = 3, diff = 6 - 3 = +3 → bad
    const scores = makeScores({
      p1: { 1: 6 },
      p2: { 1: 3 },
      p3: { 1: 3 },
      p4: { 1: 3 },
    })
    expect(heatmapClass('p1', 1, scores, playerIds)).toBe('scorecard-heatmap-bad')
  })

  it('returns no class when score is close to average (|diff| < 0.5)', () => {
    // avg = 3, diff = 3 - 3 = 0 → no class
    const scores = makeScores({
      p1: { 1: 3 },
      p2: { 1: 3 },
      p3: { 1: 3 },
      p4: { 1: 3 },
    })
    expect(heatmapClass('p1', 1, scores, playerIds)).toBe('')
  })

  it('ignores zero and NaN scores when computing hole average', () => {
    const scores = makeScores({
      p1: { 1: 2 },
      p2: { 1: 0 }, // zero is ignored
      p3: { 1: 4 },
      p4: { 1: 4 },
    })
    // avg over {2, 4, 4} = 3.33, diff for p1 = 2 - 3.33 = -1.33 → good
    expect(heatmapClass('p1', 1, scores, playerIds)).toBe('scorecard-heatmap-good')
  })

  it('accepts string score values by parsing to int', () => {
    const scores: ScoreMap = {
      p1: { 1: '2' },
      p2: { 1: '5' },
      p3: { 1: '5' },
      p4: { 1: '5' },
    }
    expect(heatmapClass('p1', 1, scores, playerIds)).toBe('scorecard-heatmap-great')
  })
})
