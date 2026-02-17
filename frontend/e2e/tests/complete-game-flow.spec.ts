import { test, expect } from '../fixtures'

test.describe('Complete Game Flow', () => {
  test('create a new game, enter scores, and view scorecard', async ({
    newGamePage,
    holeViewPage,
    page,
  }) => {
    // Step 1: Create a new game
    await newGamePage.goto()
    await newGamePage.fillGameName('E2E Test Round')
    await newGamePage.fillPlayerName(0, 'E2E Player One')
    await newGamePage.addPlayer()
    await newGamePage.fillPlayerName(1, 'E2E Player Two')
    await newGamePage.startGame()

    // Should redirect to hole 1 view
    await expect(page).toHaveURL(/\/games\/[a-zA-Z0-9_-]+\/1$/)

    // Extract gameId from URL
    const url = page.url()
    const gameIdMatch = url.match(/\/games\/([a-zA-Z0-9_-]+)\/1$/)
    expect(gameIdMatch).toBeTruthy()
    const gameId = gameIdMatch![1]

    // Step 2: Verify players visible on hole view
    await expect(page.getByText('E2E Player One')).toBeVisible()
    await expect(page.getByText('E2E Player Two')).toBeVisible()

    // Step 3: Enter scores for hole 1
    await holeViewPage.setStrokesViaSelect('E2E Player One', 3)
    await holeViewPage.setStrokesViaSelect('E2E Player Two', 4)

    // Step 4: Navigate to hole 2
    await holeViewPage.goToNextHole()
    await expect(page).toHaveURL(new RegExp(`/games/${gameId}/2$`))
    // Wait for new hole's data to load
    await page.locator('select.select-field').first().waitFor()
    await page.waitForTimeout(300)

    // Enter scores for hole 2
    await holeViewPage.setStrokesViaSelect('E2E Player One', 2)
    await holeViewPage.setStrokesViaSelect('E2E Player Two', 5)

    // Step 5: View scorecard
    await holeViewPage.goToScorecard()
    await expect(page).toHaveURL(new RegExp(`/games/${gameId}$`))

    // Verify game title appears (async data load may need time)
    await expect(page.locator('h1.maintitle')).toContainText('E2E Test Round', { timeout: 10000 })
  })
})
