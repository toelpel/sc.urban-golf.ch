import { type Page, type Locator } from '@playwright/test'

export class GamesListPage {
  readonly page: Page
  readonly heading: Locator
  readonly searchInput: Locator
  readonly clearSearchButton: Locator
  readonly gameItems: Locator
  readonly noGamesMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: /Alle Spiele|All Games/ })
    this.searchInput = page.locator('input[type="search"]')
    this.clearSearchButton = page.locator('button[aria-label="Clear search"]')
    this.gameItems = page.locator('.games-list__item--interactive')
    this.noGamesMessage = page.getByText(/Keine Spiele gefunden|No games found/)
  }

  async goto() {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/games') && resp.status() === 200,
      { timeout: 15000 }
    )
    await this.page.goto('/games')
    await this.heading.waitFor()
    await responsePromise
    await this.gameItems.first().waitFor({ timeout: 5000 })
  }

  async search(term: string) {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/games') && resp.status() === 200,
      { timeout: 10000 }
    )
    await this.searchInput.fill(term)
    await responsePromise
  }

  async clearSearch() {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/games') && resp.status() === 200,
      { timeout: 10000 }
    )
    await this.clearSearchButton.click()
    await responsePromise
  }

  async getGameCount(): Promise<number> {
    return this.gameItems.count()
  }

  async clickGame(gameName: string) {
    await this.page.locator('.games-list__item--interactive', { hasText: gameName }).first().click()
  }

  async expandGameDetails(gameName: string) {
    const gameRow = this.page.locator('.games-list__item--interactive', { hasText: gameName }).first()
    await gameRow.locator('.games-list__chevron').click()
  }
}
