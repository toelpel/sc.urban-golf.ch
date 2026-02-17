import { test, expect } from '../fixtures'

/**
 * On mobile, language buttons are inside a dropdown menu (🌐 button).
 * On desktop, they are directly visible in the header.
 */
async function switchLanguage(page: import('@playwright/test').Page, langLabel: string) {
  const globeButton = page.locator('button[aria-label="Change language"]')
  const desktopLangButton = page.locator(`button[aria-label="${langLabel}"]`)

  // Wait for either mobile globe or desktop language buttons to render
  await Promise.race([
    globeButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
    desktopLangButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
  ])

  if (await globeButton.isVisible()) {
    // Mobile: open language dropdown, then pick language
    await globeButton.click()
    await page.locator('.dropdown-item', { hasText: langLabel }).click()
  } else {
    // Desktop: click the language button directly
    await desktopLangButton.click()
  }
}

test.describe('Language Switching', () => {
  test('switch to German', async ({ page }) => {
    await page.goto('/')
    await switchLanguage(page, 'Deutsch')
    await expect(page.locator('a.button-primary').first()).toContainText('Neues Spiel')
  })

  test('switch to French', async ({ page }) => {
    await page.goto('/')
    await switchLanguage(page, 'Français')
    await expect(page.locator('a.button-primary').first()).toContainText('Nouvelle parti')
  })

  test('switch to Dutch', async ({ page }) => {
    await page.goto('/')
    await switchLanguage(page, 'Nederlands')
    await expect(page.locator('h1.maintitle')).toBeVisible()
  })

  test('switch back to English', async ({ page }) => {
    await page.goto('/')
    await switchLanguage(page, 'Deutsch')
    await expect(page.locator('a.button-primary').first()).toContainText('Neues Spiel')

    await switchLanguage(page, 'English')
    await expect(page.locator('a.button-primary').first()).toContainText('New Game')
  })

  test('language persists in localStorage', async ({ page }) => {
    await page.goto('/')
    await switchLanguage(page, 'Deutsch')
    const lang = await page.evaluate(() => localStorage.getItem('language'))
    expect(lang).toBe('de')
  })
})
