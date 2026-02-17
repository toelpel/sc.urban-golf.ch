import { test, expect } from '../fixtures'

const GAME_ID = 'e2e_game_existing1'

test.describe('Score Entry', () => {
  test('stepper buttons increment and decrement scores', async ({ holeViewPage }) => {
    await holeViewPage.goto(GAME_ID, 1)

    // Set to a known middle value first to avoid boundary issues from prior tests
    await holeViewPage.setStrokesViaSelect('Alice', 5)

    await holeViewPage.incrementStrokes('Alice')
    const afterIncrement = await holeViewPage.getStrokesForPlayer('Alice')
    expect(Number(afterIncrement)).toBe(6)

    await holeViewPage.decrementStrokes('Alice')
    const afterDecrement = await holeViewPage.getStrokesForPlayer('Alice')
    expect(Number(afterDecrement)).toBe(5)
  })

  test('select dropdown allows direct score entry', async ({ holeViewPage }) => {
    await holeViewPage.goto(GAME_ID, 1)
    await holeViewPage.setStrokesViaSelect('Bob', 7)
    const score = await holeViewPage.getStrokesForPlayer('Bob')
    expect(Number(score)).toBe(7)
  })

  test('score range is bounded between -3 and 15', async ({ holeViewPage }) => {
    await holeViewPage.goto(GAME_ID, 1)

    // Set to minimum
    await holeViewPage.setStrokesViaSelect('Alice', -3)
    await holeViewPage.decrementStrokes('Alice')
    const minScore = await holeViewPage.getStrokesForPlayer('Alice')
    expect(Number(minScore)).toBe(-3)

    // Set to maximum
    await holeViewPage.setStrokesViaSelect('Alice', 15)
    await holeViewPage.incrementStrokes('Alice')
    const maxScore = await holeViewPage.getStrokesForPlayer('Alice')
    expect(Number(maxScore)).toBe(15)
  })

  test('hole navigation with Back/Next buttons', async ({ holeViewPage, page }) => {
    await holeViewPage.goto(GAME_ID, 1)

    await holeViewPage.goToNextHole()
    await expect(page).toHaveURL(new RegExp(`/games/${GAME_ID}/2$`))

    await holeViewPage.goToPreviousHole()
    await expect(page).toHaveURL(new RegExp(`/games/${GAME_ID}/1$`))
  })

  test('hole overview chips are visible by default', async ({ holeViewPage }) => {
    await holeViewPage.goto(GAME_ID, 1)
    // Hole overview is shown by default (showHoleOverview defaults to true)
    await expect(holeViewPage.holeChips.first()).toBeVisible()
  })
})
