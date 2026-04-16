import { type Page, type Locator } from '@playwright/test'

/**
 * Hole-View: Single-Row Player-Tiles mit -/+ Buttons und Score-Button
 * der das Keypad-Sheet öffnet. Kein <select> mehr wie vor dem Redesign.
 */
export class HoleViewPage {
  readonly page: Page
  readonly heading: Locator
  readonly holeChips: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('.hole-header__number')
    this.holeChips = page.locator('.hole-progress__chip')
  }

  async goto(gameId: string, hole: number) {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/api/games') && resp.status() === 200,
      { timeout: 15000 }
    )
    await this.page.goto(`/games/${gameId}/${hole}`)
    await this.heading.waitFor()
    await responsePromise
    await this.page.locator('.player-tile').first().waitFor({ timeout: 10000 })
  }

  private getPlayerRow(playerName: string) {
    return this.page.locator('.player-tile', { hasText: playerName })
  }

  async getStrokesForPlayer(playerName: string): Promise<string> {
    const row = this.getPlayerRow(playerName)
    return (await row.locator('.stroke-value').textContent())?.trim() || ''
  }

  async incrementStrokes(playerName: string) {
    const row = this.getPlayerRow(playerName)
    await row.getByRole('button', { name: /Mehr Schläge|More strokes/ }).click()
  }

  async decrementStrokes(playerName: string) {
    const row = this.getPlayerRow(playerName)
    await row.getByRole('button', { name: /Weniger Schläge|Fewer strokes/ }).click()
  }

  /**
   * Setzt den Score via Keypad-Sheet (Tap auf Score-Zahl öffnet das Sheet).
   */
  async setStrokesViaSelect(playerName: string, value: number) {
    const row = this.getPlayerRow(playerName)
    await row.locator('.stroke-value').click()
    await this.page.locator('.sheet').waitFor({ state: 'visible' })
    await this.page.locator('.keypad__btn', { hasText: new RegExp(`^${value}$`) }).first().click()
    await this.page.locator('.sheet').waitFor({ state: 'hidden' })
  }

  async goToNextHole() {
    await this.page.locator('.hole-foot').getByRole('button', { name: /Weiter|Forward/ }).click()
    await this.page.locator('.player-tile').first().waitFor({ timeout: 10000 })
  }

  async goToPreviousHole() {
    await this.page.locator('.hole-foot').getByRole('button', { name: /Zurück|Back/ }).click()
    await this.page.locator('.player-tile').first().waitFor({ timeout: 10000 })
  }

  async goToScorecard() {
    await this.page.locator('.hole-foot').getByRole('button', { name: /Scorecard/ }).click()
  }
}
