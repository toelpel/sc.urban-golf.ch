import { test, expect } from './fixtures'

test.describe('Scorecard (Smoke)', () => {
  const gameId = 'mock-game-alpha-2026'

  test('Ranking-Ansicht zeigt David Huber als Leader (niedrigstes Total)', async ({ page, mockApi }) => {
    void mockApi
    await page.goto(`/games/${gameId}`)

    // Podium
    const podium = page.locator('.podium')
    await expect(podium).toBeVisible()

    // Der mittlere Pillar (rank-1) sollte David enthalten (Total = 8)
    const leaderPillar = podium.locator('.podium__pillar--rank-1')
    await expect(leaderPillar).toContainText('David Huber')
    await expect(leaderPillar.locator('.podium__total')).toHaveText('8')

    // Erstes Element der Rangliste ist der Sieger
    const firstRow = page.locator('.ranking__item').first()
    await expect(firstRow).toContainText('David Huber')
    await expect(firstRow.locator('.ranking__total')).toHaveText('8')
  })

  test('View-Switcher wechselt zwischen Ranking / Horizontal / Vertikal', async ({ page, mockApi }) => {
    void mockApi
    await page.goto(`/games/${gameId}`)

    // Wir wählen bewusst das View-Switch-Segment (aria-label="Ansicht"),
    // nicht das Sortier-Segment in der Ranking-View.
    const segmented = page.getByRole('tablist', { name: 'Ansicht' })
    await expect(segmented).toBeVisible()
    const tabs = segmented.locator('.segmented__item')
    await expect(tabs).toHaveCount(3)

    // Initial: Ranking aktiv
    await expect(page.locator('.podium')).toBeVisible()

    // Wechsel zu Horizontal (2. Tab)
    await tabs.nth(1).click()
    await expect(page.locator('table.scorecard')).toBeVisible()

    // Wechsel zu Vertikal (3. Tab)
    await tabs.nth(2).click()
    await expect(page.locator('table.scorecard')).toBeVisible()
  })

  test('Edit-Button navigiert zum Bearbeiten-Formular', async ({ page, mockApi }) => {
    void mockApi
    await page.goto(`/games/${gameId}`)
    await page.getByRole('button', { name: /Spiel bearbeiten/ }).click()
    await expect(page).toHaveURL(new RegExp(`/games/new/${gameId}$`))
    await expect(page.getByRole('heading', { name: 'Spiel bearbeiten' })).toBeVisible()
  })
})
