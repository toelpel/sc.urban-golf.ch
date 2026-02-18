import { test, expect } from '../fixtures'

test.describe('Games List', () => {
  test('displays seeded games', async ({ gamesListPage }) => {
    await gamesListPage.goto()
    await expect(gamesListPage.gameItems.first()).toBeVisible({ timeout: 10000 })
    const count = await gamesListPage.getGameCount()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('search filters games by name', async ({ gamesListPage }) => {
    await gamesListPage.goto()
    await expect(gamesListPage.gameItems.first()).toBeVisible({ timeout: 10000 })

    await gamesListPage.search('Alpha')
    await expect(gamesListPage.page.locator('li.glass-list', { hasText: 'Alpha' }).first()).toBeVisible()
  })

  test('search filters games by player name', async ({ gamesListPage }) => {
    await gamesListPage.goto()
    await expect(gamesListPage.gameItems.first()).toBeVisible({ timeout: 10000 })

    await gamesListPage.search('Alice')
    const count = await gamesListPage.getGameCount()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('clear search restores full list', async ({ gamesListPage }) => {
    await gamesListPage.goto()
    await expect(gamesListPage.gameItems.first()).toBeVisible({ timeout: 10000 })
    const initialCount = await gamesListPage.getGameCount()

    await gamesListPage.search('Alpha')
    await gamesListPage.clearSearch()
    await expect(gamesListPage.gameItems.first()).toBeVisible({ timeout: 10000 })
    await expect.poll(
      () => gamesListPage.getGameCount(),
      { timeout: 10000, message: 'waiting for full game list to restore after clearing search' }
    ).toBeGreaterThanOrEqual(initialCount)
  })

  test('clicking a game navigates to scorecard', async ({ gamesListPage, page }) => {
    await gamesListPage.goto()
    await expect(gamesListPage.gameItems.first()).toBeVisible({ timeout: 10000 })

    await gamesListPage.clickGame('Seeded Game Alpha')
    await expect(page).toHaveURL(/\/games\/e2e_game_existing1$/)
  })

  test('expanding game details shows hole info', async ({ gamesListPage, page }) => {
    await gamesListPage.goto()
    await expect(gamesListPage.gameItems.first()).toBeVisible({ timeout: 10000 })

    await gamesListPage.expandGameDetails('Seeded Game Alpha')
    await expect(page.getByText('Holes Played')).toBeVisible()
  })
})
