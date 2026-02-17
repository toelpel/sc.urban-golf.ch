import { type Page, type Locator } from '@playwright/test'

export class ScorecardPage {
  readonly page: Page
  readonly heading: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('h1.maintitle')
  }

  async goto(gameId: string) {
    await this.page.goto(`/games/${gameId}`)
    await this.heading.waitFor()
  }

  async getTitle(): Promise<string> {
    return (await this.heading.textContent()) || ''
  }

  async getPlayerNames(): Promise<string[]> {
    await this.page.waitForSelector('.scorecard-table', { timeout: 10000 })
    const cells = this.page.locator('.scorecard-header-cell, .scorecard-player-cell')
    const names: string[] = []
    const count = await cells.count()
    for (let i = 0; i < count; i++) {
      const text = (await cells.nth(i).textContent())?.trim()
      if (text && !['Hole', 'Total', 'Ø', 'Player'].includes(text) && !/^\d+$/.test(text)) {
        names.push(text)
      }
    }
    return [...new Set(names)]
  }
}
