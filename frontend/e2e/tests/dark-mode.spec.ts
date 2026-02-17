import { test, expect } from '../fixtures'

/**
 * On mobile, the dark mode toggle is inside the burger menu.
 * On desktop, it is directly visible in the header.
 */
async function toggleDarkMode(page: import('@playwright/test').Page) {
  const desktopToggle = page.locator(
    'button[aria-label="Switch to dark mode"], button[aria-label="Switch to light mode"]'
  )
  const burgerMenu = page.locator('button[aria-label="Open menu"]')

  // Wait for either desktop toggle or mobile burger to be visible
  await Promise.race([
    desktopToggle.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
    burgerMenu.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
  ])

  if (await desktopToggle.first().isVisible()) {
    await desktopToggle.first().click()
  } else {
    // Mobile: open burger menu, then click darkmode
    await burgerMenu.click()
    await page.locator('.dropdown-item', { hasText: 'mode' }).click()
  }
}

test.describe('Dark Mode', () => {
  test('toggle dark mode changes html class', async ({ page }) => {
    await page.goto('/')

    // Get initial state
    const initialClass = await page.locator('html').getAttribute('class') || ''
    const wasLight = !initialClass.includes('dark')

    // Click the toggle
    await toggleDarkMode(page)

    // Verify class changed
    if (wasLight) {
      await expect(page.locator('html')).toHaveClass(/dark/)
    } else {
      await expect(page.locator('html')).not.toHaveClass(/dark/)
    }
  })

  test('dark mode persists in localStorage', async ({ page }) => {
    await page.goto('/')

    // Force light mode
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light')
      document.documentElement.classList.remove('dark')
    })
    await page.reload()

    await toggleDarkMode(page)

    const theme = await page.evaluate(() => localStorage.getItem('theme'))
    expect(theme).toBe('dark')
  })

  test('dark mode persists across pages', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark')
      document.documentElement.classList.add('dark')
    })
    await page.reload()

    await page.goto('/feedback')
    // Wait for Vue to mount and apply theme from localStorage
    await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 5000 })
  })
})
