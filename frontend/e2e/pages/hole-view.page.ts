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
    await this.page.goto(`/games/${gameId}/${hole}`)
    await this.heading.waitFor()
    // Wait for scores to load — the select will have a numeric value once data arrives
    await this.page.locator('select.select-field').first().waitFor()
    // Small wait for Vue reactivity to settle after async data load
    await this.page.waitForTimeout(300)
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
  }

  async goToPreviousHole() {
    await this.page.locator('a.button-primary', { hasText: 'Back' }).click()
  }

  async goToScorecard() {
    await this.page.locator('a.button-primary', { hasText: 'Scorecard' }).click()
  }
}
