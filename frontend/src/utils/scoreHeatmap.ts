import type { ScoreMap } from '@/types'

/**
 * Returns a Tailwind class for heatmap coloring based on how a score
 * compares to the average for that hole across all players.
 */
export function heatmapClass(
  playerId: string,
  hole: number,
  scores: ScoreMap,
  playerIds: string[]
): string {
  const raw = scores[playerId]?.[hole]
  const value = typeof raw === 'number' ? raw : parseInt(String(raw))
  if (isNaN(value) || value === 0) return ''

  const holeScores = playerIds
    .map(id => {
      const s = scores[id]?.[hole]
      return typeof s === 'number' ? s : parseInt(String(s))
    })
    .filter(n => !isNaN(n) && n > 0)

  if (holeScores.length < 2) return ''

  const avg = holeScores.reduce((a, b) => a + b, 0) / holeScores.length
  const diff = value - avg

  // In golf, lower is better — negative diff = good, positive = bad
  if (diff <= -1.5) return 'scorecard-heatmap-great'
  if (diff <= -0.5) return 'scorecard-heatmap-good'
  if (diff >= 1.5) return 'scorecard-heatmap-bad'
  if (diff >= 0.5) return 'scorecard-heatmap-poor'
  return ''
}
