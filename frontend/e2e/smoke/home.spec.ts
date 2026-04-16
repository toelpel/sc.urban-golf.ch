import { test, expect } from './fixtures'

test.describe('Home (Smoke)', () => {
  test('zeigt Hero, CTAs und Bottom-Nav', async ({ page, mockApi }) => {
    void mockApi
    await page.goto('/')

    // Hero-Titel
    await expect(page.locator('.home-hero__title')).toHaveText('ScoreCard')

    // Primär-CTAs
    await expect(page.getByRole('link', { name: /Neues Spiel/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /^Spiele$/ })).toBeVisible()

    // Bottom-Nav: 4 Einträge
    const navItems = page.locator('.bottom-nav__item')
    await expect(navItems).toHaveCount(4)
  })

  test('listet Recent-Games aus Mock-API', async ({ page, mockApi }) => {
    void mockApi
    await page.goto('/')
    await expect(page.locator('.home-game-card').first()).toBeVisible({ timeout: 5000 })
    const cards = page.locator('.home-game-card')
    await expect(cards).toHaveCount(2)
    await expect(cards.first()).toContainText('Stadtpark-Runde')
  })

  test('Navigation: Home → Spiele (Bottom-Nav oder Top-Nav)', async ({ page, mockApi, viewport }) => {
    void mockApi
    await page.goto('/')
    // Mobile nutzt Bottom-Nav, Desktop nutzt Top-Bar-Navigation
    const selector = (viewport?.width ?? 0) < 768
      ? page.locator('.bottom-nav__item', { hasText: 'Spiele' })
      : page.locator('.top-bar__nav-link', { hasText: 'Spiele' })
    await selector.click()
    await expect(page).toHaveURL('/games')
    await expect(page.getByRole('heading', { name: 'Alle Spiele' })).toBeVisible()
  })
})
