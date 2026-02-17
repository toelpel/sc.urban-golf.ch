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
    this.heading = page.locator('h1.maintitle')
    this.searchInput = page.locator('input[type="search"]')
    this.clearSearchButton = page.locator('button[aria-label="Clear search"]')
    this.gameItems = page.locator('li.glass-list')
    this.noGamesMessage = page.getByText('No games found')
  }

  async goto() {
    await this.page.goto('/games')
    await this.heading.waitFor()
  }

  async search(term: string) {
    await this.searchInput.fill(term)
    // Wait for debounced search (300ms in GamesListCompactContent.vue)
    await this.page.waitForTimeout(500)
  }

  async clearSearch() {
    await this.clearSearchButton.click()
    await this.page.waitForTimeout(500)
  }

  async getGameCount(): Promise<number> {
    return this.gameItems.count()
  }

  async clickGame(gameName: string) {
    await this.page.locator('li.glass-list', { hasText: gameName }).first().click()
  }

  async expandGameDetails(gameName: string) {
    const gameRow = this.page.locator('li.glass-list', { hasText: gameName }).first()
    await gameRow.locator('button[aria-label="Expand"], button[aria-label="Collapse"]').click()
  }
}
