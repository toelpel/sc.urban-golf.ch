import { type Page, type Locator } from '@playwright/test'

export class HoleViewPage {
  readonly page: Page
  readonly heading: Locator
  readonly holeChips: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('h1.maintitle')
    this.holeChips = page.locator('a.rounded-full')
  }

  async goto(gameId: string, hole: number) {
    const responsePromise = this.page.waitForResponse(
      resp => resp.url().includes('/api/games') && resp.status() === 200,
      { timeout: 15000 }
    )
    await this.page.goto(`/games/${gameId}/${hole}`)
    await this.heading.waitFor()
    await responsePromise
    // Wait for scores to render after API response (attached, not visible — on mobile the select may be below the fold)
    await this.page.locator('select.select-field').first().waitFor({ state: 'attached', timeout: 10000 })
  }

  private getPlayerRow(playerName: string) {
    return this.page.locator('.glass-list .card-inner > div', { hasText: playerName })
  }

  async getStrokesForPlayer(playerName: string): Promise<string> {
    const row = this.getPlayerRow(playerName)
    return await row.locator('select').inputValue()
  }

  async incrementStrokes(playerName: string) {
    const row = this.getPlayerRow(playerName)
    await row.locator('button[aria-label="Mehr Schläge"]').click()
  }

  async decrementStrokes(playerName: string) {
    const row = this.getPlayerRow(playerName)
    await row.locator('button[aria-label="Weniger Schläge"]').click()
  }

  async setStrokesViaSelect(playerName: string, value: number) {
    const row = this.getPlayerRow(playerName)
    await row.locator('select').selectOption(String(value))
  }

  async goToNextHole() {
    await this.page.locator('a.button-primary', { hasText: 'Next' }).click()
    await this.page.locator('select.select-field').first().waitFor({ state: 'attached', timeout: 10000 })
  }

  async goToPreviousHole() {
    await this.page.locator('a.button-primary', { hasText: 'Back' }).click()
    await this.page.locator('select.select-field').first().waitFor({ state: 'attached', timeout: 10000 })
  }

  async goToScorecard() {
    await this.page.locator('a.button-primary', { hasText: 'Scorecard' }).click()
  }
}
