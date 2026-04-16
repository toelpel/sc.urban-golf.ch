import { test, expect } from './fixtures'

test.describe('Neues Spiel (Smoke)', () => {
  test('kann neues Spiel mit 2 Spielern erstellen und landet auf Loch 1', async ({ page, mockApi }) => {
    void mockApi
    await page.goto('/games/new')

    await expect(page.getByRole('heading', { name: 'Neues Spiel erstellen' })).toBeVisible()

    // Spielname-Input hat id="game-name" und einen lokalisierten Placeholder
    await page.locator('input#game-name').fill('Testrunde im Park')
    await page.locator('.new-game__player-input').first().fill('Testspieler Eins')

    // Weiteren Spieler hinzufügen
    await page.getByRole('button', { name: /Spieler hinzufügen/ }).click()
    await expect(page.locator('.new-game__player-input')).toHaveCount(2)
    await page.locator('.new-game__player-input').nth(1).fill('Testspieler Zwei')

    // Speichern
    await page.getByRole('button', { name: 'Spiel starten' }).click()
    await page.waitForURL(/\/games\/[^/]+\/1$/)

    // Auf Loch 1
    await expect(page.locator('.hole-header__number')).toHaveText('1')
    await expect(page.locator('.player-tile')).toHaveCount(2)
  })

  test('Add-Button ist deaktiviert bei 10 Spielern', async ({ page, mockApi }) => {
    void mockApi
    await page.goto('/games/new')
    for (let i = 0; i < 9; i++) {
      await page.getByRole('button', { name: /Spieler hinzufügen/ }).click()
    }
    await expect(page.locator('.new-game__player-input')).toHaveCount(10)
    await expect(page.getByRole('button', { name: /Spieler hinzufügen/ })).toBeDisabled()
  })
})
