import { test, expect } from '../fixtures'

test.describe('Navigation', () => {
  test('home page shows all four navigation buttons', async ({ homePage }) => {
    await homePage.goto()
    await expect(homePage.heading).toBeVisible()
    await expect(homePage.newGameButton).toBeVisible()
    await expect(homePage.gamesButton).toBeVisible()
    await expect(homePage.feedbackButton).toBeVisible()
    await expect(homePage.aboutButton).toBeVisible()
  })

  test('navigate from home to New Game', async ({ homePage, page }) => {
    await homePage.goto()
    await homePage.navigateToNewGame()
    await expect(page).toHaveURL('/games/new')
  })

  test('navigate from home to Games list', async ({ homePage, page }) => {
    await homePage.goto()
    await homePage.navigateToGames()
    await expect(page).toHaveURL('/games')
  })

  test('navigate from home to Feedback', async ({ homePage, page }) => {
    await homePage.goto()
    await homePage.navigateToFeedback()
    await expect(page).toHaveURL('/feedback')
  })

  test('navigate from home to About', async ({ homePage, page }) => {
    await homePage.goto()
    await homePage.navigateToAbout()
    await expect(page).toHaveURL(/\/about/)
  })

  test('header back button is visible on subpages', async ({ page }) => {
    await page.goto('/games')
    const backButton = page.locator('button[aria-label="Go back"]')
    await expect(backButton).toBeVisible()
  })

  test('can navigate back from subpage', async ({ page }) => {
    await page.goto('/')
    await page.locator('a.button-primary', { hasText: 'Feedback' }).click()
    await expect(page).toHaveURL('/feedback')
    await page.locator('button[aria-label="Go back"]').click()
    await expect(page).toHaveURL('/')
  })
})
